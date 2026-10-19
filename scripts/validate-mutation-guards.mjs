import assert from "node:assert/strict";

// Negative-route tests are deliberately independent of any live database,
// real user account, or environment secrets.
const origin = process.env.BASE_URL || "http://127.0.0.1:3100";
const profile = origin + "/api/v1/profiles/550e8400-e29b-41d4-a716-446655440000";
const notification = origin + "/api/v1/notifications/550e8400-e29b-41d4-a716-446655440000";

async function expectStatus(label, url, init, status) {
  const response = await fetch(url, init);
  assert.equal(response.status, status, label + " returned " + response.status + " (expected " + status + ")");
  const payload = await response.json();
  assert.equal(typeof payload.error, "string", label + " must return a JSON error");
}
const json = { "content-type": "application/json" };
const otherOrigin = { ...json, origin: "https://example.invalid" };

await expectStatus("profile PATCH blocks cross-origin", profile,
  { method: "PATCH", headers: otherOrigin, body: '{"name":"blocked"}' }, 403);
await expectStatus("profile DELETE blocks cross-origin", profile,
  { method: "DELETE", headers: { origin: "https://example.invalid" } }, 403);
await expectStatus("profile PATCH rejects malformed JSON", profile,
  { method: "PATCH", headers: json, body: "{malformed" }, 400);
await expectStatus("profile PATCH rejects empty changes", profile,
  { method: "PATCH", headers: json, body: "{}" }, 400);
await expectStatus("profile PATCH caps body", profile,
  { method: "PATCH", headers: json, body: JSON.stringify({ name: "x".repeat(10000) }) }, 413);
await expectStatus("notification PATCH blocks cross-origin", notification,
  { method: "PATCH", headers: otherOrigin, body: '{"read":true}' }, 403);
await expectStatus("notification PATCH rejects malformed JSON", notification,
  { method: "PATCH", headers: json, body: "{malformed" }, 400);
await expectStatus("notification PATCH caps body", notification,
  { method: "PATCH", headers: json, body: JSON.stringify({ read: true, text: "x".repeat(5000) }) }, 413);

const calendar = origin + "/api/v1/calendar/convert";
const wbe = origin + "/api/v1/wbe/assess";
await expectStatus("calendar calculation rejects non-JSON", calendar,
  { method: "POST", headers: { "content-type": "text/plain" }, body: "no" }, 415);
await expectStatus("calendar calculation rejects oversize JSON", calendar,
  { method: "POST", headers: json, body: JSON.stringify({ date: "2026-10-19", padding: "x".repeat(5000) }) }, 413);
await expectStatus("WBE assessment rejects invalid scores", wbe,
  { method: "POST", headers: json, body: JSON.stringify({ scores: [1,2] }) }, 400);
await expectStatus("WBE assessment rejects oversize JSON", wbe,
  { method: "POST", headers: json, body: JSON.stringify({ scores: Array(9).fill(5), padding: "x".repeat(5000) }) }, 413);

console.log("Account and public calculator JSON guard regression checks passed.");
