export interface RoleOption {
  value: string;
  label: string;
}

export const ROLES: RoleOption[] = [
  { value: 'Creator', label: 'Creator' },
  { value: 'Responsible', label: 'Responsible' },
  { value: 'Assignee', label: 'Assignee' },
  { value: 'Reviewer', label: 'Reviewer' },
  { value: 'Tester', label: 'Tester' },
  { value: 'Executor', label: 'Executor' },
];

export type Roles = (typeof ROLES)[number]['value'];
