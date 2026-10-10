import assert from "node:assert/strict";

const origin = process.env.BASE_URL || "http://127.0.0.1:3100";
const [healthResponse, loginResponse, firebaseResponse, recoveryResponse, accountResponse] = await Promise.all([
  fetch(origin + "/api/v1/health", {cache:"no-store"}),
  fetch(origin + "/login", {cache:"no-store"}),
  fetch(origin + "/login/recovery", {cache:"no-store"}),
  fetch(origin + "/app/account", {cache:"no-store"}),
  fetch(origin + "/api/auth/firebase-session", {
    method: "POST",
    headers: {"content-type":"application/json"},
    body: JSON.stringify({idToken:"not-a-real-firebase-token"})
  })
]);
assert.equal(healthResponse.status, 200);
assert.equal(loginResponse.status, 200);
assert.equal(recoveryResponse.status, 200);
assert.equal(accountResponse.status, 200);
const health = await healthResponse.json();
const html = await loginResponse.text();
assert.match(html, /World Patro/i);
assert.match(html, /SUPABASE/i);
assert.match(html, /Forgot password/);
assert.match(await recoveryResponse.text(), /Send recovery link/);
assert.match(await accountResponse.text(), /World Patro account/i);
assert.doesNotMatch(html, /Firebase Web is configured|Firebase sign-in needs server setup|Sign in with Firebase|Create Firebase account/);
if (health.supabaseConfigured) {
  assert.match(html, /Powered by Supabase Authentication/);
  assert.match(html, /Sign in/);
  assert.match(html, /Create account/);
} else {
  assert.match(html, /Supabase authentication is not configured/);
}
if (!health.firebase.adminConfigured || health.dataBackend !== "firebase") {
  assert.equal(firebaseResponse.status, 503, "Inactive Firebase sessions must not be usable");
}
console.log("Supabase-first authentication and Firebase session deactivation checks passed.");
