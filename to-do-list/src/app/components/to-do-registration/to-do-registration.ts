import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButton, MatButtonModule, MatIconButton } from '@angular/material/button';
import {
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatError, MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput, MatSuffix } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Supabase } from '../../services/supabase';

@Component({
  selector: 'app-to-do-registration',
  imports: [
    MatButton,
    MatIconButton,
    MatButtonModule,
    MatIconModule,
    MatSuffix,
    MatInput,
    MatFormField,
    MatLabel,
    MatError,
    FormsModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './to-do-registration.html',
  styleUrl: './to-do-registration.css',
})
export class ToDoRegistration {
  readonly dialogRef = inject(MatDialogRef<ToDoRegistration>);
  private supabase = inject(Supabase);

  model = {
    email: '',
    password: '',
    username: '',
  };

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    this.hide.set(!this.hide());
    event.stopPropagation();
  }

  async registration(): Promise<void> {
    const email = this.model.email.trim();
    const password = this.model.password.trim();
    const username = this.model.username.trim();

    const { data, error } = await this.supabase.signUp(email, password, username);

    if (error) {
      console.error('Ошибка регистрации:', error);
      return;
    }

    console.log('Пользователь зарегистрирован:', data.user);

    this.dialogRef.close();
  }
}
