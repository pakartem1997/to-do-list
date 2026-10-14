import { inject, Service, signal } from '@angular/core';
import { TaskMemberWithProfile } from '../type/taskMemberWithProfile.type';
import { MemberService } from './member';
import { finalize, Observable, tap } from 'rxjs';
import { Roles } from '../constants/roles.constants';
import { TaskMember } from '../interfaces/roles.interface';

@Service()
export class MemberStore {
  private readonly memberService = inject(MemberService);

  private readonly membersSignal = signal<TaskMemberWithProfile[]>([]);
  readonly members = this.membersSignal.asReadonly();

  private readonly isSignalLoading = signal(false);
  readonly isLoading = this.isSignalLoading.asReadonly();

  getTaskMembers(taskId: number): Observable<TaskMemberWithProfile[]> {
    this.isSignalLoading.set(true);

    return this.memberService.getTaskMembers(taskId).pipe(
      tap((members) => {
        this.membersSignal.set(members);
      }),
      finalize(() => this.isSignalLoading.set(false)),
    );
  }

  addMember(taskId: number, userId: string, role: Roles): Observable<TaskMember> {
    return this.memberService.addMember(taskId, userId, role).pipe(
      tap((member) => {
        this.membersSignal.update((members) => [...members, member as TaskMemberWithProfile]);
      }),
    );
  }

  removeMember(id: number): Observable<void> {
    return this.memberService.removeMember(id).pipe(
      tap(() => {
        this.membersSignal.update((members) => members.filter((member) => member.id !== id));
      }),
    );
  }
}
