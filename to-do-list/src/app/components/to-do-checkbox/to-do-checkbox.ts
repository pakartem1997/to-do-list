import { Component, output } from '@angular/core';

@Component({
  selector: 'input[app-checkbox]',
  template: `<ng-content />`,
  host: {
    '(click)': 'toggle($event)',
  },
})
export class ToDoCheckbox {
  checkedChange = output<void>();

  toggle(event: MouseEvent): void {
    event.stopPropagation();

    this.checkedChange.emit();
  }
}
