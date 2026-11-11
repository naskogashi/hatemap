#!/usr/bin/env tsx
/**
 * Build the HateMap SVG geometry from geoBoundaries (OpenStreetMap-derived) municipal boundaries.
 *
 *   cd packages/hatemap && npx tsx scripts/build-kosovo-map.ts
 *
 * Output: src/data/kosovo-map.json
 *   { viewBox, width, height, municipalities: { <key>: { d, cx, cy } } }
 * Coordinates are projected (equirectangular, corrected for latitude) and rounded,
 * so the whole map is a few dozen KB and renders server-side without JavaScript.
 */
import { readFileSync, writeFileSync } from "node:fs";

type Ring = number[][];
type Geom = { type: "Polygon"; coordinates: Ring[] } | { type: "MultiPolygon"; coordinates: Ring[][] };
const src = JSON.parse(readFileSync("scripts/data/geoBoundaries-XKX-ADM2_simplified.geojson", "utf8")) as {
  features: { properties: { shapeName: string }; geometry: Geom }[];
};

const NAME_TO_KEY: Record<string, string> = {
  Partesh: "partesh", Dragash: "dragash", Rahovec: "rahovec", "Shtërpcë": "shterpce", Kamenica: "kamenice",
  "Fushë Kosovë": "fushe_kosove", "Novobërdë": "novoberde", Istog: "istog", Prizren: "prizren", Pristina: "prishtine",
  "Han i Elezit": "hani_elezit", "North Mitrovica": "mitrovice_veriut", Kllokot: "kllokot", Ferizaj: "ferizaj",
  Drenas: "drenas", "Deçan": "decan", Mitrovica: "mitrovice", Podujeva: "podujeve", Suhareka: "suhareke",
  "Kaçanik": "kacanik", Ranillug: "ranillug", Malisheva: "malisheve", Peja: "peje", "Zubin Potok": "zubin_potok",
  Junik: "junik", Viti: "viti", Gjakova: "gjakove", "Zveçan": "zvecan", Klina: "kline", Gjilan: "gjilan",
  Leposaviq: "leposaviq", Gracanica: "gracanice", Mamusha: "mamushe", Vushtrri: "vushtrri", Lipjan: "lipjan",
  Skenderaj: "skenderaj", Obiliq: "obiliq", Shtime: "shtime",
};

const polys = (g: Geom): Ring[][] => (g.type === "Polygon" ? [g.coordinates] : g.coordinates);

// Bounds
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const f of src.features)
  for (const p of polys(f.geometry))
    for (const [lon, lat] of p[0]) {
      minLon = Math.min(minLon, lon); maxLon = Math.max(maxLon, lon);
      minLat = Math.min(minLat, lat); maxLat = Math.max(maxLat, lat);
    }
const k = Math.cos((((minLat + maxLat) / 2) * Math.PI) / 180);
const WIDTH = 600;
const scale = WIDTH / ((maxLon - minLon) * k);
const HEIGHT = Math.round((maxLat - minLat) * scale);
const P = 10; // padding
const proj = ([lon, lat]: number[]) => [((lon - minLon) * k * scale + P), ((maxLat - lat) * scale + P)];
const r1 = (n: number) => Math.round(n * 10) / 10;

function ringArea(r: number[][]) {
  let a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) a += r[j][0] * r[i][1] - r[i][0] * r[j][1];
  return a / 2;
}
function ringCentroid(r: number[][]) {
  let x = 0, y = 0, a = 0;
  for (let i = 0, j = r.length - 1; i < r.length; j = i++) {
    const f = r[j][0] * r[i][1] - r[i][0] * r[j][1];
    x += (r[j][0] + r[i][0]) * f; y += (r[j][1] + r[i][1]) * f; a += f;
  }
  a /= 2;
  return [x / (6 * a), y / (6 * a)];
}

const out: Record<string, { d: string; cx: number; cy: number }> = {};
const missing: string[] = [];
for (const f of src.features) {
  const name = f.properties.shapeName.replace(/^Municipality of /, "");
  const key = NAME_TO_KEY[name];
  if (!key) { missing.push(name); continue; }
  let best: number[][] = [];
  let bestArea = 0;
  const d = polys(f.geometry)
    .map((poly) =>
      poly
        .map((ring) => {
          const pr = ring.map(proj);
          const area = Math.abs(ringArea(pr));
          if (area > bestArea) { bestArea = area; best = pr; }
          return "M" + pr.map(([x, y]) => `${r1(x)} ${r1(y)}`).join("L") + "Z";
        })
        .join(""),
    )
    .join("");
  const [cx, cy] = ringCentroid(best);
  out[key] = { d, cx: r1(cx), cy: r1(cy) };
}
if (missing.length || Object.keys(out).length !== 38) throw new Error(`Unmapped: ${missing.join(", ")} (${Object.keys(out).length}/38)`);

const json = { viewBox: `0 0 ${WIDTH + 2 * P} ${HEIGHT + 2 * P}`, width: WIDTH + 2 * P, height: HEIGHT + 2 * P, attribution: "geoBoundaries / OpenStreetMap (CC BY-SA 2.0)", municipalities: out };
writeFileSync("src/data/kosovo-map.json", JSON.stringify(json));
console.log(`✔ 38 municipalities, viewBox ${json.viewBox}, ${(JSON.stringify(json).length / 1024).toFixed(0)} KB`);
