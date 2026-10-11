import { TodoStatus } from '../type/todo-status.type';
import { TaskMember } from './roles.interface';

export interface Task {
  id: number;
  text: string;
  description: string;
  status: TodoStatus | null;
  task_members: TaskMember[];
  order: number;
  created_at: string;
}
