import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
const source=path=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
const skills=["ponytail","ponytail-review","ponytail-audit","ponytail-debt","ponytail-gain","ponytail-help"];
for(const name of skills){
 const path=".agents/skills/"+name+"/SKILL.md";
 assert.ok(existsSync(new URL("../"+path,import.meta.url)),path+" missing");
 assert.match(source(path),new RegExp("name: "+name+"\\b"),path+" lacks its skill identity");
}
assert.match(source("AGENTS.md"),/\.agents\/skills\/ponytail\/SKILL\.md/);
assert.match(source("docs/third-party/PONYTAIL_LICENSE.txt"),/MIT License/);
const icons=new Set([...source("src/components/ui/icon.tsx").matchAll(/^  ([A-Za-z][A-Za-z0-9]*):\s*</gm)].map(m=>m[1]));
const names=[...source("src/lib/navigation.ts").matchAll(/icon:"([^"]+)"/g)].map(m=>m[1]);
assert.ok(names.length>=25,"Navigation inventory unexpectedly small");
const missing=[...new Set(names)].filter(x=>!icons.has(x));
assert.deepEqual(missing,[],"Navigation icons must exist in local SVG registry");
const month=source("src/components/month-calendar.tsx");
assert.match(month,/aria-current=\{d\.date===today\?"date":undefined\}/,"Today must be accessible");
assert.match(month,/onSelect\(today\)/,"Today shortcut must select the actual date");
assert.match(month,/timeZone:timezone/,"Current day must respect selected location timezone");
assert.match(month,/provenance\.verification==="public-open-dataset"/,"Open BS data must not be styled as municipal authority");
assert.match(source("src/components/command-center.tsx"),/timezone=\{moment\.tz\}/,"Calendar must receive the selected timezone");
const css=source("src/app/styles/observatory.css");
assert.match(css,/\.wp-calendar-days>button\.today:not\(\.selected\)/);
assert.match(css,/\.wp-calendar-days>button small\.open-source/);
console.log(JSON.stringify({passed:true,skills:skills.length,moduleIcons:names.length,distinctIcons:new Set(names).size,today:true,timezone:true,sourceBadges:true},null,2));
