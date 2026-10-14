import { computed, DestroyRef, inject, Service, signal } from '@angular/core';
import { UserService } from './user';
import { User } from '@supabase/supabase-js';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Service()
export class UserStore {
  private readonly userService = inject(UserService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly userSignal = signal<User | null>(null);
  private readonly loadingSignal = signal(true);

  readonly user = this.userSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();

  readonly isAuthenticated = computed(() => this.userSignal() !== null);
  readonly userId = computed<string | null>(() => this.userSignal()?.id ?? null);
  readonly displayName = computed(
    () => this.userSignal()?.user_metadata?.['display_name'] ?? this.userSignal()?.email ?? '',
  );

  constructor() {
    this.init();
  }

  private init(): void {
    this.userService
      .getUser()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (user) => {
          this.userSignal.set(user);
          this.loadingSignal.set(false);
        },
        error: () => {
          this.userSignal.set(null);
          this.loadingSignal.set(false);
        },
      });

    this.userService
      .authStateChanges()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ event, session }) => {
        switch (event) {
          case 'INITIAL_SESSION':
            console.log('INITIAL_SESSION');
            break;
          case 'SIGNED_IN':
            console.log('SIGNED_IN');
            this.userSignal.set(session?.user ?? null);
            break;
          case 'TOKEN_REFRESHED':
            console.log('TOKEN_REFRESHED');
            break;
          case 'USER_UPDATED':
            console.log('USER_UPDATED');
            break;
          case 'SIGNED_OUT':
            console.log('SIGNED_OUT');
            this.userSignal.set(null);
            break;
          case 'PASSWORD_RECOVERY':
            console.log('PASSWORD_RECOVERY');
            break;
        }
      });
  }
}
