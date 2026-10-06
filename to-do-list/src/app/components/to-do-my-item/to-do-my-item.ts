import { Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { Task } from '../../interfaces/task.interface';
import { ToDoTaskStatusBadge } from '../to-do-task-status-badge/to-do-task-status-badge';
import { ToDoTaskMessageCount } from '../to-do-task-message-count/to-do-task-message-count';
import { MatIcon } from '@angular/material/icon';
import { ToDoUserAvatar } from '../to-do-user-avatar/to-do-user-avatar';
import { MemberService } from '../../services/member';
import { TaskMember } from '../../interfaces/roles.interface';
import { TodoStatus } from '../../type/todo-status.type';
import { ToDoCheckbox } from '../to-do-checkbox/to-do-checkbox';

@Component({
  selector: 'li[app-my-item]',
  imports: [ToDoTaskStatusBadge, ToDoTaskMessageCount, MatIcon, ToDoUserAvatar, ToDoCheckbox],
  templateUrl: './to-do-my-item.html',
  styleUrl: './to-do-my-item.css',
})
export class ToDoMyItem implements OnInit {
  private readonly memberService = inject(MemberService);

  task = input.required<Task>();

  members = signal<TaskMember[]>([]);

  statusChange = output<TodoStatus>();

  isCompleted = computed(() => this.task().status === 'Completed');

  ngOnInit() {
    this.memberService.getTaskMembers(this.task().id).subscribe({
      next: (members) => {
        console.log('Роли:', members);
        this.members.set(members);
      },
      error: (error) => {
        console.error('Ошибка загрузки участников:', error);
      },
    });
  }

  onStatusChange(checked: boolean): void {
    const newStatus: TodoStatus = !checked ? 'Completed' : 'InProgress';

    this.statusChange.emit(newStatus);
  }
}
