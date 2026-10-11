import { Task } from './task.interface';
import { TaskMember } from './roles.interface';

export type CreateTask = Omit<Task, 'id' | 'created_at' | 'roles' | 'task_members'> & {
  task_members: Pick<TaskMember, 'user_id' | 'role'>[];
};
