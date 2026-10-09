# Firebase backend for World Patro

World Patro can use Firebase as the primary authenticated persistence layer while retaining Supabase as a fallback.

## Why Firestore

Firestore is used instead of Realtime Database because the product needs:
- independent document collections
- queryable user-owned research/workflow data
- server-side Admin SDK access
- Firebase Authentication integration
- a clean migration path for alerts, reports, profiles and research notebooks

## Firebase Console setup

1. Create or select a dedicated Firebase project.
2. Add a Web app.
3. Enable **Authentication → Email/Password**.
4. Create **Firestore Standard edition** in **Production mode**.
5. Create/download a service account for the server.
6. Base64-encode the whole service-account JSON and store it only in Vercel as `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`.
7. Deploy `firestore.rules` and `firestore.indexes.json`.

Do not put the service-account JSON in Git.

## Vercel environment variables

Public:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

Server-only:
- `FIREBASE_SERVICE_ACCOUNT_JSON_BASE64`
- `FIREBASE_SESSION_COOKIE_NAME=worldpatro_session`

Backend selector:
- `WORLD_PATRO_DATA_BACKEND=firebase`

## Security model

The browser uses Firebase Authentication only.
After login, the browser sends a Firebase ID token to `POST /api/auth/firebase-session`.
The server verifies it and creates an HttpOnly session cookie.
Authenticated API routes verify that session cookie through the Admin SDK.

Direct Firestore browser access is denied by `firestore.rules`. All application persistence currently goes through trusted Next.js Route Handlers.

## Firestore hierarchy

```
users/{uid}/
  birthProfiles/{id}
  reports/{id}
  researchNotebooks/{id}
  researchItems/{id}
  watchlists/{id}
  notifications/{id}
  workflowOrders/{id}
  workflowEvents/{id}
  consultations/{id}

public/
  sourceRegistry
  authorityReleases
  religiousObservances
  entities
  events
  claims
  evidence
  articles
  astrologers
```

This user-centric hierarchy avoids cross-user queries for private data and makes authorization explicit at the server API boundary.

## API status

`GET /api/v1/firebase/status` reports whether the public config, Admin credentials and active backend selector are present without exposing any credential values.
