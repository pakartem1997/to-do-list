import { Component, computed, inject, OnInit } from '@angular/core';
import { TodoStore } from '../../services/todo-store';
import { take } from 'rxjs';
import { ToDoMyItem } from '../../components/to-do-my-item/to-do-my-item';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { UserService } from '../../services/user';
import { TodoStatus } from '../../type/todo-status.type';
import { ToastService } from '../../services/toast';

@Component({
  selector: 'app-my-tasks',
  imports: [ToDoMyItem, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  private readonly todoStore = inject(TodoStore);
  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);

  readonly myTasks = computed(() => {
    const userId = this.userService.userId();

    if (!userId) {
      return [];
    }

    return this.todoStore
      .tasks()
      .filter((task) => task.roles.some((role) => role.userId === userId));
  });

  ngOnInit() {
    this.todoStore.getTasks().pipe(take(1)).subscribe();
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
          this.toastService.showToast(
            $localize`:@@statusUpdateError:Failed to update task status!`,
          );
        },
      });
  }
}
