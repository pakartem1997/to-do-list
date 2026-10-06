import { Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { ToDoTaskStatusBadge } from '../to-do-task-status-badge/to-do-task-status-badge';
import { TodoStore } from '../../services/todo-store';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
import { ToDoChatMessages } from '../to-do-chat-messages/to-do-chat-messages';

@Component({
  selector: 'app-to-do-task-chat',
  imports: [MatIcon, FormsModule, ToDoTaskStatusBadge, MatTabsModule, ToDoChatMessages],
  templateUrl: './to-do-task-chat.html',
  styleUrl: './to-do-task-chat.css',
})
export class ToDoTaskChat {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly todoStore = inject(TodoStore);

  messages = [
    {
      id: 1,
      author: { authorId: 1, name: 'Artem' },
      text: 'Hi! My name is Artem!',
      createdAt: '10:13:45',
    },
    {
      id: 2,
      author: { authorId: 2, name: 'Artem' },
      text: 'Hi! My name is Artem!',
      createdAt: '10:13:45',
    },
  ];

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

  task = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) => this.todoStore.getTask(id)),
    ),
    { initialValue: null },
  );

  closeChat(): void {
    this.router.navigate(['/myTasks']);
  }

  userInput = '';

  sendMessage(): void {
    if (!this.userInput.trim()) return;

    console.log('Отправлено:', this.userInput);

    this.userInput = '';
  }
}
