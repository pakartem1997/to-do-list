import { Service, signal } from '@angular/core';
import {
  AuthChangeEvent,
  createClient,
  Session,
  SupabaseClient,
  User,
} from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { finalize, from, Observable, tap } from 'rxjs';
import { Task } from '../interfaces/task.interface';
import { TodoStatus } from '../type/todo-status.type';
import { TaskMember } from '../interfaces/roles.interface';

export interface Profile {
  id?: string;
  username: string;
  website: string;
  avatar_url: string;
}

@Service()
export class Supabase {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(environment.supabaseUrl, environment.supabasePublishableKey);
  }

  private readonly tasksSignal = signal<Task[]>([]);
  readonly isLoading = signal(false);

  readonly tasks = this.tasksSignal.asReadonly();

  getTasks() {
    this.isLoading.set(true);

    return from(
      this.supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data;
        }),
    ).pipe(
      tap((tasks) => {
        this.tasksSignal.set(tasks);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  addTask(text: string, description: string, roles: TaskMember[]) {
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

          // const { error: rolesError } = await this.supabase.from('task_members').insert(
          //   roles.map((member) => ({
          //     task_id: data.id,
          //     user_id: member.userId,
          //     role: member.role,
          //   })),
          // );

          // if (rolesError) {
          //   throw rolesError;
          // }

          return data;
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
    ).pipe(
      tap((updatedTask) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
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
    ).pipe(
      tap(() => {
        this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
      }),
    );
  }

  async getUser(): Promise<User | null> {
    const { data, error } = await this.supabase.auth.getUser();
    if (error) {
      return null;
    }
    return data.user;
  }

  signUp(email: string, password: string, username: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
    });
  }

  profile(user: User) {
    return this.supabase
      .from('profiles')
      .select(`username, website, avatar_url`)
      .eq('id', user.id)
      .single();
  }

  authChanges(callback: (event: AuthChangeEvent, session: Session | null) => void) {
    return this.supabase.auth.onAuthStateChange(callback);
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }

  updateProfile(profile: Profile) {
    const update = {
      ...profile,
      updated_at: new Date(),
    };
    return this.supabase.from('profiles').upsert(update);
  }

  downLoadImage(path: string) {
    return this.supabase.storage.from('avatars').download(path);
  }

  uploadAvatar(filePath: string, file: File) {
    return this.supabase.storage.from('avatars').upload(filePath, file);
  }
}
