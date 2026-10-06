import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';

@Service()
export class AuthService {
  private supabase = inject(Supabase).client;

  signUp(email: string, password: string, username: string) {
    return this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: username,
        },
      },
    });
  }

  signIn(email: string, password: string) {
    return this.supabase.auth.signInWithPassword({
      email,
      password,
    });
  }

  signOut() {
    return this.supabase.auth.signOut();
  }
}
