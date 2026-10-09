# Firebase production setup for World Patro

World Patro supports Firebase as the primary auth and persistence backend.

## What is already in the repository

- Firebase Web SDK initialization
- Firebase Authentication UI for email/password
- Firebase Admin SDK initialization for trusted Next.js server routes
- Firestore owner-scoped repository helpers
- Firestore Security Rules v2
- Firestore composite indexes
- Firebase status/health endpoints
- Firebase-first profile and saved-report persistence
- legacy Supabase adapter retained as optional fallback

## One-time Firebase Console setup

1. Create or choose a dedicated Firebase project for World Patro.
2. Create **Cloud Firestore** in Native mode. For Nepal/South Asia latency, choose a supported South Asia location where available. Database location cannot be changed later.
3. Register a **Web app** named `World Patro Web`.
4. Enable **Authentication → Sign-in method → Email/Password**.
5. Copy the Web configuration values into Vercel:
   - NEXT_PUBLIC_FIREBASE_API_KEY
   - NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
   - NEXT_PUBLIC_FIREBASE_PROJECT_ID
   - NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
   - NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
   - NEXT_PUBLIC_FIREBASE_APP_ID
6. Create a service-account key for server-only Admin SDK operations and store its JSON as the encrypted Vercel secret `FIREBASE_SERVICE_ACCOUNT_JSON`.
7. Set `NEXT_PUBLIC_DATABASE_PROVIDER=firebase`.
8. Deploy the repository's `firestore.rules` and `firestore.indexes.json`.

Never expose the service-account JSON, client email/private key, or Admin SDK credentials through `NEXT_PUBLIC_` variables.

## Deploy rules/indexes

After authenticating the Firebase CLI with the intended Google account:

```bash
firebase use <world-patro-project-id>
firebase deploy --only firestore:rules,firestore:indexes
```

The repository's `firebase.json` points to the correct rule/index files.

## Security model

Browser/mobile Firebase clients are constrained by Firestore Security Rules.

User-owned collections require `request.auth.uid == userId`.

Public reference collections are read-only from browsers.

Workflow status transitions, notifications, source ingestion and other privileged writes are intended to run through trusted Next.js server routes with Firebase Admin credentials.

The Firebase Admin SDK bypasses Firestore Security Rules. Therefore IAM/service-account access and server-route authorization are part of the security boundary.

## API authentication

Authenticated World Patro APIs accept a Firebase ID token:

```
Authorization: Bearer <firebase-id-token>
```

The browser helper `firebaseFetch()` injects the current user's token automatically.

## Production verification

After configuration:

1. `GET /api/v1/health` should report:
   - provider: firebase
   - firebaseClientConfigured: true
   - firebaseAdminConfigured: true
2. Create a Firebase Auth test user through `/login`.
3. Save a birth profile.
4. Confirm another user cannot read it in the Firestore Rules Playground.
5. Deploy indexes and verify user report queries.
6. Enable Firebase App Check after the production domain is stable.
