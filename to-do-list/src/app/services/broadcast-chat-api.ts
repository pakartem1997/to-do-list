import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { from, Observable } from 'rxjs';
import { ChatMessage } from '../interfaces/message.interface';

@Service()
export class BroadcastChatApi {
  private readonly supabase = inject(Supabase).client;

  sendMessage(taskId: number, text: string, userId: string): Observable<ChatMessage> {
    return from(
      this.supabase
        .from('task_messages')
        .insert({
          task_id: taskId,
          user_id: userId,
          text: text.trim(),
        })
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data;
        }),
    );
  }

  deleteMessage(messageId: number): Observable<void> {
    return from(
      this.supabase
        .from('task_messages')
        .delete()
        .eq('id', messageId)
        .then(({ error }) => {
          if (error) {
            throw error;
          }
        }),
    );
  }

  loadMessages(taskId: number): Observable<ChatMessage[]> {
    return from(
      this.supabase
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
        .order('created_at', { ascending: true })
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data as unknown as ChatMessage[];
        }),
    );
  }
}
