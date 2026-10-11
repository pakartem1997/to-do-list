import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
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
import { UserService } from '../../services/user';
import { ToDoUserIsTyping } from '../to-do-user-is-typing/to-do-user-is-typing';
import { ToDoDesription } from '../to-do-desription/to-do-desription';
import { ToDoSpinner } from '../to-do-spinner/to-do-spinner';
import { ToDoTaskNotFound } from '../to-do-task-not-found/to-do-task-not-found';
import { ToDoTaskInfo } from '../to-do-task-info/to-do-task-info';
import { MemberService } from '../../services/member';
import { ToastService } from '../../services/toast';
import { TodoStatus } from '../../type/todo-status.type';
import { ProfileService } from '../../services/profile';
import { Profile } from '../../interfaces/profile.interface';
import { AddMemberEvent } from '../../interfaces/AddMemberEvent.interface';
import { TaskMemberWithProfile } from '../../type/taskMemberWithProfile.type';

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
export class ToDoTaskChat implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly todoStore = inject(TodoStore);
  private readonly broadcastChat = inject(BroadcastChat);
  private readonly userService = inject(UserService);
  private readonly memberService = inject(MemberService);
  private readonly toastService = inject(ToastService);
  private readonly profileService = inject(ProfileService);

  messages = this.broadcastChat.messages;
  typingUsers = this.broadcastChat.typingUsers;
  userId = this.userService.userId;
  isLoading = this.todoStore.isLoading;

  members = signal<TaskMemberWithProfile[]>([]);
  users = signal<Profile[]>([]);

  constructor() {
    effect(() => {
      const taskId = this.taskId();

      if (taskId === null) {
        return;
      }

      this.broadcastChat.subscribe(taskId);
    });

    effect(() => {
      const taskId = this.taskId();

      if (taskId !== null) {
        this.loadMembers(taskId);
      }
    });
  }

  private loadMembers(taskId: number): void {
    this.memberService
      .getTaskMembers(taskId)
      .pipe(take(1))
      .subscribe({
        next: (members) => {
          this.members.set(members);
        },
        error: (error) => {
          console.error('Ошибка загрузки участников:', error);
        },
      });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.profileService
      .getUsers()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.users.set(data);
        },

        error: (error) => {
          console.error(error);
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

  sendMessage(taskId: number) {
    const message = this.messageInput().trim();

    if (!message) {
      return;
    }

    this.broadcastChat.sendMessage(taskId, message);
    this.messageInput.set('');
  }

  deleteMessage(idMessage: number) {
    console.log('chat');
    this.broadcastChat.deleteMessage(idMessage);
  }

  sendTypingIndicator() {
    console.log('sendTypingIndicator');
    this.broadcastChat.sendTypingIndicator(true);
  }

  descriptionChange(id: number, description: string) {
    this.todoStore
      .editDescription(id, description)
      .pipe(take(1))
      .subscribe({
        next: () => console.log('Ok'),
        error: () => console.log('error'),
      });
  }

  changeTitle(id: number, status: string) {
    this.todoStore
      .editTask(id, status)
      .pipe(take(1))
      .subscribe({
        next: () => this.toastService.showToast($localize`:@@taskUpdated:Task updated!`),
        error: () =>
          this.toastService.showToast($localize`:@@taskUpdateError:Failed to update task!`),
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

  addMembers(taskId: number, data: AddMemberEvent) {
    this.memberService
      .addMember(taskId, data.userId, data.role)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadMembers(taskId);
        },
        error: () => {
          console.log('error');
        },
      });
  }

  removeMember(taskId: number, id: number) {
    this.memberService
      .removeMember(id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadMembers(taskId);
        },
        error: () => {
          console.log('error');
        },
      });
  }
}
