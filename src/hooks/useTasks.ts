import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import type { TodoTask } from '../types/task';

const STORAGE_KEY = '@todo/tasks-v1';

export interface UseTasksResult {
  tasks: TodoTask[];
  setTasks: React.Dispatch<React.SetStateAction<TodoTask[]>>;
  isLoading: boolean;
}

export function useTasks(): UseTasksResult {
  const [tasks, setTasks] = useState<TodoTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const writeQueue = useRef<Promise<void>>(Promise.resolve());

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async (): Promise<void> => {
      try {
        const storedTasks = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedTasks && isMounted) {
          const parsedTasks: unknown = JSON.parse(storedTasks);
          if (Array.isArray(parsedTasks)) {
            setTasks(parsedTasks as TodoTask[]);
          }
        }
      } catch (error) {
        console.warn('Не удалось загрузить задачи:', error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadTasks();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    writeQueue.current = writeQueue.current
      .then(() => AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)))
      .catch((error: unknown) => {
        console.warn('Не удалось сохранить задачи:', error);
      });
  }, [isLoading, tasks]);

  return { tasks, setTasks, isLoading };
}