-- World Patro corrective SQL ONLY for the intended existing Supabase project.
-- Review ownership and backup before applying. For fresh databases use the revised core migration.
begin;
alter table public.profiles enable row level security;
alter table public.notifications enable row level security;
alter table public.workflow_orders enable row level security;
revoke update on public.profiles from authenticated;
revoke update on public.notifications from authenticated;
revoke update,delete on public.workflow_orders from authenticated;
grant select on public.profiles,public.notifications to authenticated;
grant update(display_name,locale,timezone,home_lat,home_lon) on public.profiles to authenticated;
grant update(read_at,acknowledged_at) on public.notifications to authenticated;
grant select,insert on public.workflow_orders to authenticated;
grant update(title,description,priority,jurisdiction,related_entity_id,due_at,requires_human_confirmation,evidence_bundle) on public.workflow_orders to authenticated;
drop policy if exists "workflow orders own" on public.workflow_orders;
drop policy if exists "workflow orders own read" on public.workflow_orders;
drop policy if exists "workflow orders own create draft" on public.workflow_orders;
drop policy if exists "workflow orders own edit draft" on public.workflow_orders;
create policy "workflow orders own read" on public.workflow_orders
for select to authenticated using ((select auth.uid())=owner_user_id);
create policy "workflow orders own create draft" on public.workflow_orders
for insert to authenticated with check ((select auth.uid())=owner_user_id and status='draft' and approval_state='{}'::jsonb);
create policy "workflow orders own edit draft" on public.workflow_orders
for update to authenticated using ((select auth.uid())=owner_user_id and status='draft')
with check ((select auth.uid())=owner_user_id and status='draft');
commit;
-- Verify (expected false):
-- select has_column_privilege('authenticated','public.profiles','role','UPDATE');
-- select has_column_privilege('authenticated','public.workflow_orders','status','UPDATE');
-- select has_table_privilege('authenticated','public.workflow_orders','DELETE');
