import assert from "node:assert/strict";
// Prevent the bug where configured Firebase Web hides the usable Supabase alternative.
const origin = process.env.BASE_URL || "http://127.0.0.1:3100";
const [healthResponse, loginResponse] = await Promise.all([
  fetch(origin + "/api/v1/health", {cache:"no-store"}),
  fetch(origin + "/login", {cache:"no-store"})
]);
assert.equal(healthResponse.status, 200);
assert.equal(loginResponse.status, 200);
const health = await healthResponse.json();
const html = await loginResponse.text();
assert.match(html, /World Patro/i);
if (health.firebase.clientConfigured && !health.firebase.adminConfigured) {
  assert.match(html, /Firebase sign-in needs server setup/);
  assert.doesNotMatch(html, /Create Firebase account/);
  if (health.supabaseConfigured) {
    assert.match(html, /Alternative/);
    assert.match(html, /Sign in with Supabase/);
    assert.match(html, /different identity providers/);
  }
} else if (health.firebase.clientConfigured && health.firebase.adminConfigured) {
  assert.match(html, /Firebase Authentication/);
  assert.match(html, /Sign in with Firebase/);
} else if (health.supabaseConfigured) {
  assert.match(html, /Sign in with Supabase/);
}
console.log("Auth provider availability check passed.");
