import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-to-do-user-avatar',
  imports: [],
  templateUrl: './to-do-user-avatar.html',
  styleUrl: './to-do-user-avatar.css',
})
export class ToDoUserAvatar {
  imageUrl = input<string>('');
  name = input<string>('unknown');

  avatarColor = computed(() => {
    const colors = [
      '#E57373',
      '#64B5F6',
      '#81C784',
      '#BA68C8',
      '#FFB74D',
      '#4DB6AC',
      '#7986CB',
      '#A1887F',
    ];

    const value = this.name()
      .split('')
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);

    return colors[value % colors.length];
  });
}
