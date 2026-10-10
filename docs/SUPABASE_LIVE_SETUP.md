# World Patro · Supabase Live Database Activation

Target project: **aouduyqjvdyhdurfonlt** — https://aouduyqjvdyhdurfonlt.supabase.co

## Applied project configuration

Vercel project `worldpatro` has these runtime variables in production, preview and development:

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project HTTPS URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — publishable browser/server key (stored as an encrypted Vercel variable)

This configuration is separate from **live database validation**. It does not establish that the schema exists or that the account owning the project is connected to the Supabase management plugin.

## Activation sequence (no unreviewed data loss)

1. In Supabase, confirm that the project reference is **aouduyqjvdyhdurfonlt**; do not run these migrations on `jhuto-com` or another database.
2. Back up the database and review SQL for existing object conflicts.
3. In Supabase SQL Editor, apply the reviewed schema files in this order:
   - `supabase/migrations/20261009000000_world_patro_core.sql`
   - `supabase/migrations/20261009010000_operational_flows.sql`
   - `supabase/admin_content_schema.sql`
4. Confirm `public.calendar_profiles` exists, is included in the Data API exposed schemas, has `SELECT` grant for `anon`, and has the existing read-only, active-record RLS policy. Never disable RLS as a shortcut.
5. Deploy World Patro with the existing URL and publishable key. Check `GET /api/v1/supabase/status` and the dashboard at `/app/system`. Only `connected: true` plus `status: "connected"` confirms a successful anonymous query to `calendar_profiles`.
6. Test Auth login, user-owned reports, drafts, editorial permissions, administrator app_metadata roles, audit logs and workflow transitions with actual test accounts (positive and negative access tests). Confirm server writes cannot be reached anonymously.
7. `WORLD_PATRO_DATA_BACKEND=supabase` is now selected in Vercel as explicitly requested. Deploy to apply it; production readiness still requires the schema, RLS and sign-in tests above. Preserve any existing Firebase records until separately reviewed for migration/reconciliation.

## Diagnostics

| API status | Meaning | Action |
| --- | --- | --- |
| `connected` | Authenticated with publishable key and completed a reference-table read | Continue private access and admin verification |
| `not-configured` | URL or key absent at runtime | Set both variables and redeploy |
| `invalid-config` | Malformed HTTPS endpoint | Correct project URL |
| `invalid-credentials` | Publishable key rejected | Check project/key pairing |
| `schema-missing` | Reference table not exposed or not found | Apply migrations / Data API schema setup |
| `permission-denied` | Data API grant or RLS denied | Inspect grants/RLS; keep RLS enabled |
| `upstream-error` | Unexpected response from Supabase | Inspect Supabase logs |
| `network-error` | DNS/network timeout | Inspect hosting connection / service status |

## Security invariants

- Do not commit the project key into GitHub, documentation or screenshots.
- A publishable key is designed to be public and **never** grants administrator privileges. Private authorization uses valid user JWTs and row-level security.
- Never put `SUPABASE_SECRET_KEY` or a service-role key in a `NEXT_PUBLIC_` variable.
- Admin roles are issued from trusted Supabase `app_metadata`, not editable user metadata.
- The status endpoint performs only a bounded, read-only request and returns neither credentials nor database rows.
- A successful health probe must not be presented as proof of complete database or operational readiness.

## Identity provider selection

World Patro intentionally displays **Supabase Auth only** at `/login`. Firebase Web configuration must not hijack or block the sign-in page. The obsolete Firebase session creation endpoint rejects requests when Supabase is the selected backend. Neither the previously exposed Firebase service-account JSON nor a Firebase Admin secret is required for Supabase sign-in. Revoke the exposed Firebase key through Google Cloud IAM; never recycle it into production.

## Account recovery and confirmation

The user account flow is exclusively Supabase Auth: `/login` (email/password), `/login/recovery` (password reset email), `/login/new-password` (session-verified new password), `/app/account` (verified account overview and sign out). The `/auth/confirm` callback supports Supabase OTP token hashes and PKCE authorization codes and allows only same-site relative redirect paths.

In the target Supabase project, configure **Authentication → URL Configuration** with production Site URL `https://worldpatro.vercel.app` and allowed redirect destinations for the domain and `/auth/confirm`. Confirm email/registration settings and the applicable email template. Deploy after any Vercel environment variable changes. A successful CI test is not a real Auth email-delivery test.

## Privilege hardening required before private-workspace launch

The fresh-install SQL now limits owner-update privileges on `profiles` (excluding `role`), `notifications` (read/acknowledged timestamps only) and `workflow_orders` (draft fields only). Clients cannot directly set workflow status or create approved orders: transitions must use the audited `transition_workflow_order` RPC.

If the original core schema was already installed, back up the database and review/run `supabase/production_security_hardening.sql` through the **correct project's SQL Editor**. Check effective privileges and test authenticated/anonymous access. This corrective script has NOT been applied or verified against the specified Supabase project.
