import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ToastService } from '../../services/toast';
import { TodoStatus } from '../../type/todo-status.type';
import { Status } from '../../interfaces/status.interface';
import { RouterLink, RouterOutlet, RouterLinkActive } from '@angular/router';
import { ToDoItem } from '../../components/to-do-item/to-do-item';
import { ToDoCreateItem } from '../../components/to-do-create-item/to-do-create-item';
import { MatFormField, MatLabel } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { TodoStore } from '../../services/todo-store';
import { take } from 'rxjs';

@Component({
  selector: 'app-backlog',
  imports: [
    RouterLink,
    ToDoItem,
    RouterOutlet,
    ToDoCreateItem,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    FormsModule,
    RouterLinkActive,
  ],
  templateUrl: './backlog.html',
  styleUrl: './backlog.css',
})
export class Backlog implements OnInit {
  private readonly todoStore = inject(TodoStore);
  private readonly toastService = inject(ToastService);

  selectedStatus = signal<TodoStatus | null>(null);

  statuses: Status[] = [
    { value: null, viewValue: $localize`:@@allStatus:ALL` },
    { value: 'ToDo', viewValue: $localize`:@@toDoStatus:ToDo` },
    { value: 'InProgress', viewValue: $localize`:@@inProgressStatus:In Progress` },
    { value: 'Completed', viewValue: $localize`:@@completedStatus:Completed` },
  ];

  tasks = this.todoStore.tasks;
  isLoading = this.todoStore.isLoading;

  ngOnInit() {
    this.todoStore
      .getTasks()
      .pipe(take(1))
      .subscribe({
        next: () =>
          this.toastService.showToast($localize`:@@tasksLoaded:Tasks loaded successfully!`),
        error: () =>
          this.toastService.showToast($localize`:@@tasksLoadError:Failed to load tasks!`),
      });
  }

  filteredTasks = computed(() => {
    const status = this.selectedStatus();

    if (status === null) {
      return this.tasks();
    }

    return this.tasks().filter((task) => task.status === status);
  });

  deleteTask(id: number) {
    this.todoStore
      .deleteTask(id)
      .pipe(take(1))
      .subscribe({
        next: () => this.toastService.showToast($localize`:@@taskDeleted:Task deleted!`),
        error: () =>
          this.toastService.showToast($localize`:@@taskDeletedError:Failed to delete task!`),
      });
  }

  changeStatus(id: number, status: TodoStatus) {
    this.todoStore
      .changeTaskStatus(id, status)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.showToast($localize`:@@statusUpdated:Status updated!`);
          this.toastService.showToast(
            status === 'Completed'
              ? $localize`:@@taskCompleted:Task completed!`
              : $localize`:@@taskReturnedToProgress:Task returned to progress!`,
          );
        },
        error: () => {
          // this.supabase.reloadTasks().subscribe();
          this.toastService.showToast(
            $localize`:@@statusUpdateError:Failed to update task status!`,
          );
        },
      });
  }
}
