// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { clearHomeworkMarker, readHomeworkMarker, rememberHomeworkMarker, resolveHomeworkRequest } from '../src/teacher/homework';
const one='10000000-0000-4000-8000-000000000001', two='10000000-0000-4000-8000-000000000002';
beforeEach(() => sessionStorage.clear()); afterEach(() => {sessionStorage.clear();vi.restoreAllMocks();});
it('does not overwrite or remove another pending request and namespaces markers by teacher', () => {
 rememberHomeworkMarker(sessionStorage,'teacher-a',one);rememberHomeworkMarker(sessionStorage,'teacher-b',two);
 expect(readHomeworkMarker(sessionStorage,'teacher-a')).toBe(one);expect(readHomeworkMarker(sessionStorage,'teacher-b')).toBe(two);
 expect(() => rememberHomeworkMarker(sessionStorage,'teacher-a',two)).toThrow();expect(() => clearHomeworkMarker(sessionStorage,'teacher-a',two)).toThrow();
 expect(readHomeworkMarker(sessionStorage,'teacher-a')).toBe(one);clearHomeworkMarker(sessionStorage,'teacher-a',one);expect(readHomeworkMarker(sessionStorage,'teacher-b')).toBe(two);
});
it('only accepts a terminal response and never silently treats an error as abandoned', async () => {
 const rpc=vi.fn().mockResolvedValueOnce({data:'pending',error:null}).mockResolvedValueOnce({data:'abandoned',error:{message:'failed'}}).mockResolvedValueOnce({data:'published',error:null});
 const client={rpc} as unknown as SupabaseClient;
 await expect(resolveHomeworkRequest(client,one)).rejects.toThrow();await expect(resolveHomeworkRequest(client,one)).rejects.toThrow();await expect(resolveHomeworkRequest(client,one)).resolves.toBe('published');
 expect(rpc).toHaveBeenCalledWith('teacher_homework_resolve',{p_request:one});
});
