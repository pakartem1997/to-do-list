import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToDoRegistration } from '../to-do-registration/to-do-registration';
import { MatButtonModule } from '@angular/material/button';
import { ToDoSignIn } from '../to-do-sign-in/to-do-sign-in';
import { AuthService } from '../../services/auth';
import { ToDoUserAvatar } from '../to-do-user-avatar/to-do-user-avatar';
import { UserStore } from '../../services/user-store';

@Component({
  selector: 'app-to-do-auth-actions',
  imports: [MatButtonModule, ToDoUserAvatar],
  templateUrl: './to-do-auth-actions.html',
  styleUrl: './to-do-auth-actions.css',
})
export class ToDoAuthActions {
  private readonly dialog = inject(MatDialog);
  private readonly authService = inject(AuthService);
  private readonly userStore = inject(UserStore);

  readonly displayName = this.userStore.displayName;

  openLogin(): void {
    this.dialog.open(ToDoSignIn, {
      width: '420px',
    });
  }

  openRegistration(): void {
    this.dialog.open(ToDoRegistration, {
      width: '420px',
    });
  }

  logout(): void {
    this.authService.signOut();
  }
}
