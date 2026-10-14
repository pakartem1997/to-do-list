import { TaskHistoryAction } from '../type/taskHistoryAction.tupe';
import { Profile } from './profile.interface';

export interface TaskHistory {
  id: number;
  task_id: number;
  user_id: string;
  action: TaskHistoryAction;
  details: Record<string, unknown>;
  created_at: string;
  profile?: Profile | null;
}
