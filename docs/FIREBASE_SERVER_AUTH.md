# World Patro · Firebase Server Authentication Setup

The production login page shows “Firebase Web is connected” while the required server credential **FIREBASE_SERVICE_ACCOUNT_JSON_BASE64** is missing. Firebase Web API keys are not Firebase Admin credentials.

## Complete the server setup privately

1. Open **Firebase Console → Project settings → Service accounts** for the **same** project referenced by the Vercel `NEXT_PUBLIC_FIREBASE_PROJECT_ID`.
2. If policy permits service-account keys, generate an Admin SDK private key using the official Firebase console, and keep the downloaded JSON private. Prefer organization-approved secret management or workload identity where available. Never paste it into chat or commit it.
3. Base64-encode the entire JSON file on your own machine (e.g. `base64 -w 0 service-account.json` on Linux, `base64 < service-account.json | tr -d '\\n'` on macOS).
4. In **Vercel → worldpatro → Settings → Environment Variables**, add `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64` as an **encrypted server-only** variable for the intended environments. No `NEXT_PUBLIC_` prefix and no value checked into Git.
5. Confirm the Firebase Authentication Email/Password sign-in provider is enabled, and authorize the production domain under Firebase Auth settings.
6. Deploy the matching World Patro Git commit to production so the new runtime sees the credential. Check `/api/v1/firebase/status`: `firebaseClientConfigured`, `firebaseAdminConfigured` and `firebaseActive` should all be true when `WORLD_PATRO_DATA_BACKEND=firebase`.
7. Test successful login, invalid password, logout, expired/revoked token, role enforcement and user-owned operations. The session API uses httpOnly cookies and a short recent-authentication window.
8. If setup was for testing only, remove unneeded downloaded key material from local devices in accordance with your organization's key-handling policy; maintain rotation and revocation procedures.

## Safe alternative

World Patro supports Supabase Auth as a **distinct provider** if Supabase URL/key exist. The login UI can expose this separately when Firebase Admin is unavailable. A Firebase account does not become a Supabase account automatically. Supabase Auth availability does not mean the required World Patro SQL tables, migrations, and RLS policies are already installed. Do **not** switch production identity providers or migrate account data merely because the page can show a form.

See also `docs/SUPABASE_LIVE_SETUP.md`.

## Security

- Do not put a service-account key in `NEXT_PUBLIC_` variables, GitHub, an issue, or the browser.
- Firebase Admin service-account `project_id` must match the Firebase Web project ID.
- Server cookie creation checks ID token validity/revocation and recent authentication.
- The sign-in browser session uses in-memory persistence and is cleared after obtaining the verified httpOnly server cookie.
- Successful local smoke tests are not proof of production provider availability.
