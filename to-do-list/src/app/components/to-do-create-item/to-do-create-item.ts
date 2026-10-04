import { Component, inject, viewChild } from '@angular/core';
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
import { Supabase } from '../../services/supabase';

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
  private supabase = inject(Supabase);

  model: {
    title: string;
    description: string;
    roles: TaskMember[];
  } = {
    title: '',
    description: '',
    roles: [
      { role: 'Creator', userId: null },
      { role: 'Responsible', userId: null },
      { role: 'Executor', userId: null },
    ],
  };

  users = [
    { id: 1, name: 'Artem' },
    { id: 2, name: 'Alex' },
    { id: 3, name: 'Maria' },
  ];

  todoForm = viewChild<NgForm>('todoForm');

  addRole() {
    this.model.roles.push({
      role: null,
      userId: null,
    });
  }

  removeRole(index: number): void {
    this.model.roles.splice(index, 1);
  }

  addTask() {
    const title = (this.model.title || '').trim();
    const description = (this.model.description || '').trim();
    const roles = this.model.roles || '';

    this.supabase
      .addTask(title, description, roles)
      .pipe(take(1))
      .subscribe({
        next: () => this.toastService.showToast($localize`:@@taskAdded:Task added!`),
        error: () => this.toastService.showToast($localize`:@@taskAddError:Failed to add task!`),
        complete: () => this.todoForm()?.resetForm(),
      });
  }
}
