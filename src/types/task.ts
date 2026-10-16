export type TaskPriority = 'low' | 'medium' | 'high';

export type TaskCategoryId = 'work' | 'personal' | 'shopping' | 'study';

export type TaskFilter = 'all' | 'active' | 'completed';

export interface TodoTask {
  id: string;
  title: string;
  description: string;
  dueDate: string | null;
  categoryId: TaskCategoryId;
  priority: TaskPriority;
  completed: boolean;
  createdAt: string;
  updatedAt: string;
}

export type TaskDraft = Pick<
  TodoTask,
  'title' | 'description' | 'dueDate' | 'categoryId' | 'priority' | 'completed'
>;