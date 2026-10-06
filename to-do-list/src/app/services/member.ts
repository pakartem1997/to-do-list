import { inject, Service } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Supabase } from './supabase';
import { TaskMember } from '../interfaces/roles.interface';

@Service()
export class MemberService {
  private supabase = inject(Supabase).client;

  getTaskMembers(taskId: number): Observable<TaskMember[]> {
    return from(
      this.supabase
        .from('task_members')
        .select(
          `
        user_id,
        role,
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

          console.log('DATA:', data);
          console.log('FIRST MEMBER:', data[0]);
          console.log('PROFILE:', data[0]?.profiles);

          return data.map((member) => ({
            userId: member.user_id,
            role: member.role,
            // @ts-ignore
            username: member.profiles?.username ?? '',
            // @ts-ignore
            avatarUrl: member.profiles?.avatar_url ?? '',
          }));
        }),
    );
  }

  addMember(taskId: number, userId: string, role: string) {
    return from(
      this.supabase.from('task_members').insert({
        task_id: taskId,
        user_id: userId,
        role,
      }),
    );
  }

  removeMember(taskId: number, userId: string) {
    return from(
      this.supabase.from('task_members').delete().eq('task_id', taskId).eq('user_id', userId),
    );
  }
}
