import { Component, effect, inject, OnInit, signal, viewChild } from '@angular/core';
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
import { UserStore } from '../../services/user-store';
import { TaskHistoryStore } from '../../services/task-history-store';

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
export class ToDoCreateItem implements OnInit {
  private readonly todoStore = inject(TodoStore);
  private readonly toastService = inject(ToastService);
  private readonly profileService = inject(ProfileService);
  private readonly userStore = inject(UserStore);
  private readonly taskHistoryStore = inject(TaskHistoryStore);

  users = signal<Profile[]>([]);

  constructor() {
    effect(() => {
      const user = this.userStore.user();

      if (user) {
        this.model.task_members[0].user_id = user.id;
      }
    });
  }

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.profileService
      .getUsers()
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.users.set(data);
          this.toastService.showToast('Users loaded successfully!');
        },
        error: () => {
          this.toastService.showToast('Failed to load users!');
        },
      });
  }

  model: {
    title: string;
    description: string;
    task_members: Pick<TaskMember, 'user_id' | 'role'>[];
  } = {
    title: '',
    description: '',
    task_members: [
      {
        role: 'Creator',
        user_id: null,
      },
      {
        role: 'Responsible',
        user_id: null,
      },
      {
        role: 'Executor',
        user_id: null,
      },
    ],
  };

  todoForm = viewChild<NgForm>('todoForm');

  addRole(): void {
    this.model.task_members.push({
      role: null,
      user_id: null,
    });
    this.toastService.showToast('Member added successfully!');
  }

  removeRole(index: number): void {
    this.model.task_members.splice(index, 1);
    this.toastService.showToast('Member removed successfully!');
  }

  addTask(): void {
    const title = this.model.title.trim();
    const description = this.model.description.trim();
    const task_members = this.model.task_members;

    this.todoStore
      .addTask(title, description, task_members)
      .pipe(take(1))
      .subscribe({
        next: (task) => {
          this.toastService.showToast($localize`:@@taskAdded:Task added!`);
          this.taskHistoryStore
            .addHistory(task.id, 'task_created', {
              title: task.text,
              description,
              createdAt: new Date().toISOString(),
            })
            .pipe(take(1))
            .subscribe({
              error: (error) => console.error(error),
            });
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
