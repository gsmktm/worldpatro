# World Patro Administration — secure full-stack content release

## Delivered code
- \`/app/admin\` dashboard with drafts, reviews, publishing, archiving, source and calendar authority registry, religious observance editor, articles and audit history.
- \`GET /api/v1/admin/session\`: 401 unauthenticated / 403 non-admin / 503 missing backend.
- \`GET /api/v1/admin/overview\`: bounded content metrics and latest 50 audit events.
- \`GET|POST /api/v1/admin/content\`: listing and draft creation.
- \`PATCH|DELETE /api/v1/admin/content/:id\`: optimistic version-checked update and **audited soft archive** (not hard delete).
- \`GET /api/v1/content?kind=article|observance|source|authority\`: ONLY published content available to public pages.
- \`/app/learn\` and \`/app/religions\`: published editorial output.
- Version-controlled states: draft → in_review → published → archived; in_review → draft; archived → draft. Full source URL, summary and body required before publication.

## Role and database security
**Firebase preferred.** Admin session verified through Firebase Auth session cookie, then \`FirebaseAdminAuth.getUser(uid).customClaims.worldpatro_role\`. Never trust browser role state, email domain or editable user collection. Grant via a trusted one-time backend administrator using Firebase Admin SDK custom claims. Do **not** create a publicly callable role-grant endpoint. Firestore browser rules remain deny-all; only Next.js Admin SDK calls can access \`adminContent\` and \`adminAudit\`.

**Supabase optional.** The connected Supabase account currently exposes only **jhuto-com**, which must not be changed for this task. A future dedicated World Patro project can apply \`supabase/admin_content_schema.sql\` manually after project identification and review. The SQL enables RLS, limits writes to \`auth.jwt().app_metadata.worldpatro_role=admin\`, allows public reads of published rows, validates state transitions and creates an immutable audit table. Never use \`user_metadata\` for admin roles. Because SQL schema is not applied to any World Patro project, Supabase admin CRUD is currently **migration-ready**, not operational.

**Roles**
- admin: reads and publishes (verified by backend)
- editor/reviewer: oversight read access; no publishing/mutation privileges in this first secure release
- ordinary authenticated user: no admin routes
- anonymous: public, published content only

## Important deployment conditions
- \`WORLD_PATRO_DATA_BACKEND=firebase\` and \`FIREBASE_SERVICE_ACCOUNT_JSON_BASE64\` must be configured server-side for Firebase Admin.
- Assign at least one administrator using a trusted Firebase Admin SDK process; do not promote roles by email or from client.
- Deploy \`firestore.indexes.json\` composite kind+status index before using published collection queries.
- Vercel needs an available deployment allowance and production environment setup.
- Admin records intentionally do not update the deterministic Nepal BS converter. Publishing a calendar authority record is editorial evidence; do not make it an algorithmic conversion table without independent validation.
- Bounded listing and metrics show at most 100 records; cursor pagination, full dataset analytics, backups, staff permissions, user management and consultation booking/admin are later modules.
- We do not claim a complete enterprise admin or working production database until roles, migrations, end-to-end credentials and live deployment are verified.

## Database audit
- Firestore: content create + audit in batch, update + audit in transaction.
- Supabase: RLS-protected insert/update and database triggers append admin_audit_log.
- IDs derive from immutable kind+slug; publication requires source and evidence.
- Writes require same-origin browser integrity, JSON, strict Zod schema and 32 KiB body limit; updates need expectedVersion to prevent overwriting another admin's edit.

Reference: https://supabase.com/docs/guides/database/postgres/row-level-security
