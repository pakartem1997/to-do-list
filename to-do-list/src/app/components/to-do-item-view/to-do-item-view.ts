import { Component, effect, input, output, signal } from '@angular/core';
import { Task } from '../../interfaces/task.interface';
import { TooltipDirective } from '../../directives/tooltip';
import { ToDoCheckbox } from '../to-do-checkbox/to-do-checkbox';

@Component({
  selector: 'app-to-do-item-view',
  imports: [TooltipDirective, ToDoCheckbox],
  templateUrl: './to-do-item-view.html',
  styleUrl: './to-do-item-view.css',
})
export class ToDoItemView {
  readonly task = input.required<Task>();
  isCompleted = signal<boolean>(false);

  constructor() {
    effect(() => {
      const task = this.task();

      this.isCompleted.set(task.status === 'Completed');
    });
  }

  readonly statusChange = output<boolean>();

  readonly returnToProgress = $localize`:@@returnToProgress:Return to Progress`;

  readonly completeTask = $localize`:@@completeTask:Complete Task`;

  onStatusChange(checked: boolean): void {
    this.isCompleted.set(checked);
    this.statusChange.emit(checked);
  }
}
