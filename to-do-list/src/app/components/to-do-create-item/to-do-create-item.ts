import { Component, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { TextFieldModule } from '@angular/cdk/text-field';
import { TodoStore } from '../../services/todo-store';
import { ToastService } from '../../services/toast';
import { TooltipDirective } from '../../directives/tooltip';
import { ToDoButton } from '../to-do-button/to-do-button';
import { take } from 'rxjs';
import { MatOption, MatSelect } from '@angular/material/select';
import { TaskMember } from '../../interfaces/roles.interface';
import { ProfileService } from '../../services/profile';
import { Profile } from '../../interfaces/profile.interface';
import { UserService } from '../../services/user';

@Component({
  selector: 'app-to-do-create-item',
  imports: [
    FormsModule,
    MatInputModule,
    TextFieldModule,
    TooltipDirective,
    ToDoButton,
    MatSelect,
    MatOption,
  ],
  templateUrl: './to-do-create-item.html',
  styleUrl: './to-do-create-item.css',
})
export class ToDoCreateItem {
  private readonly todoStore = inject(TodoStore);
  private readonly toastService = inject(ToastService);
  private readonly profileService = inject(ProfileService);
  private readonly userService = inject(UserService);

  users = signal<Profile[]>([]);

  constructor() {
    this.loadUsers();

    effect(() => {
      const user = this.userService.user();

      if (user) {
        this.model.roles[0].userId = user.id;
      }
    });
  }

  private loadUsers(): void {
    this.profileService
      .getUsers()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.users.set(data);
        },

        error: (error) => {
          console.error(error);
        },
      });
  }

  model: {
    title: string;
    description: string;
    roles: Pick<TaskMember, 'userId' | 'role'>[];
  } = {
    title: '',
    description: '',
    roles: [
      {
        role: 'Creator',
        userId: null,
      },
      {
        role: 'Responsible',
        userId: null,
      },
      {
        role: 'Executor',
        userId: null,
      },
    ],
  };

  todoForm = viewChild<NgForm>('todoForm');

  addRole(): void {
    this.model.roles.push({
      role: null,
      userId: null,
    });
  }

  removeRole(index: number): void {
    this.model.roles.splice(index, 1);
  }

  addTask(): void {
    const title = this.model.title.trim();
    const description = this.model.description.trim();
    const roles = this.model.roles;

    this.todoStore
      .addTask(title, description, roles)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.toastService.showToast($localize`:@@taskAdded:Task added!`);
        },

        error: (error) => {
          console.error(error);

          this.toastService.showToast($localize`:@@taskAddError:Failed to add task!`);
        },

        complete: () => {
          this.todoForm()?.resetForm();
        },
      });
  }
}
