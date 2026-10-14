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
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast';
@Component({
  selector: 'app-to-do-sign-in',
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
  templateUrl: './to-do-sign-in.html',
  styleUrl: './to-do-sign-in.css',
})
export class ToDoSignIn {
  private readonly dialogRef = inject(MatDialogRef<ToDoSignIn>);
  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);

  model = {
    email: '',
    password: '',
    username: '',
  };

  hide = signal(true);

  clickEvent(event: MouseEvent) {
    event.stopPropagation();
    this.hide.set(!this.hide());
  }

  async signIn(): Promise<void> {
    const email = this.model.email.trim();
    const password = this.model.password.trim();

    const { error } = await this.authService.signIn(email, password);

    if (error) {
      this.toastService.showToast('Sign in failed!');
      return;
    }

    this.toastService.showToast('Signed in successfully!');
    this.dialogRef.close();
  }
}
