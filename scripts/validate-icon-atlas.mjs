import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WORLD_ICON_GROUPS } from "../src/lib/world-iconography.ts";

const expected={graha:9,nakshatra:27,calendar:9,panchang:5,tools:8};
assert.equal(WORLD_ICON_GROUPS.length,5);
const fullIds=[],allPaths=[];
for(const group of WORLD_ICON_GROUPS){
 assert.equal(group.entries.length,expected[group.id],"Icon group count mismatch: "+group.id);
 assert.ok(group.title&&group.ne);
 for(const item of group.entries){
   assert.ok(item.id&&item.name&&item.ne&&item.motif&&item.path);
   assert.match(item.id,/^[a-z0-9-]+$/,"Registry icon IDs must be slug-safe");
   assert.match(item.path,/^[MmLlHhVvCcSsQqTtAaZz0-9.+,\s-]+$/,"Unexpected SVG path token: "+item.id);
   assert.ok(item.path.length>10,"A meaningful SVG path is required: "+item.id);
   fullIds.push(group.id+":"+item.id);
   allPaths.push(item.path);
 }
}
assert.equal(new Set(fullIds).size,58);
assert.equal(new Set(allPaths).size,58,"Symbolic path drawings must be unique across research groups");
const zodiac=readFileSync(new URL("../src/components/moon-vectors.tsx",import.meta.url),"utf8");
const rashi=zodiac.split("const RASHI_PATHS=[")[1]?.split("] as const;")[0];
assert.ok(rashi,"Existing zodiac component must stay reusable");
const zodiacPaths=[...rashi.matchAll(/"([^"]+)"/g)].map(match=>match[1]);
assert.equal(zodiacPaths.length,12);
assert.equal(new Set(zodiacPaths).size,12);
const atlas=readFileSync(new URL("../src/components/icon-atlas.tsx",import.meta.url),"utf8");
const nav=readFileSync(new URL("../src/lib/navigation.ts",import.meta.url),"utf8");
const page=readFileSync(new URL("../src/app/app/symbols/page.tsx",import.meta.url),"utf8");
assert.match(atlas,/MOON_PHASES\.map/,"Eight existing lunar phase icons must be reused");
assert.match(atlas,/MOON_RASHIS\.map/,"Twelve original zodiac icons must be reused");
assert.match(atlas,/aria-pressed=\{active===group\}/);
assert.match(atlas,/navigator\.clipboard\.writeText\(markup\)/,"Copy SVG must have a real clipboard action");
assert.match(atlas,/querySelector\("svg"\)/,"SVG copy must use the rendered vector, including Moon gradients");
assert.match(atlas,/aria-label=\{"Copy "/);
assert.match(page,/IconAtlas/);
assert.match(nav,/slug:"symbols"/);
assert.ok(!atlas.includes("dangerouslySetInnerHTML"),"No untrusted SVG injection");
const total=fullIds.length+zodiacPaths.length+8;
assert.equal(total,78);
console.log(JSON.stringify({passed:true,categories:7,originalIllustrativeMotifs:fullIds.length,rashi:zodiacPaths.length,moonPhases:8,total},null,2));
