import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { from, map, Observable, throwError } from 'rxjs';
import { TaskHistory } from '../interfaces/taskHistory.interface';
import { TaskHistoryAction } from '../type/taskHistoryAction.tupe';
import { UserStore } from './user-store';

@Service()
export class TaskHistoryService {
  private readonly supabase = inject(Supabase).client;
  private readonly userStore = inject(UserStore);

  getTaskHistory(taskId: number): Observable<TaskHistory[]> {
    return from(
      this.supabase
        .from('task_history')
        .select(
          `
        *,
        profile:profiles (
          id,
          username,
          avatar_url
        )
      `,
        )
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as unknown as TaskHistory[];
        }),
    );
  }

  addHistory(
    taskId: number,
    action: TaskHistoryAction,
    details: Record<string, unknown>,
  ): Observable<TaskHistory> {
    const userId = this.userStore.userId();

    if (!userId) {
      return throwError(() => new Error('User is not authenticated'));
    }

    return from(
      this.supabase
        .from('task_history')
        .insert({
          task_id: taskId,
          user_id: userId,
          action,
          details,
        })
        .select(
          `
        *,
        profile:profiles (
          id,
          username,
          avatar_url
        )
      `,
        )
        .single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) throw error;
        return data as TaskHistory;
      }),
    );
  }
}
