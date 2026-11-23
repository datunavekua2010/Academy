-- REVIEW ONLY. Do not apply until the schema, RLS, retention and rollout are approved.
-- All access is through narrowly scoped functions; no client may read the table directly.
begin;

create table public.tutor_lesson_notes (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  author_id uuid not null references public.profiles(id) on delete cascade,
  note_text text not null check (char_length(note_text) <= 2000 and note_text ~ '[^[:space:]]'),
  visibility text not null check (visibility in ('tutor', 'parent')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  revision bigint not null default 1 check (revision > 0),
  check (visibility = 'parent' or published_at is null)
);
create index tutor_lesson_notes_author_student_created on public.tutor_lesson_notes(author_id, student_id, created_at desc, id);
create index tutor_lesson_notes_parent_student_created on public.tutor_lesson_notes(student_id, created_at desc) where visibility = 'parent' and published_at is not null;
alter table public.tutor_lesson_notes enable row level security;
-- No table grants or policies: parents must never be able to request private columns.
revoke all on public.tutor_lesson_notes from public, anon, authenticated;

create function public.tutor_lesson_notes_list(p_student_id uuid)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  return query select n.* from public.tutor_lesson_notes n
    where n.student_id = p_student_id and n.author_id = (select auth.uid())
    order by n.created_at desc, n.id;
end;
$$;

-- Saves always create a draft. Any edit of published content revokes its publication.
create function public.tutor_lesson_note_save(p_student_id uuid, p_note_id uuid, p_note_text text, p_visibility text, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  if p_note_text is null or char_length(p_note_text) > 2000 or p_note_text !~ '[^[:space:]]' or p_visibility is null or p_visibility not in ('tutor', 'parent') then raise exception 'Invalid note'; end if;
  if p_note_id is null then
    if p_expected_revision is not null then raise exception 'Invalid revision'; end if;
    insert into public.tutor_lesson_notes(student_id, author_id, note_text, visibility)
      values(p_student_id, (select auth.uid()), p_note_text, p_visibility) returning * into result;
  else
    update public.tutor_lesson_notes n set note_text = p_note_text, visibility = p_visibility,
      published_at = null, updated_at = clock_timestamp(), revision = n.revision + 1
      where n.id = p_note_id and n.student_id = p_student_id and n.author_id = (select auth.uid()) and n.revision = p_expected_revision
      returning n.* into result;
    if not found then raise exception 'Note unavailable or changed'; end if;
  end if;
  return next result;
end;
$$;

create function public.tutor_lesson_note_set_publication(p_student_id uuid, p_note_id uuid, p_publish boolean, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  if p_publish is null then raise exception 'Invalid action'; end if;
  select n.* into result from public.tutor_lesson_notes n
    where n.id = p_note_id and n.student_id = p_student_id and n.author_id = (select auth.uid()) for update;
  if not found or result.revision <> p_expected_revision or p_expected_revision is null then raise exception 'Note unavailable or changed'; end if;
  if p_publish and result.visibility <> 'parent' then raise exception 'Note not parent-visible'; end if;
  if (p_publish and result.published_at is null) or (not p_publish and result.published_at is not null) then
    update public.tutor_lesson_notes n set published_at = case when p_publish then clock_timestamp() else null end,
      updated_at = clock_timestamp(), revision = n.revision + 1 where n.id = result.id returning n.* into result;
  end if;
  return next result;
end;
$$;

create function public.tutor_lesson_note_delete(p_student_id uuid, p_note_id uuid, p_expected_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.can_teach(p_student_id) then raise exception 'Not authorized'; end if;
  delete from public.tutor_lesson_notes n where n.id = p_note_id and n.student_id = p_student_id
    and n.author_id = (select auth.uid()) and n.revision = p_expected_revision;
  if not found then raise exception 'Note unavailable or changed'; end if;
  return true;
end;
$$;

-- This is the only parent-facing API. No IDs, draft content or internal metadata are returned.
create function public.parent_published_lesson_notes(p_student_id uuid)
returns table(note_text text, created_at timestamptz, author_name text)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('parent') or not exists (
    select 1 from public.parent_students ps where ps.parent_id = (select auth.uid()) and ps.student_id = p_student_id
  ) then raise exception 'Not authorized'; end if;
  return query select n.note_text, n.created_at, p.display_name from public.tutor_lesson_notes n
    join public.profiles p on p.id = n.author_id
    where n.student_id = p_student_id and n.visibility = 'parent' and n.published_at is not null
      and exists (select 1 from public.teacher_students ts join public.user_roles r on r.user_id = ts.teacher_id and r.role = 'teacher' where ts.teacher_id = n.author_id and ts.student_id = n.student_id)
    order by n.created_at desc, n.id;
end;
$$;

revoke all on function public.tutor_lesson_notes_list(uuid), public.tutor_lesson_note_save(uuid,uuid,text,text,bigint), public.tutor_lesson_note_set_publication(uuid,uuid,boolean,bigint), public.tutor_lesson_note_delete(uuid,uuid,bigint), public.parent_published_lesson_notes(uuid) from public, anon, authenticated;
grant execute on function public.tutor_lesson_notes_list(uuid), public.tutor_lesson_note_save(uuid,uuid,text,text,bigint), public.tutor_lesson_note_set_publication(uuid,uuid,boolean,bigint), public.tutor_lesson_note_delete(uuid,uuid,bigint), public.parent_published_lesson_notes(uuid) to authenticated;
commit;
