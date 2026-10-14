export type TaskHistoryAction =
  | 'task_created'
  | 'status_changed'
  | 'title_changed'
  | 'description_changed'
  | 'member_added'
  | 'member_removed'
  | 'role_changed';
