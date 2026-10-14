import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { TodoStore } from '../../services/todo-store';
import { take } from 'rxjs';
import { ToDoMyItem } from '../../components/to-do-my-item/to-do-my-item';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { TodoStatus } from '../../type/todo-status.type';
import { ToastService } from '../../services/toast';
import { TaskMemberWithProfile } from '../../type/taskMemberWithProfile.type';
import { TaskHistoryStore } from '../../services/task-history-store';
import { MemberStore } from '../../services/member-store';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'app-my-tasks',
  imports: [ToDoMyItem, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.css',
})
export class MyTasks implements OnInit {
  private readonly todoStore = inject(TodoStore);
  private readonly userStore = inject(UserStore);
  private readonly toastService = inject(ToastService);
  private readonly taskHistoryStore = inject(TaskHistoryStore);
  private readonly memberStore = inject(MemberStore);

  membersByTask = signal<Record<number, TaskMemberWithProfile[]>>({});

  readonly myTasks = computed(() => {
    const userId = this.userStore.userId();

    if (!userId) {
      return [];
    }

    return this.todoStore
      .tasks()
      .filter((task) => (task.task_members ?? []).some((member) => member.user_id === userId));
  });

  ngOnInit(): void {
    this.todoStore
      .getTasks()
      .pipe(take(1))
      .subscribe({
        next: (tasks) => {
          tasks.forEach((task) => {
            this.loadTaskMembers(task.id);
          });
        },
        error: () => {
          this.toastService.showToast($localize`:@@tasksLoadError:Failed to load tasks!`);
        },
      });
  }

  loadTaskMembers(taskId: number): void {
    this.memberStore
      .getTaskMembers(taskId)
      .pipe(take(1))
      .subscribe({
        next: (members) => {
          this.membersByTask.update((current) => ({
            ...current,
            [taskId]: members,
          }));
        },
        error: () => {
          this.toastService.showToast($localize`:@@membersLoadError:Failed to load task members!`);
        },
      });
  }

  changeStatus(taskId: number, status: TodoStatus): void {
    const task = this.todoStore.tasks().find((task) => task.id === taskId);

    if (!task || task.status === status) {
      return;
    }

    const oldStatus = task.status;

    this.todoStore
      .changeTaskStatus(taskId, status)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.showToast(
            status === 'Completed'
              ? $localize`:@@taskCompleted:Task completed!`
              : $localize`:@@statusUpdated:Status updated!`,
          );

          this.taskHistoryStore
            .addHistory(taskId, 'status_changed', {
              oldStatus,
              newStatus: status,
            })
            .pipe(take(1))
            .subscribe({
              error: () => {
                this.toastService.showToast('Failed to save task history!');
              },
            });
        },
        error: () => {
          this.toastService.showToast(
            $localize`:@@statusUpdateError:Failed to update task status!`,
          );
        },
      });
  }
}
