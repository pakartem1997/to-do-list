import { computed, inject, Service, signal } from '@angular/core';
import { Supabase } from './supabase';
import { User } from '@supabase/supabase-js';

@Service()
export class AuthService {
  private supabase = inject(Supabase);

  readonly user = signal<User | null>(null);

  displayName = computed(() => this.user()?.user_metadata?.['display_name'] ?? this.user()?.email);

  readonly isAuthenticated = () => this.user() !== null;

  constructor() {
    this.init();
  }

  private async init(): Promise<void> {
    const user = await this.supabase.getUser();

    this.user.set(user);

    this.supabase.authChanges((event, session) => {
      this.user.set(session?.user ?? null);
    });
  }

  async signUp(email: string, password: string, displayName: string) {
    return this.supabase.signUp(email, password, displayName);
  }

  signOut() {
    return this.supabase.signOut();
  }
}
