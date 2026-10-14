import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ToDoTaskStatusBadge } from '../to-do-task-status-badge/to-do-task-status-badge';
import { TodoStore } from '../../services/todo-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, take } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { ToDoChatMessages } from '../to-do-chat-messages/to-do-chat-messages';
import { BroadcastChat } from '../../services/broadcast-chat';
import { ToDoUserIsTyping } from '../to-do-user-is-typing/to-do-user-is-typing';
import { ToDoDesription } from '../to-do-desription/to-do-desription';
import { ToDoSpinner } from '../to-do-spinner/to-do-spinner';
import { ToDoTaskNotFound } from '../to-do-task-not-found/to-do-task-not-found';
import { ToDoTaskInfo } from '../to-do-task-info/to-do-task-info';
import { ToastService } from '../../services/toast';
import { TodoStatus } from '../../type/todo-status.type';
import { ProfileService } from '../../services/profile';
import { Profile } from '../../interfaces/profile.interface';
import { AddMemberEvent } from '../../interfaces/AddMemberEvent.interface';
import { TaskMemberWithProfile } from '../../type/taskMemberWithProfile.type';
import { TaskHistory } from '../../interfaces/taskHistory.interface';
import { MemberStore } from '../../services/member-store';
import { TaskHistoryStore } from '../../services/task-history-store';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'app-to-do-task-chat',
  imports: [
    MatIcon,
    FormsModule,
    ToDoTaskStatusBadge,
    MatTabsModule,
    ToDoChatMessages,
    ToDoUserIsTyping,
    ToDoDesription,
    ToDoSpinner,
    ToDoTaskNotFound,
    ToDoTaskInfo,
  ],
  templateUrl: './to-do-task-chat.html',
  styleUrl: './to-do-task-chat.css',
})
export class ToDoTaskChat {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly todoStore = inject(TodoStore);
  private readonly broadcastChat = inject(BroadcastChat);
  private readonly userStore = inject(UserStore);
  private readonly memberStore = inject(MemberStore);
  private readonly toastService = inject(ToastService);
  private readonly profileService = inject(ProfileService);
  private readonly taskHistoryStore = inject(TaskHistoryStore);

  messages = this.broadcastChat.messages;
  typingUsers = this.broadcastChat.typingUsers;
  userId = this.userStore.userId;
  isLoading = this.todoStore.isLoading;

  members = signal<TaskMemberWithProfile[]>([]);
  users = signal<Profile[]>([]);
  history = signal<TaskHistory[]>([]);

  constructor() {
    this.loadUsers();

    effect(() => {
      const taskId = this.taskId();

      if (taskId === null) {
        return;
      }

      this.broadcastChat.subscribe(taskId);
      this.loadMembers(taskId);
      this.loadHistory(taskId);
    });
  }

  private loadMembers(taskId: number): void {
    this.memberStore
      .getTaskMembers(taskId)
      .pipe(take(1))
      .subscribe({
        next: (members) => {
          this.members.set(members);
        },
        error: () => {
          this.toastService.showToast('Failed to load task members!');
        },
      });
  }

  loadHistory(taskId: number): void {
    this.taskHistoryStore
      .getTaskHistory(taskId)
      .pipe(take(1))
      .subscribe({
        next: (history) => this.history.set(history),
        error: () => {
          this.toastService.showToast('Failed to load task history!');
        },
      });
  }

  private loadUsers(): void {
    this.profileService
      .getUsers()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.users.set(data);
        },
        error: () => {
          this.toastService.showToast('Error:Failed to load users!');
        },
      });
  }

  taskId = toSignal(
    this.route.paramMap.pipe(
      map((params) => {
        const id = params.get('id');

        if (id === null) {
          return null;
        }

        const idNumber = Number(id);

        return Number.isNaN(idNumber) ? null : idNumber;
      }),
    ),
    { initialValue: null },
  );

  task = computed(() => this.todoStore.tasks().find((task) => task.id === this.taskId()) ?? null);

  closeChat(): void {
    this.router.navigate(['/myTasks']);
  }

  messageInput = signal<string>('');

  sendMessage(taskId: number): void {
    const message = this.messageInput().trim();

    if (!message) {
      return;
    }

    this.broadcastChat.sendMessage(taskId, message).subscribe({
      next: () => {
        this.toastService.showToast('The message has been sent!');
        this.messageInput.set('');
      },
      error: () => {
        this.toastService.showToast('The message could not be sent!');
      },
    });
  }

  deleteMessage(idMessage: number) {
    this.broadcastChat.deleteMessage(idMessage).subscribe({
      next: () => {
        this.toastService.showToast('Message deleted successfully!');
      },
      error: () => {
        this.toastService.showToast('Failed to delete message!');
      },
    });
  }

  sendTypingIndicator() {
    this.broadcastChat.sendTypingIndicator(true);
  }

  descriptionChange(id: number, description: string): void {
    const task = this.todoStore.getTaskById(id);

    if (!task || task.description === description) {
      return;
    }

    const oldDescription = task.description;

    this.todoStore
      .editDescription(id, description)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.taskHistoryStore
            .addHistory(id, 'description_changed', {
              oldDescription,
              newDescription: description,
            })
            .pipe(take(1))
            .subscribe({
              next: (history) => {
                this.history.update((items) => [history, ...items]);
              },
              error: (error) => {
                console.error(error);
                this.toastService.showToast('Failed to save task history!');
              },
            });

          this.toastService.showToast('Description updated successfully!');
        },
        error: () => {
          this.toastService.showToast('Failed to update description!');
        },
      });
  }

  changeTitle(id: number, title: string): void {
    const task = this.todoStore.getTaskById(id);

    if (!task || task.text === title) {
      return;
    }

    const oldTitle = task.text;

    this.todoStore
      .editTask(id, title)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.taskHistoryStore
            .addHistory(id, 'title_changed', {
              oldTitle,
              newTitle: title,
            })
            .pipe(take(1))
            .subscribe({
              next: (history) => {
                this.history.update((items) => [history, ...items]);
              },
              error: (error) => {
                console.error(error);
                this.toastService.showToast('Failed to save task history!');
              },
            });

          this.toastService.showToast($localize`:@@taskUpdated:Task updated!`);
        },
        error: () => {
          this.toastService.showToast($localize`:@@taskUpdateError:Failed to update task!`);
        },
      });
  }

  changeStatus(id: number, status: TodoStatus): void {
    const task = this.todoStore.getTaskById(id);

    if (!task || task.status === status) {
      return;
    }

    const oldStatus = task.status;

    this.todoStore
      .changeTaskStatus(id, status)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.taskHistoryStore
            .addHistory(id, 'status_changed', {
              oldStatus,
              newStatus: status,
            })
            .pipe(take(1))
            .subscribe({
              next: (history) => {
                this.history.update((items) => [history, ...items]);
              },
              error: (error) => {
                console.error(error);
                this.toastService.showToast('Failed to save task history!');
              },
            });

          this.toastService.showToast(
            status === 'Completed'
              ? $localize`:@@taskCompleted:Task completed!`
              : $localize`:@@statusUpdated:Status updated!`,
          );
        },
        error: () => {
          this.toastService.showToast(
            $localize`:@@statusUpdateError:Failed to update task status!`,
          );
        },
      });
  }

  addMembers(taskId: number, data: AddMemberEvent): void {
    this.memberStore
      .addMember(taskId, data.userId, data.role)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadMembers(taskId);

          this.taskHistoryStore
            .addHistory(taskId, 'member_added', {
              userId: data.userId,
              role: data.role,
            })
            .pipe(take(1))
            .subscribe({
              next: (history) => {
                this.history.update((items) => [history, ...items]);
              },
              error: (error) => {
                console.error(error);
                this.toastService.showToast('Failed to save task history!');
              },
            });

          this.toastService.showToast($localize`:@@memberAdded:Member added successfully!`);
        },
        error: () => {
          this.toastService.showToast($localize`:@@memberAddError:Failed to add member!`);
        },
      });
  }

  removeMember(taskId: number, id: number): void {
    const member = this.members().find((item) => item.id === id);

    this.memberStore
      .removeMember(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadMembers(taskId);

          this.taskHistoryStore
            .addHistory(taskId, 'member_removed', {
              userId: member?.user_id,
              role: member?.role,
            })
            .pipe(take(1))
            .subscribe({
              next: (history) => {
                this.history.update((items) => [history, ...items]);
              },
              error: (error) => {
                console.error(error);
                this.toastService.showToast('Failed to save task history!');
              },
            });

          this.toastService.showToast('Member removed successfully!');
        },
        error: () => {
          this.toastService.showToast('Failed to remove member!');
        },
      });
  }
}
