import { Component, inject, input, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { ToDoModalDesription } from '../to-do-modal-desription/to-do-modal-desription';

@Component({
  selector: 'app-to-do-desription',
  imports: [MatIcon, MatButtonModule, FormsModule, MatFormFieldModule, MatInputModule],
  templateUrl: './to-do-desription.html',
  styleUrl: './to-do-desription.css',
})
export class ToDoDesription {
  private readonly dialog = inject(MatDialog);

  textDesription = input<string>('');

  isEdit = signal(false);
  editedDescription = '';

  descriptionChange = output<string>();

  openDialog() {
    this.dialog.open(ToDoModalDesription, {
      data: {
        textDesription: this.textDesription(),
      },
    });
  }

  startEdit() {
    this.editedDescription = this.textDesription();
    this.isEdit.set(true);
  }

  saveEdit() {
    this.isEdit.set(false);
    this.descriptionChange.emit(this.editedDescription);
  }

  cancelEdit() {
    this.isEdit.set(false);
  }
}
