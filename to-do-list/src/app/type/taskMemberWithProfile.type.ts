import { Profile } from '../interfaces/profile.interface';
import { TaskMember } from '../interfaces/roles.interface';

export type TaskMemberWithProfile = TaskMember & {
  profiles: Pick<Profile, 'username' | 'avatar_url'> | null;
};
