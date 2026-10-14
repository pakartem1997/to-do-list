import { Component, input, output } from '@angular/core';
import { ChatMessage } from '../../interfaces/message.interface';
import { ToDoChatMessage } from '../to-do-chat-message/to-do-chat-message';

@Component({
  selector: 'app-to-do-chat-messages',
  imports: [ToDoChatMessage],
  templateUrl: './to-do-chat-messages.html',
  styleUrl: './to-do-chat-messages.css',
})
export class ToDoChatMessages {
  messages = input<ChatMessage[]>([]);
  currentUserId = input<string | null>(null);

  delete = output<number>();

  clickDelete(idMessage: number) {
    this.delete.emit(idMessage);
  }
}
