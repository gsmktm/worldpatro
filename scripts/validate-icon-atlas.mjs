import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { WORLD_ICON_GROUPS } from "../src/lib/world-iconography.ts";
import { VEDIC_FEATURE_SECTIONS, VEDIC_FEATURE_ICONS } from "../src/lib/vedic-feature-icons.ts";

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
const vectors=readFileSync(new URL("../src/components/ui/world-vector-icon.tsx",import.meta.url),"utf8");
const patro=readFileSync(new URL("../src/components/patro-studio.tsx",import.meta.url),"utf8");
const dashboard=readFileSync(new URL("../src/components/command-center.tsx",import.meta.url),"utf8");
const vedic=readFileSync(new URL("../src/components/vedic-hub.tsx",import.meta.url),"utf8");
assert.match(vectors,/WORLD_ICON_GROUPS\.find/,"Reusable icon component must resolve catalog IDs");
assert.match(vectors,/aria-hidden=/,"Decorative icons must be hidden from assistive tech");
assert.match(patro,/WorldVectorIcon family="calendar"/,"Nine calendars must use new icons");
assert.match(dashboard,/WorldVectorIcon family="calendar"/,"Home calendar lenses must use new icons");
assert.match(vedic,/WorldVectorIcon family="panchang"/,"Panchang must show five original glyphs");
assert.match(vedic,/name=\{c\.id\}/);

assert.match(nav,/slug:"symbols"/);
assert.ok(!atlas.includes("dangerouslySetInnerHTML"),"No untrusted SVG injection");
const expectedVedic={calendar:10,jyotish:16,muhurat:15};
assert.equal(VEDIC_FEATURE_SECTIONS.length,3);
for(const group of VEDIC_FEATURE_SECTIONS)
 assert.equal(group.entries.length,expectedVedic[group.id],"Reference homepage category mismatch");
assert.equal(VEDIC_FEATURE_ICONS.length,41);
const vedicIds=new Set(),vedicPaths=new Set();
const sourceSvg=readFileSync(new URL("../src/components/ui/vedic-feature-icon.tsx",import.meta.url),"utf8");
const directory=readFileSync(new URL("../src/components/vedic-feature-directory.tsx",import.meta.url),"utf8");
for(const icon of VEDIC_FEATURE_ICONS){
 assert.match(icon.id,/^[a-z0-9-]+$/);
 assert.ok(icon.name&&icon.ne&&icon.motif);
 assert.match(icon.path,/^[MmLlHhVvCcSsQqTtAaZz0-9.+,\\s-]+$/);
 assert.ok(icon.path.length>15);
 assert.ok(!vedicIds.has(icon.id),"Duplicate Vedic feature id "+icon.id);
 assert.ok(!vedicPaths.has(icon.path),"Duplicate Vedic feature art "+icon.id);
 vedicIds.add(icon.id);vedicPaths.add(icon.path);
 assert.ok(["available","related","concept"].includes(icon.status));
 if(icon.status==="concept")assert.equal(icon.href,null,"Concept icons must not link to fabricated features");
 else assert.match(icon.href,/^\\/app\\/[a-z0-9-]+$/,"Linked module needs an existing app route");
}
assert.match(sourceSvg,/aria-hidden=\\{label\\?undefined:true\\}/);
assert.match(directory,/VEDIC_FEATURE_SECTIONS\\.map/);
assert.match(directory,/VedicFeatureIcon id=\\{item\\.id\\}/);
assert.match(directory,/item\\.href\\?/,"Unavailable features must not become clickable dead links");
assert.match(atlas,/VEDIC_FEATURE_ICONS\\.map/,"All 41 icons must be reusable in the atlas");
assert.match(vedic,/VedicFeatureDirectory/,"The Vedic day page must render the 41-feature directory");
const total=fullIds.length+zodiacPaths.length+8+VEDIC_FEATURE_ICONS.length;
assert.equal(total,119);
console.log(JSON.stringify({passed:true,categories:8,originalIllustrativeMotifs:fullIds.length,vedicFeatures:41,rashi:zodiacPaths.length,moonPhases:8,total},null,2));
