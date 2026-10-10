// Built-server acceptance test: every advertised module route, the module graph,
// and shared input guards. Does not require or modify user database records.
import assert from "node:assert/strict";

const base = process.env.BASE_URL || "http://127.0.0.1:3100";
async function hit(path, init) {
  const response = await fetch(new URL(path, base), { redirect: "manual", ...init });
  return { response, body: await response.text() };
}
async function json(path) {
  const { response, body } = await hit(path);
  assert.equal(response.status, 200, `${path}: HTTP ${response.status}: ${body.slice(0,250)}`);
  return JSON.parse(body);
}

const inventory = await json("/api/v1/platform/modules");
assert.equal(inventory.total, 20, "Expected the full 20-module system");
assert.equal(inventory.modules.length, inventory.total);
assert.equal(new Set(inventory.modules.map(m => m.slug)).size, inventory.total);
assert.equal(inventory.categories.reduce((sum,c) => sum + c.count,0), inventory.total);
assert.equal(inventory.modules.find(m=>m.slug==="wens")?.group, "BALANCE", "WENS must belong to the BALANCE navigation group");
assert.ok(inventory.modules.every(m=>m.group!=="OTHER"), "No module may be orphaned from the navigator");

const basePages = ["/", "/app", "/app/system", "/app/authorities", "/login"];
for (const module of inventory.modules) basePages.push(module.url);
for (const route of new Set(basePages)) {
  const { response, body } = await hit(route);
  assert.equal(response.status, 200, `Broken page ${route}: ${response.status}: ${body.slice(0,250)}`);
  assert.match(body, /World Patro/i, `Page missing app identity: ${route}`);
}
const missing = await hit("/app/not-an-actual-world-patro-module");
assert.equal(missing.response.status, 404, "Unknown modules must not render a misleading placeholder");

const app = await hit("/app");
assert.ok(app.body.includes('href="/app/wens"'), "WENS navigation link missing");
assert.ok(app.body.includes('href="/app/system"'), "System status navigation link missing");
assert.ok(app.body.includes('href="#world-patro-main"'), "Keyboard skip-navigation link missing");
assert.ok(app.body.includes('id="world-patro-main"'), "Accessible main-content target missing");

const registry = new Set(inventory.modules.flatMap(m => m.api));
for (const api of registry) {
  const { response, body } = await hit(api);
  assert.notEqual(response.status, 404, `Advertised API route is missing: ${api}: ${body.slice(0,160)}`);
  assert.notEqual(response.status, 500, `Advertised API route crashed: ${api}: ${body.slice(0,160)}`);
}

const guards = [
  ["/api/v1/research/notebooks", "POST", {title:"Blocked"}],
  ["/api/v1/watchlists", "POST", {name:"Blocked"}],
  ["/api/v1/profiles", "POST", {name:"Blocked"}],
  ["/api/v1/workflows/orders", "POST", {title:"Blocked"}],
  ["/api/auth/firebase-session", "POST", {idToken:"blocked"}],
  ["/api/v1/workflows/orders/validid12345", "PATCH", {status:"review"}]
];
for (const [path, method, payload] of guards) {
  const {response} = await hit(path,{
    method,headers:{"content-type":"application/json","origin":"https://foreign-site.invalid","sec-fetch-site":"cross-site"},
    body:JSON.stringify(payload)
  });
  assert.equal(response.status,403,`Cookie-protected ${method} ${path} must reject cross-origin writes`);
}

const tooLarge = await hit("/api/v1/workflows/orders",{
  method:"POST", headers:{"content-type":"application/json"},
  body:JSON.stringify({title:"X".repeat(8500)})
});
assert.equal(tooLarge.response.status,413,"Oversized workflow body must be rejected");

const invalidId = await hit("/api/v1/workflows/orders/bad!",{
  method:"PATCH",headers:{"content-type":"application/json"},
  body:JSON.stringify({status:"review"})
});
assert.equal(invalidId.response.status,400,"Malformed workflow ID must be rejected");

console.log(`Full-stack route graph passed: ${inventory.total} modules, ${basePages.length} page references, ${registry.size} declared API routes, cross-origin and size guards.`);
