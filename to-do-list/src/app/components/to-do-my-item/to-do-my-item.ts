import { Component, computed, input, output } from '@angular/core';
import { Task } from '../../interfaces/task.interface';
import { ToDoTaskStatusBadge } from '../to-do-task-status-badge/to-do-task-status-badge';
import { ToDoTaskMessageCount } from '../to-do-task-message-count/to-do-task-message-count';
import { MatIcon } from '@angular/material/icon';
import { ToDoUserAvatar } from '../to-do-user-avatar/to-do-user-avatar';
import { TodoStatus } from '../../type/todo-status.type';
import { ToDoCheckbox } from '../to-do-checkbox/to-do-checkbox';
import { TaskMemberWithProfile } from '../../type/taskMemberWithProfile.type';

@Component({
  selector: 'li[app-my-item]',
  imports: [ToDoTaskStatusBadge, ToDoTaskMessageCount, MatIcon, ToDoUserAvatar, ToDoCheckbox],
  templateUrl: './to-do-my-item.html',
  styleUrl: './to-do-my-item.css',
})
export class ToDoMyItem {
  task = input.required<Task>();
  members = input<TaskMemberWithProfile[]>([]);

  statusChange = output<TodoStatus>();

  isCompleted = computed(() => this.task().status === 'Completed');

  onStatusChange(checked: boolean): void {
    const newStatus: TodoStatus = !checked ? 'Completed' : 'InProgress';

    this.statusChange.emit(newStatus);
  }
}
