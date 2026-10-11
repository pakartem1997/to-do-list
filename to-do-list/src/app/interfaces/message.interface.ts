import { Profile } from './profile.interface';

export interface ChatMessage {
  id: number;
  profile: Profile;
  text: string;
  created_at: string;
  user_id: string;
  task_id: number;
}
