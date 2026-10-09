-- Operational integrity: timestamps, workflow transition machine, audit notifications.

create or replace function private.touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
revoke all on function private.touch_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function private.touch_updated_at();

drop trigger if exists birth_profiles_touch_updated_at on public.birth_profiles;
create trigger birth_profiles_touch_updated_at before update on public.birth_profiles
for each row execute function private.touch_updated_at();

drop trigger if exists research_notebooks_touch_updated_at on public.research_notebooks;
create trigger research_notebooks_touch_updated_at before update on public.research_notebooks
for each row execute function private.touch_updated_at();

drop trigger if exists workflow_orders_touch_updated_at on public.workflow_orders;
create trigger workflow_orders_touch_updated_at before update on public.workflow_orders
for each row execute function private.touch_updated_at();

drop trigger if exists articles_touch_updated_at on public.articles;
create trigger articles_touch_updated_at before update on public.articles
for each row execute function private.touch_updated_at();

create or replace function private.workflow_audit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
begin
  if tg_op = 'INSERT' then
    insert into public.workflow_events(order_id, actor_user_id, event_type, from_status, to_status, payload)
    values(new.id, actor, 'created', null, new.status, jsonb_build_object('priority', new.priority));

    insert into public.notifications(user_id, topic, severity, title, body, provenance)
    values(new.owner_user_id, 'workflow', case when new.priority in ('high','critical') then 'important' else 'notice' end,
      'Workflow created', new.title, jsonb_build_object('order_id', new.id, 'status', new.status));
    return new;
  end if;

  if old.status is distinct from new.status then
    insert into public.workflow_events(order_id, actor_user_id, event_type, from_status, to_status, payload)
    values(new.id, actor, 'status_changed', old.status, new.status, '{}'::jsonb);

    insert into public.notifications(user_id, topic, severity, title, body, provenance)
    values(new.owner_user_id, 'workflow',
      case when new.status in ('verify','closed') then 'important' else 'notice' end,
      'Workflow status changed', new.title || ': ' || old.status || ' → ' || new.status,
      jsonb_build_object('order_id', new.id, 'from', old.status, 'to', new.status));
  end if;
  return new;
end;
$$;
revoke all on function private.workflow_audit() from public, anon, authenticated;

drop trigger if exists workflow_orders_audit on public.workflow_orders;
create trigger workflow_orders_audit
after insert or update of status on public.workflow_orders
for each row execute function private.workflow_audit();

create or replace function public.transition_workflow_order(
  p_order_id uuid,
  p_to_status text,
  p_payload jsonb default '{}'::jsonb
)
returns public.workflow_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_order public.workflow_orders;
  allowed boolean := false;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;

  select * into current_order from public.workflow_orders
  where id = p_order_id and owner_user_id = auth.uid()
  for update;

  if not found then raise exception 'workflow order not found'; end if;

  allowed := case current_order.status
    when 'draft' then p_to_status in ('review','cancelled')
    when 'review' then p_to_status in ('draft','approved','cancelled')
    when 'approved' then p_to_status in ('assigned','cancelled')
    when 'assigned' then p_to_status in ('active','cancelled')
    when 'active' then p_to_status in ('verify','cancelled')
    when 'verify' then p_to_status in ('active','closed')
    when 'closed' then p_to_status in ('archived')
    else false
  end;

  if not allowed then
    raise exception 'invalid workflow transition: % -> %', current_order.status, p_to_status;
  end if;

  update public.workflow_orders
  set status = p_to_status,
      approval_state = coalesce(approval_state,'{}'::jsonb) || coalesce(p_payload,'{}'::jsonb)
  where id = p_order_id
  returning * into current_order;

  return current_order;
end;
$$;

revoke all on function public.transition_workflow_order(uuid,text,jsonb) from public, anon;
grant execute on function public.transition_workflow_order(uuid,text,jsonb) to authenticated;
