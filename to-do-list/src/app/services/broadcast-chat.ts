import { inject, Service, signal } from '@angular/core';
import { Supabase } from './supabase';
import { ChatMessage } from '../interfaces/message.interface';
import { UserStore } from './user-store';
import { BroadcastChatApi } from './broadcast-chat-api';
import { Observable, take, tap, throwError } from 'rxjs';

interface TypingUser {
  userName: string;
  userId: string;
  isTyping: boolean;
}

@Service()
export class BroadcastChat {
  private readonly supabase = inject(Supabase).client;
  private readonly userStore = inject(UserStore);
  private readonly broadcastChatApi = inject(BroadcastChatApi);

  readonly messagesSignal = signal<ChatMessage[]>([]);
  readonly messages = this.messagesSignal.asReadonly();

  readonly typingUsersSignal = signal<Map<string, TypingUser>>(new Map());
  readonly typingUsers = this.typingUsersSignal.asReadonly();

  private channel?: ReturnType<typeof this.supabase.channel>;

  async subscribe(taskId: number): Promise<void> {
    if (this.channel) {
      await this.supabase.removeChannel(this.channel);
    }

    await this.loadMessages(taskId);

    this.channel = this.supabase
      .channel(`task:${taskId}`, {
        config: {
          private: false,
        },
      })
      .on('broadcast', { event: 'INSERT' }, ({ payload }) => {
        this.messagesSignal.update((messages) => [...messages, payload]);
      })
      .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
        console.log('UPDATE:', payload);
      })
      .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
        this.messagesSignal.update((messages) =>
          messages.filter((message) => message.id !== payload.id),
        );
      })
      .on('broadcast', { event: 'typing' }, (payload) => {
        const payloadData = payload['payload'];
        const userId = payloadData.userId;

        this.typingUsersSignal.update((users) => {
          const newUsers = new Map(users);

          newUsers.set(userId, payloadData);

          return newUsers;
        });
      })
      .subscribe((status) => {
        console.log('CHANNEL STATUS:', status);
      });
  }

  sendMessage(taskId: number, text: string): Observable<ChatMessage> {
    const userId = this.userStore.userId();

    if (!userId) {
      return throwError(() => new Error('The user is not authorized!'));
    }

    return this.broadcastChatApi.sendMessage(taskId, text, userId);
  }

  deleteMessage(messageId: number): Observable<void> {
    return this.broadcastChatApi.deleteMessage(messageId).pipe(
      tap(() => {
        this.messagesSignal.update((messages) =>
          messages.filter((message) => message.id !== messageId),
        );
      }),
    );
  }

  private loadMessages(taskId: number): void {
    this.broadcastChatApi
      .loadMessages(taskId)
      .pipe(take(1))
      .subscribe({
        next: (messages) => {
          this.messagesSignal.set(messages);
        },
        error: (error) => {
          console.error('Load messages error:', error);
        },
      });
  }

  private typingTimeout?: ReturnType<typeof setTimeout>;

  sendTypingIndicator(isTyping: boolean) {
    if (!this.channel) {
      return;
    }

    clearTimeout(this.typingTimeout);

    if (isTyping) {
      this.channel.send({
        type: 'broadcast',
        event: 'typing',
        payload: {
          userName: this.userStore.displayName(),
          userId: this.userStore.userId(),
          isTyping: true,
        },
      });

      this.typingTimeout = setTimeout(() => {
        this.sendTypingIndicator(false);
      }, 1000);

      return;
    }

    this.channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: {
        userName: this.userStore.displayName(),
        userId: this.userStore.userId(),
        isTyping: false,
      },
    });
  }
}
