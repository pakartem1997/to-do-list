import { inject, Service, signal } from '@angular/core';
import { Task } from '../interfaces/task.interface';
import { finalize, Observable, tap } from 'rxjs';
import { TodoStatus } from '../type/todo-status.type';
import { TasksService } from './tasks';
import { TaskMember } from '../interfaces/roles.interface';
import { CreateTask } from '../interfaces/create-task.interface';

@Service()
export class TodoStore {
  private readonly tasksService = inject(TasksService);

  private readonly tasksSignal = signal<Task[]>([]);
  readonly tasks = this.tasksSignal.asReadonly();

  private readonly isSignalLoading = signal(false);
  readonly isLoading = this.isSignalLoading.asReadonly();

  getTasks(): Observable<Task[]> {
    this.isSignalLoading.set(true);

    return this.tasksService.getTasks().pipe(
      tap((tasks) => {
        this.tasksSignal.set(tasks);
      }),
      finalize(() => this.isSignalLoading.set(false)),
    );
  }

  getTaskById(id: number): Task | null {
    return this.tasksSignal().find((task) => task.id === id) ?? null;
  }

  addTask(
    text: string,
    description: string,
    task_members: Pick<TaskMember, 'user_id' | 'role'>[],
  ): Observable<Task> {
    const tasks = this.tasksSignal();

    const maxOrder = tasks.length ? Math.max(...tasks.map((task) => task.order)) : -1;

    const newTask: CreateTask = {
      text,
      description,
      task_members,
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
      tap(() => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === id ? { ...task, text } : task)),
        );
      }),
    );
  }

  editDescription(id: number, description: string): Observable<Task> {
    return this.tasksService.editDescription(id, description).pipe(
      tap(() => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === id ? { ...task, description } : task)),
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
      tap(() => {
        this.tasksSignal.update((tasks) =>
          tasks.map((task) => (task.id === id ? { ...task, status } : task)),
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
}
