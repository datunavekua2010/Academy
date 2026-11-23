import { expect, it, vi } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
vi.mock('../src/teacher/homework', () => ({ CONNECTED_HOMEWORK_REVIEW: true }));
import { loadStudentPractice } from '../src/practice/supabaseStore';
import { CURRICULUM } from '../src/practice/curriculum';
it('loads published title and instructions and hides cancelled assignments without discarding attempts', async () => {
 const topic=CURRICULUM[0].topics[0];const sub=topic.units[0].subtopics[0];const common={grade:CURRICULUM[0].grade,topic_id:topic.id,subunit_id:sub.id};
 const rows=[{...common,id:'one',status:'published',title:'Title',instructions:'Instructions',assigned_at:'2026-01-01',due_at:'2099-01-01'}, {...common,id:'two',status:'cancelled',title:'Cancelled',instructions:'',assigned_at:'2026-01-01',due_at:'2099-01-01'}];
 const attempt={...common,attempt_id:'a',assignment_id:'two',result:{id:'a',score:4,correct:1,incorrect:0,finishedAt:'2026-01-01',answers:[]}};
 const client={from(table:string){const q={select:()=>q,eq:()=>q,order:()=>q,range:async()=>({data:table==='homework_assignments'?rows:[attempt],error:null})};return q;}} as unknown as SupabaseClient;
 const result=await loadStudentPractice(client,'student');expect(result.assignments).toHaveLength(1);expect(result.assignments[0]).toMatchObject({id:'one',title:'Title',instructions:'Instructions'});expect(result.attempts[0].assignmentId).toBe('two');
});
