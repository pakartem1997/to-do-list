import { Roles } from '../constants/roles.constants';

export interface TaskMember {
  created_at: string;
  id: number;
  role: Roles | null;
  task_id: number;
  user_id: string | null;
}
