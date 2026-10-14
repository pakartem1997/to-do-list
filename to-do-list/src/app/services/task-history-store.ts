import { inject, Service, signal } from '@angular/core';
import { TaskHistory } from '../interfaces/taskHistory.interface';
import { TaskHistoryService } from './task-history';
import { finalize, Observable, tap } from 'rxjs';
import { TaskHistoryAction } from '../type/taskHistoryAction.tupe';

@Service()
export class TaskHistoryStore {
  private readonly taskHistoryService = inject(TaskHistoryService);

  private readonly tasksSignal = signal<TaskHistory[]>([]);
  readonly tasks = this.tasksSignal.asReadonly();

  private readonly isSignalLoading = signal(false);
  readonly isLoading = this.isSignalLoading.asReadonly();

  getTaskHistory(taskId: number): Observable<TaskHistory[]> {
    this.isSignalLoading.set(true);

    return this.taskHistoryService.getTaskHistory(taskId).pipe(
      tap((tasks) => {
        this.tasksSignal.set(tasks);
      }),
      finalize(() => this.isSignalLoading.set(false)),
    );
  }

  addHistory(
    taskId: number,
    action: TaskHistoryAction,
    details: Record<string, unknown>,
  ): Observable<TaskHistory> {
    return this.taskHistoryService.addHistory(taskId, action, details).pipe(
      tap((history) => {
        this.tasksSignal.update((tasks) => [history, ...tasks]);
      }),
    );
  }
}
