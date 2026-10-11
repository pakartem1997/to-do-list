import { Component, input } from '@angular/core';
import { ToDoTypingDots } from '../to-do-typing-dots/to-do-typing-dots';

@Component({
  selector: 'app-to-do-user-is-typing',
  imports: [ToDoTypingDots],
  templateUrl: './to-do-user-is-typing.html',
  styleUrl: './to-do-user-is-typing.css',
})
export class ToDoUserIsTyping {
  userName = input<string>('');
}
