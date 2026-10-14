import { Component, effect, input, output, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelect, MatOption } from '@angular/material/select';
import { Status } from '../../interfaces/status.interface';
import { TodoStatus } from '../../type/todo-status.type';
import { FormsModule } from '@angular/forms';
import { Task } from '../../interfaces/task.interface';
import { DatePipe } from '@angular/common';
import { ToDoUserAvatar } from '../to-do-user-avatar/to-do-user-avatar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatMenuModule } from '@angular/material/menu';
import { Roles, ROLES } from '../../constants/roles.constants';
import { Profile } from '../../interfaces/profile.interface';
import { AddMemberEvent } from '../../interfaces/AddMemberEvent.interface';
import { TaskMemberWithProfile } from '../../type/taskMemberWithProfile.type';
import { TaskHistory } from '../../interfaces/taskHistory.interface';

@Component({
  selector: 'app-to-do-task-info',
  imports: [
    DatePipe,
    FormsModule,
    MatIcon,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelect,
    MatOption,
    ToDoUserAvatar,
    MatMenuModule,
  ],
  templateUrl: './to-do-task-info.html',
  styleUrl: './to-do-task-info.css',
})
export class ToDoTaskInfo {
  title = input.required<string>();
  task = input.required<Task>();
  members = input.required<TaskMemberWithProfile[]>();
  users = input.required<Profile[]>();
  history = input.required<TaskHistory[]>();

  isEdit = signal(false);
  selectedStatus = signal<TodoStatus | null>(null);
  selectedUserId = signal<string | null>(null);

  changeTitle = output<string>();
  changeStatus = output<TodoStatus>();
  addMember = output<AddMemberEvent>();
  removeMember = output<number>();

  editedTitle = '';

  readonly roles = ROLES;

  constructor() {
    effect(() => {
      this.selectedStatus.set(this.task().status);
    });
  }

  statuses: Status[] = [
    { value: 'ToDo', viewValue: $localize`:@@toDoStatus:ToDo` },
    { value: 'InProgress', viewValue: $localize`:@@inProgressStatus:In Progress` },
    { value: 'Completed', viewValue: $localize`:@@completedStatus:Completed` },
  ];

  startEdit() {
    this.editedTitle = this.title();
    this.isEdit.set(true);
  }

  saveEdit() {
    const newTitle = this.editedTitle.trim();

    if (!newTitle) {
      return;
    }

    this.changeTitle.emit(newTitle);
    this.isEdit.set(false);
  }

  cancelEdit() {
    this.editedTitle = this.title();
    this.isEdit.set(false);
  }

  onStatusChange(status: TodoStatus) {
    this.selectedStatus.set(status);
    this.changeStatus.emit(status);
  }

  onAddMember(role: Roles) {
    const userId = this.selectedUserId();
    this.selectedUserId.set('');

    if (!userId) {
      return;
    }

    this.addMember.emit({
      userId,
      role,
    });
  }

  onRemoveMember(id: number) {
    this.removeMember.emit(id);
  }
}
