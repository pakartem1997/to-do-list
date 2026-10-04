import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { from, Observable } from 'rxjs';
import { TaskMember } from '../interfaces/roles.interface';
import { Task } from '../interfaces/task.interface';
import { TodoStatus } from '../type/todo-status.type';

@Service()
export class TasksServise {
  private supabase = inject(Supabase).supabase;

  getTasks(): Observable<Task[]> {
    return from(
      this.supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as Task[];
        }),
    );
  }

  getTask(): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .select('*')
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

  addTask(text: string, description: string, roles: TaskMember[]): Observable<Task> {
    return from(
      this.supabase
        .from('tasks')
        .insert({
          text,
          description,
          status: 'ToDo',
        })
        .select()
        .single()
        .then(async ({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as Task;
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
