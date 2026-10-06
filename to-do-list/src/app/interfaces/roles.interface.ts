import { Roles } from '../type/roles.type';

export interface TaskMember {
  userId: string | null;
  role: Roles | null;
  username?: string;
  avatarUrl?: string;
}
