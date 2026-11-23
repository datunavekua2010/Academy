import { describe, expect, it } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { loadReportRows } from '../src/teacher/reportData';

function mockClient({ role = 'teacher', linked = true, user = 'tutor', fail = false, revoked = false } = {}) {
  const queries: string[] = []; let linkChecks = 0;
  const client = { auth: { getUser: async () => ({ data: { user: user ? { id: user } : null }, error: null }) }, from(table: string) {
    queries.push(table); const filters: Record<string, unknown> = {};
    const q = { select: () => q, eq: (key: string, value: unknown) => { filters[key] = value; return q; }, order: () => q,
      maybeSingle: async () => table === 'user_roles' ? { data: role === 'teacher' ? { role } : null, error: null } : { data: linked && (!revoked || ++linkChecks === 1) && filters.student_id === 'child' ? { student_id: 'child' } : null, error: null },
      range: async () => ({ data: fail ? null : [{ student_id: 'child', attempt_id: 'a', grade: 1, topic_id: 't', subunit_id: 's', result: {} }], error: fail ? {} : null }),
    }; return q;
  } } as unknown as SupabaseClient;
  return { client, queries };
}
describe('progress report access', () => {
  it('requires a teacher role and current teacher-student link before reading answers', async () => {
    for (const opts of [{ role: 'parent' }, { role: 'student' }, { linked: false }, { user: '' }, { user: 'other' }]) {
      const { client, queries } = mockClient(opts);
      await expect(loadReportRows(client, 'tutor', 'child')).rejects.toThrow();
      expect(queries).not.toContain('exercise_attempts');
    }
    const { client, queries } = mockClient();
    await expect(loadReportRows(client, 'tutor', 'other-child')).rejects.toThrow();
    expect(queries).not.toContain('exercise_attempts');
  });
  it('fails closed when access is revoked during the read or when the database fails', async () => {
    await expect(loadReportRows(mockClient({ revoked: true }).client, 'tutor', 'child')).rejects.toThrow();
    await expect(loadReportRows(mockClient({ fail: true }).client, 'tutor', 'child')).rejects.toThrow();
  });
  it('reads the selected student after rechecking role and link', async () => {
    const { client, queries } = mockClient();
    expect(await loadReportRows(client, 'tutor', 'child')).toHaveLength(1);
    expect(queries.filter((table) => table === 'teacher_students')).toHaveLength(2);
  });
});
