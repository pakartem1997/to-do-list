import { Component, input, output } from '@angular/core';
import { ChatMessage } from '../../interfaces/message.interface';
import { ToDoUserAvatar } from '../to-do-user-avatar/to-do-user-avatar';
import { DatePipe } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-to-do-chat-message',
  imports: [ToDoUserAvatar, DatePipe, MatIcon, MatIconButton],
  templateUrl: './to-do-chat-message.html',
  styleUrl: './to-do-chat-message.css',
  host: {
    '[class.mine]': 'isMine()',
  },
})
export class ToDoChatMessage {
  message = input.required<ChatMessage>();
  isMine = input<boolean>(false);

  delete = output<number>();

  clickDelete(idMessage: number) {
    this.delete.emit(idMessage);
  }
}
