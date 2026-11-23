-- REVIEW ONLY. Parent-only users receive child data through the narrow dashboard
-- RPCs, not direct reads of mutable JSON, profiles or assignments. Independent
-- student/linked-teacher roles retain their own rights. Subscription entitlements
-- are deliberately not implemented. Never applied to live by this file.
begin;
drop policy profiles_read on public.profiles;
create policy profiles_read on public.profiles for select to authenticated using (id=(select auth.uid()) or academy_private.can_teach(id));
drop policy grades_read on public.student_grades;
create policy grades_read on public.student_grades for select to authenticated using ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id));
drop policy assignments_read on public.homework_assignments;
create policy assignments_read on public.homework_assignments for select to authenticated using (
 (assigned_by=(select auth.uid()) and academy_private.can_teach(student_id)) or
 (status='published' and ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id)))
);
drop policy progress_read on public.student_progress;
create policy progress_read on public.student_progress for select to authenticated using ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id));
drop policy rewards_read on public.earned_rewards;
create policy rewards_read on public.earned_rewards for select to authenticated using ((student_id=(select auth.uid()) and academy_private.has_role('student')) or academy_private.can_teach(student_id));
-- Bound the existing parent-visible note feed; tutor-only and unlinked-author
-- notes are still excluded. Grants from the earlier migration stay unchanged.
create or replace function public.parent_published_lesson_notes(p_student_id uuid)
returns table(note_text text, created_at timestamptz, author_name text)
language plpgsql security definer set search_path = '' as $$
begin
  if not academy_private.has_role('parent') or not academy_private.can_view_student(p_student_id) or not exists (
    select 1 from public.parent_students ps where ps.parent_id=(select auth.uid()) and ps.student_id=p_student_id
  ) then raise exception 'Not authorized'; end if;
  return query select n.note_text,n.created_at,p.display_name from public.tutor_lesson_notes n
    join public.profiles p on p.id=n.author_id
    where n.student_id=p_student_id and n.visibility='parent' and n.published_at is not null
      and exists(select 1 from public.teacher_students ts join public.user_roles r on r.user_id=ts.teacher_id and r.role='teacher' where ts.teacher_id=n.author_id and ts.student_id=n.student_id)
    order by n.created_at desc,n.id limit 100;
end; $$;
commit;
