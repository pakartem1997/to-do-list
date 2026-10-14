import { inject, Service } from '@angular/core';
import { from, Observable } from 'rxjs';
import { Supabase } from './supabase';
import { TaskMember } from '../interfaces/roles.interface';
import { Roles } from '../constants/roles.constants';
import { TaskMemberWithProfile } from '../type/taskMemberWithProfile.type';

@Service()
export class MemberService {
  private supabase = inject(Supabase).client;

  getTaskMembers(taskId: number): Observable<TaskMemberWithProfile[]> {
    return from(
      this.supabase
        .from('task_members')
        .select(
          `
        *,
        profiles (
          username,
          avatar_url
        )
      `,
        )
        .eq('task_id', taskId)
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data;
        }),
    );
  }

  addMember(taskId: number, userId: string, role: Roles): Observable<TaskMember> {
    return from(
      this.supabase
        .from('task_members')
        .insert({
          task_id: taskId,
          user_id: userId,
          role,
        })
        .select()
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            throw error;
          }

          return data;
        }),
    );
  }

  removeMember(id: number): Observable<void> {
    return from(
      this.supabase
        .from('task_members')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) {
            throw error;
          }
        }),
    );
  }
}
