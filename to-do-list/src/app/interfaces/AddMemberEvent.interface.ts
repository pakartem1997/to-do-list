import { Roles } from '../constants/roles.constants';

export interface AddMemberEvent {
  userId: string;
  role: Roles;
}
