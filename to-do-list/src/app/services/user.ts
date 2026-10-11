import { computed, inject, Service, signal } from '@angular/core';
import { Supabase } from './supabase';
import { User } from '@supabase/supabase-js';

@Service()
export class UserService {
  private supabase = inject(Supabase).client;

  readonly user = signal<User | null>(null);
  readonly userId = computed(() => this.user()?.id ?? null);

  displayName = computed(() => this.user()?.user_metadata?.['display_name'] ?? this.user()?.email);

  readonly isAuthenticated = computed(() => this.user() !== null);

  constructor() {
    this.init();
  }

  private async init() {
    const { data, error } = await this.supabase.auth.getUser();

    if (error) {
      throw new Error('Произошла ошибка');
    }

    this.user.set(data.user);

    this.supabase.auth.onAuthStateChange((_event, session) => {
      this.user.set(session?.user ?? null);
    });
  }
}
