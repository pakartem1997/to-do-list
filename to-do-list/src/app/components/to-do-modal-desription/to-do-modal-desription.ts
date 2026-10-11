import { Component, inject } from '@angular/core';
import { MatButton, MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA,
  MatDialogContent,
  MatDialogActions,
  MatDialogClose,
  MatDialogTitle,
} from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-to-do-modal-desription',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatDialogClose,
    MatDialogTitle,
    MatDialogContent,
    MatIcon,
    MatButton,
  ],
  templateUrl: './to-do-modal-desription.html',
  styleUrl: './to-do-modal-desription.css',
})
export class ToDoModalDesription {
  data = inject(MAT_DIALOG_DATA);
}
