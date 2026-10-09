# Private application data export · limitations

The World Patro Privacy Center supports a bounded user-scoped export across the application collections that currently have accessible backend adapters.

- Firebase: birthProfiles, reports, researchNotebooks, watchlists, notifications, workflowOrders, agentRuns
- Supabase: birth_profiles, saved_reports, research_notebooks, research_items, watchlists, notifications, workflow_orders
- GET /api/v1/account/export?limit=100 (limit 1-100/collection) requires a valid account and queries only the owner's records.
- If any collection has more records than the limit, partial=true and each such collection marks truncated=true.
- If a collection fails, the service does not return an incomplete dataset pretending to be complete.
- No cache, no collection content is emitted in server logs.
- Downloaded JSON is created locally in the browser on explicit click.

**Not a complete portability export**. Other application and provider stores, auth credentials, backups, analytics and logs are outside the current scope. User deletion of specific Kundli report records uses the existing authenticated DELETE /api/v1/reports/{id}. Full account deletion and legal retention control need careful provider-level design and consent steps before release.
