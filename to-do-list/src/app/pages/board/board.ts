import { Component, computed, inject, OnInit } from '@angular/core';
import { ToDoBoardColumn } from '../../components/to-do-board-column/to-do-board-column';
import { TodoStatus } from '../../type/todo-status.type';
import {
  CdkDragDrop,
  CdkDropListGroup,
  transferArrayItem,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { Task } from '../../interfaces/task.interface';
import { forkJoin, take } from 'rxjs';
import { TodoStore } from '../../services/todo-store';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-board',
  imports: [ToDoBoardColumn, CdkDropListGroup],
  templateUrl: './board.html',
  styleUrl: './board.css',
})
export class Board implements OnInit {
  private readonly toastService = inject(ToastService);
  private readonly todoStore = inject(TodoStore);

  statuses: TodoStatus[] = ['ToDo', 'InProgress', 'Completed'];

  tasks = this.todoStore.tasks;

  ngOnInit() {
    this.todoStore.getTasks().pipe(take(1)).subscribe();
  }

  columns = computed(() =>
    this.statuses.map((status) => ({
      status,
      tasks: this.tasks()
        .filter((t) => t.status === status)
        .sort((a, b) => a.order - b.order),
    })),
  );

  drop(event: CdkDragDrop<Task[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);

      const currentTasks = event.container.data.map((task, index) => ({
        id: task.id,
        order: index,
      }));

      this.todoStore
        .changeTaskOrder(currentTasks)
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.toastService.showToast($localize`:@@taskOrderUpdated:Task order updated!`);
          },
          error: () => {
            this.toastService.showToast(
              $localize`:@@taskOrderUpdateError:Failed to update task order!`,
            );
            // this.supabase.reloadTasks().pipe(take(1)).subscribe();
          },
        });

      return;
    }

    transferArrayItem(
      event.previousContainer.data,
      event.container.data,
      event.previousIndex,
      event.currentIndex,
    );

    const previousTasks = event.previousContainer.data.map((task, index) => ({
      ...task,
      order: index,
    }));

    const currentTasks = event.container.data.map((task, index) => ({
      ...task,
      order: index,
    }));

    const task = event.item.data;
    const newStatus = event.container.id as TodoStatus;

    forkJoin([
      this.todoStore.changeTaskOrder([...previousTasks, ...currentTasks]),

      this.todoStore.changeTaskStatus(task.id, newStatus),
    ])
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.showToast($localize`:@@taskOrderUpdated:Task order updated!`);
        },
        error: () => {
          this.toastService.showToast(
            $localize`:@@taskOrderUpdateError:Failed to update task order!`,
          );
          // this.supabase.reloadTasks().pipe(take(1)).subscribe();
        },
      });
  }
}
