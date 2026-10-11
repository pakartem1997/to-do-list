import { inject, Injectable, signal } from '@angular/core';
import { Supabase } from './supabase';
import { UserService } from './user';
import { ChatMessage } from '../interfaces/message.interface';

interface TypingUser {
  userName: string;
  userId: string;
  isTyping: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BroadcastChat {
  private readonly supabase = inject(Supabase).client;
  private readonly userService = inject(UserService);

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
        console.log('INSERT:', payload);
        this.messagesSignal.update((messages) => [...messages, payload]);
        this.messageReceived(payload);
      })
      .on('broadcast', { event: 'UPDATE' }, ({ payload }) => {
        console.log('UPDATE:', payload);
      })
      .on('broadcast', { event: 'DELETE' }, ({ payload }) => {
        console.log('DELETE:', payload);
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

        console.log(payload);
        console.log(this.typingUsersSignal());
      })
      .subscribe((status) => {
        console.log('CHANNEL STATUS:', status);
      });
  }

  async sendMessage(taskId: number, text: string): Promise<void> {
    const userId = this.userService.userId();

    if (!userId || !text.trim()) {
      return;
    }

    const { data, error } = await this.supabase
      .from('task_messages')
      .insert({
        task_id: taskId,
        user_id: userId,
        text: text.trim(),
      })
      .select()
      .single();

    if (error) {
      console.error('Send message error:', error);
      return;
    }

    console.log('Message saved:', data);
  }

  async deleteMessage(messageId: number) {
    console.log(messageId);
    const { error } = await this.supabase.from('task_messages').delete().eq('id', messageId);

    if (error) {
      console.error('Delete message error:', error);
    }

    this.messagesSignal.update((messages) =>
      messages.filter((message) => message.id !== messageId),
    );
  }

  private messageReceived(payload: ChatMessage): void {
    console.log('Received:', payload);
  }

  private async loadMessages(taskId: number): Promise<void> {
    const { data, error } = await this.supabase
      .from('task_messages')
      .select(
        `
      id,
      task_id,
      user_id,
      text,
      created_at,
      profile:profiles (
        id,
        username,
        avatar_url
      )
    `,
      )
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Load messages error:', error);
      return;
    }

    const messages = data as unknown as ChatMessage[];
    this.messagesSignal.set(messages);
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
          userName: this.userService.displayName(),
          userId: this.userService.userId(),
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
        userName: this.userService.displayName(),
        userId: this.userService.userId(),
        isTyping: false,
      },
    });
  }
  // unsubscribe(): void {
  //   this.supabase.removeChannel(this.channel);
  // }
}
