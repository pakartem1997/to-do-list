import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map, take } from 'rxjs';
import { ToDoItemView } from '../to-do-item-view/to-do-item-view';
import { ToDoErrorState } from '../to-do-error-state/to-do-error-state';
import { ToastService } from '../../services/toast';
import { TodoStatus } from '../../type/todo-status.type';
import { TodoStore } from '../../services/todo-store';
import { TaskHistoryStore } from '../../services/task-history-store';

@Component({
  selector: 'app-to-do-item-view-wrapper',
  imports: [ToDoItemView, ToDoErrorState],
  templateUrl: './to-do-item-view-wrapper.html',
  styleUrl: './to-do-item-view-wrapper.css',
})
export class ToDoItemViewWrapper {
  private readonly route = inject(ActivatedRoute);
  private readonly todoStore = inject(TodoStore);
  private readonly toastService = inject(ToastService);
  private readonly taskHistoryStore = inject(TaskHistoryStore);

  readonly tasks = this.todoStore.tasks;

  taskId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');

        if (id === null) {
          return null;
        }

        const idNumber = Number(id);

        if (Number.isNaN(idNumber)) {
          return null;
        }

        return idNumber;
      }),
    ),
  );

  readonly task = computed(() => {
    const id = this.taskId();

    if (id === null) return null;

    return this.tasks().find((task) => Number(task.id) === id) ?? null;
  });

  onStatusChange(id: number, checked: boolean): void {
    const task = this.todoStore.getTaskById(id);
    const newStatus: TodoStatus = checked ? 'Completed' : 'InProgress';

    if (!task || task.status === newStatus) {
      return;
    }

    const oldStatus = task.status;

    this.todoStore
      .changeTaskStatus(id, newStatus)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.taskHistoryStore
            .addHistory(id, 'status_changed', {
              oldStatus,
              newStatus,
            })
            .pipe(take(1))
            .subscribe({
              error: () => {
                this.toastService.showToast('Failed to save task history!');
              },
            });

          this.toastService.showToast(
            newStatus === 'Completed'
              ? $localize`:@@taskCompleted:Task completed!`
              : $localize`:@@taskReturnedToProgress:Task returned to progress!`,
          );
        },
        error: (error) => {
          console.error(error);
          this.toastService.showToast(
            $localize`:@@statusUpdateError:Failed to update task status!`,
          );
        },
      });
  }
}
