import { Component, output } from '@angular/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-to-do-task-not-found',
  imports: [MatIcon, MatButton],
  templateUrl: './to-do-task-not-found.html',
  styleUrl: './to-do-task-not-found.css',
})
export class ToDoTaskNotFound {
  closeChat = output<void>();
}
