import { inject, Service, signal } from '@angular/core';
import { TodoApi } from './todo-api';
import { Task } from '../interfaces/task.interface';
import { finalize, forkJoin, Observable, tap } from 'rxjs';
import { TodoStatus } from '../type/todo-status.type';
import { TaskMember } from '../interfaces/roles.interface';

@Service()
export class TodoStore {
  private readonly todoApi = inject(TodoApi);

  private readonly tasksSignal = signal<Task[]>([]);
  readonly isLoading = signal(false);

  readonly tasks = this.tasksSignal.asReadonly();

  // getTasks(): Observable<Task[]> {
  //   this.isLoading.set(true);

  //   return this.todoApi.getTasks().pipe(
  //     tap((tasks) => {
  //       this.tasksSignal.set(tasks);
  //     }),
  //     finalize(() => this.isLoading.set(false)),
  //   );
  // }

  // getTask(id: number): Observable<Task> {
  //   return this.todoApi.getTask(id);
  // }

  // addTask(text: string, description: string, roles: TaskMember[]): Observable<Task> {
  //   const tasks = this.tasksSignal();

  //   const maxOrder = tasks.length ? Math.max(...tasks.map((task) => task.order)) : -1;

  //   const newTask: Omit<Task, 'id'> = {
  //     text,
  //     description,
  //     roles,
  //     status: 'ToDo',
  //     order: maxOrder + 1,
  //   };

  //   return this.todoApi.addTask(newTask).pipe(
  //     tap((task) => {
  //       this.tasksSignal.update((tasks) => [...tasks, task]);
  //     }),
  //   );
  // }

  // editTask(id: number, text: string): Observable<Task> {
  //   return this.todoApi.editTask(id, text).pipe(
  //     tap((updatedTask) => {
  //       this.tasksSignal.update((tasks) =>
  //         tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
  //       );
  //     }),
  //   );
  // }

  // deleteTask(id: number): Observable<void> {
  //   return this.todoApi.deleteTask(id).pipe(
  //     tap(() => {
  //       this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
  //     }),
  //   );
  // }

  // changeTaskStatus(id: number, status: TodoStatus): Observable<Task> {
  //   return this.todoApi.changeTaskStatus(id, status);
  // }

  // changeTaskOrder(tasks: Pick<Task, 'id' | 'order'>[]): Observable<Task[]> {
  //   return forkJoin(tasks.map((task) => this.todoApi.changeTaskOrder(task.id, task.order)));
  // }

  // reloadTasks(): Observable<Task[]> {
  //   return this.todoApi.getTasks().pipe(
  //     tap((tasks) => {
  //       this.tasksSignal.set(tasks);
  //     }),
  //   );
  // }
}
