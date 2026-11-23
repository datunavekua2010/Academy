-- REVIEW ONLY. No deployment. Depends on initial, lesson-note, classroom,
-- classroom capacity, classroom codes, link and revocation review migrations.
-- Only the participating operations below use this protocol. Independent privacy,
-- RLS and concurrency review is required before handling real data.
begin;

-- Only invoked inside definer-owned operations; do not expose it as an RPC.
-- Always validate again after the pair lock: revocation may have committed while
-- this operation waited. Hold role/link rows against concurrent row deletion.
create function academy_private.lock_authorized_teacher_pair(p_teacher uuid, p_student uuid)
returns void language plpgsql set search_path = '' as $$
begin
  if p_teacher is null or p_student is null or p_teacher <> (select auth.uid()) or not academy_private.has_role('teacher') then raise exception 'Not authorized'; end if;
  perform academy_private.lock_teacher_student_pair(p_teacher, p_student);
  perform 1 from public.user_roles where user_id=p_teacher and role='teacher' for key share;
  if not found then raise exception 'Not authorized'; end if;
  perform 1 from public.teacher_students where teacher_id=p_teacher and student_id=p_student for key share;
  if not found then raise exception 'Not authorized'; end if;
  perform 1 from public.user_roles where user_id=p_student and role='student' for key share;
  if not found then raise exception 'Not authorized'; end if;
end; $$;
revoke all on function academy_private.lock_authorized_teacher_pair(uuid,uuid) from public, anon, authenticated, service_role;

-- RLS continues to apply. This row trigger serializes authenticated assignment
-- writes with link revocation and forbids changing author or student by UPDATE.
-- Null auth.uid (including unimpersonated service/superuser writes) fails closed;
-- controlled imports require a separately reviewed administrative workflow.
create function academy_private.guard_teacher_assignment_write()
returns trigger language plpgsql security definer set search_path = '' as $$
declare teacher uuid; student uuid;
begin
  if tg_op = 'INSERT' then
    teacher := new.assigned_by; student := new.student_id;
  else
    teacher := old.assigned_by; student := old.student_id;
    if tg_op = 'UPDATE' and (new.assigned_by is distinct from old.assigned_by or new.student_id is distinct from old.student_id) then
      raise exception 'Assignment owner and student cannot be changed';
    end if;
  end if;
  perform academy_private.lock_authorized_teacher_pair(teacher,student);
  if tg_op = 'DELETE' then return old; end if;
  return new;
end; $$;
revoke all on function academy_private.guard_teacher_assignment_write() from public, anon, authenticated, service_role;
create trigger guard_teacher_assignment_write before insert or update or delete on public.homework_assignments
for each row execute function academy_private.guard_teacher_assignment_write();

create or replace function public.tutor_lesson_note_save(p_student_id uuid, p_note_id uuid, p_note_text text, p_visibility text, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  perform academy_private.lock_authorized_teacher_pair((select auth.uid()), p_student_id);
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

create or replace function public.tutor_lesson_note_set_publication(p_student_id uuid, p_note_id uuid, p_publish boolean, p_expected_revision bigint)
returns setof public.tutor_lesson_notes
language plpgsql security definer set search_path = '' as $$
declare result public.tutor_lesson_notes;
begin
  perform academy_private.lock_authorized_teacher_pair((select auth.uid()), p_student_id);
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

create or replace function public.tutor_lesson_note_delete(p_student_id uuid, p_note_id uuid, p_expected_revision bigint)
returns boolean language plpgsql security definer set search_path = '' as $$
begin
  perform academy_private.lock_authorized_teacher_pair((select auth.uid()), p_student_id);
  delete from public.tutor_lesson_notes n where n.id = p_note_id and n.student_id = p_student_id
    and n.author_id = (select auth.uid()) and n.revision = p_expected_revision;
  if not found then raise exception 'Note unavailable or changed'; end if;
  return true;
end;
$$;

commit;
