import type { TaskCategoryId } from './task';

export interface TaskCategory {
  id: TaskCategoryId;
  label: string;
  icon: 'briefcase' | 'heart' | 'shopping-bag' | 'book-open';
  lightColor: string;
  lightBackground: string;
  darkColor: string;
  darkBackground: string;
}

export const taskCategories: TaskCategory[] = [
  {
    id: 'work',
    label: 'Работа',
    icon: 'briefcase',
    lightColor: '#3F7187',
    lightBackground: '#E5F0F4',
    darkColor: '#91C3D5',
    darkBackground: '#263B43',
  },
  {
    id: 'personal',
    label: 'Личное',
    icon: 'heart',
    lightColor: '#39816D',
    lightBackground: '#E6F1EC',
    darkColor: '#8FC4AA',
    darkBackground: '#293D33',
  },
  {
    id: 'shopping',
    label: 'Покупки',
    icon: 'shopping-bag',
    lightColor: '#A66D24',
    lightBackground: '#F7EEDC',
    darkColor: '#E5BD79',
    darkBackground: '#423722',
  },
  {
    id: 'study',
    label: 'Учёба',
    icon: 'book-open',
    lightColor: '#80618D',
    lightBackground: '#F0EAF3',
    darkColor: '#C1A3CF',
    darkBackground: '#3A3041',
  },
];

export function isTaskCategoryId(value: unknown): value is TaskCategoryId {
  return taskCategories.some((category) => category.id === value);
}