import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { from } from 'rxjs';

@Service()
export class ProfileService {
  private readonly supabase = inject(Supabase).client;

  getUsers() {
    return from(
      this.supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .order('username')
        .then(({ data, error }) => {
          if (error) {
            throw error;
          }

          return data;
        }),
    );
  }
}
