import { Roles } from '../type/roles.type';

export interface TaskMemberRow {
  user_id: string;
  role: Roles | null;
}
