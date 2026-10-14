import { inject, Service } from '@angular/core';
import { Supabase } from './supabase';
import { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';

@Service()
export class UserService {
  private readonly supabase = inject(Supabase).client;

  getUser(): Observable<User | null> {
    return from(
      this.supabase.auth.getUser().then(({ data, error }) => {
        if (error) {
          throw error;
        }

        return data.user;
      }),
    );
  }

  authStateChanges(): Observable<{ event: AuthChangeEvent; session: Session | null }> {
    return new Observable((subscriber) => {
      const { data } = this.supabase.auth.onAuthStateChange((event, session) => {
        subscriber.next({ event, session });
      });
      return () => data.subscription.unsubscribe();
    });
  }
}
