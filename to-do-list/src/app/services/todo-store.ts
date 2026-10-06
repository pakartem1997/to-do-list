import { inject, Service, signal } from '@angular/core';
import { Task } from '../interfaces/task.interface';
import { finalize, Observable, tap } from 'rxjs';
import { TodoStatus } from '../type/todo-status.type';
import { TaskMember } from '../interfaces/roles.interface';
import { TasksService } from './tasks';

@Service()
export class TodoStore {
  private readonly tasksService = inject(TasksService);

  private readonly tasksSignal = signal<Task[]>([]);
  readonly isLoading = signal(false);

  readonly tasks = this.tasksSignal.asReadonly();

  getTasks(): Observable<Task[]> {
    this.isLoading.set(true);

    return this.tasksService.getTasks().pipe(
      tap((tasks) => {
        this.tasksSignal.set(tasks);
      }),
      finalize(() => this.isLoading.set(false)),
    );
  }

  getTask(id: number): Observable<Task> {
    return this.tasksService.getTask(id);
  }

  addTask(text: string, description: string, roles: TaskMember[]): Observable<Task> {
    const tasks = this.tasksSignal();

    const maxOrder = tasks.length ? Math.max(...tasks.map((task) => task.order)) : -1;

    const newTask: Omit<Task, 'id'> = {
      text,
      description,
      roles,
      status: 'ToDo',
      order: maxOrder + 1,
    };

    return this.tasksService.addTask(newTask).pipe(
      tap((task) => {
        this.tasksSignal.update((tasks) => [...tasks, task]);
      }),
    );
  }

  editTask(id: number, text: string): Observable<Task> {
    return this.tasksService.editTask(id, text).pipe(
      tap((updatedTask) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
      }),
    );
  }

  deleteTask(id: number): Observable<void> {
    return this.tasksService.deleteTask(id).pipe(
      tap(() => {
        this.tasksSignal.update((tasks) => tasks.filter((task) => task.id !== id));
      }),
    );
  }

  changeTaskStatus(id: number, status: TodoStatus): Observable<Task> {
    return this.tasksService.changeTaskStatus(id, status).pipe(
      tap((updatedTask) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
        );
      }),
    );
  }

  changeTaskOrder(tasks: Pick<Task, 'id' | 'order'>[]): Observable<Task[]> {
    return this.tasksService.changeTaskOrder(tasks).pipe(
      tap((updatedTasks) => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => {
            const updatedTask = updatedTasks.find((updated) => updated.id === task.id);

            return updatedTask ?? task;
          }),
        );
      }),
    );
  }

  // reloadTasks(): Observable<Task[]> {
  //   return this.todoApi.getTasks().pipe(
  //     tap((tasks) => {
  //       this.tasksSignal.set(tasks);
  //     }),
  //   );
  // }
}
