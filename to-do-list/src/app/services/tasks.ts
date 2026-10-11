import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { from, Observable } from 'rxjs';
import { Task } from '../interfaces/task.interface';
import { TodoStatus } from '../type/todo-status.type';
import { CreateTask } from '../interfaces/create-task.interface';

@Service()
export class TasksService {
  private supabase = inject(Supabase).client;

  getTasks(): Observable<Task[]> {
    return from(
      this.supabase
        .from('tasks')
        .select(
          `
        *,
        task_members (*)
      `,
        )
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }
          return data as unknown as Task[];
        }),
    );
  }

  getTask(id: number): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as Task;
        }),
    );
  }

  editTask(id: number, text: string): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .update({ text })
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as Task;
        }),
    );
  }

  editDescription(id: number, description: string): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .update({ description })
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as Task;
        }),
    );
  }

  addTask(task: CreateTask): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .insert({
          text: task.text,
          description: task.description,
          status: task.status,
          order: task.order,
        })
        .select()
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            throw error;
          }

          const { error: membersError } = await this.supabase.from('task_members').insert(
            task.task_members.map((member) => ({
              task_id: data.id,
              user_id: member.user_id,
              role: member.role,
            })),
          );

          if (membersError) {
            throw membersError;
          }

          return {
            ...data,
            roles: task.task_members.map((member) => ({
              user_id: member.user_id,
              role: member.role,
            })),
          } as Task;
        }),
    );
  }
  changeTaskOrder(tasks: Pick<Task, 'id' | 'order'>[]): Observable<Task[]> {
    return from(
      Promise.all(
        tasks.map(async (task) => {
          const { data, error } = await this.supabase
            .from('tasks')
            .update({ order: task.order })
            .eq('id', task.id)
            .select()
            .single();

          if (error) {
            throw error;
          }

          return data as Task;
        }),
      ),
    );
  }

  changeTaskStatus(id: number, status: TodoStatus): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .update({ status })
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as Task;
        }),
    );
  }

  deleteTask(id: number): Observable<void> {
    return from(
      this.supabase
        .from('tasks')
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
