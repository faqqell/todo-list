import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { AppTheme } from '../theme/colors';
import { taskCategories } from '../types/category';
import type { TodoTask } from '../types/task';

interface TaskCardProps {
  task: TodoTask;
  theme: AppTheme;
  mode: 'light' | 'dark';
  onToggle: (taskId: string) => void;
  onEdit: (task: TodoTask) => void;
  onDelete: (task: TodoTask) => void;
}

const priorityLabels: Record<TodoTask['priority'], string> = {
  low: 'Низкий',
  medium: 'Средний',
  high: 'Высокий',
};

function formatDueDate(value: string): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'short',
  }).format(new Date(value));
}

export function TaskCard({
  task,
  theme,
  mode,
  onToggle,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const priorityColor = {
    low: theme.low,
    medium: theme.medium,
    high: theme.high,
  }[task.priority];
  const category = taskCategories.find((item) => item.id === task.categoryId) ?? taskCategories[1];
  const categoryColor = mode === 'dark' ? category.darkColor : category.lightColor;
  const categoryBackground = mode === 'dark' ? category.darkBackground : category.lightBackground;
  const isOverdue =
    task.dueDate !== null &&
    !task.completed &&
    new Date(task.dueDate).getTime() < new Date().setHours(0, 0, 0, 0);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.surface, borderColor: theme.border },
        task.completed && styles.completedContainer,
      ]}
    >
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: task.completed }}
        accessibilityLabel={`${task.completed ? 'Вернуть в активные' : 'Отметить выполненной'}: ${task.title}`}
        onPress={() => onToggle(task.id)}
        style={styles.checkButton}
        hitSlop={8}
      >
        <View
          style={[
            styles.checkbox,
            {
              borderColor: task.completed ? theme.success : theme.border,
              backgroundColor: task.completed ? theme.success : 'transparent',
            },
          ]}
        >
          {task.completed && <Feather name="check" size={13} color="#FFFFFF" />}
        </View>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Редактировать задачу ${task.title}`}
        onPress={() => onEdit(task)}
        style={styles.content}
      >
        <View style={[styles.categoryTag, { backgroundColor: categoryBackground }]}>
          <Feather name={category.icon} size={10} color={categoryColor} />
          <Text style={[styles.categoryText, { color: categoryColor }]} numberOfLines={1}>
            {category.label}
          </Text>
        </View>
        <Text
          numberOfLines={2}
          style={[
            styles.title,
            { color: task.completed ? theme.muted : theme.text },
            task.completed && styles.completedTitle,
          ]}
        >
          {task.title}
        </Text>
        {task.description.length > 0 && (
          <Text numberOfLines={2} style={[styles.description, { color: theme.muted }]}>
            {task.description}
          </Text>
        )}
        <View style={styles.metaRow}>
          <View style={styles.priorityMeta}>
            <View style={[styles.priorityDot, { backgroundColor: priorityColor }]} />
            <Text style={[styles.metaText, { color: theme.muted }]}>
              {priorityLabels[task.priority]}
            </Text>
          </View>
          {task.dueDate !== null && (
            <View style={styles.dueMeta}>
              <Feather
                name="calendar"
                size={12}
                color={isOverdue ? theme.danger : theme.muted}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: isOverdue ? theme.danger : theme.muted },
                ]}
              >
                {formatDueDate(task.dueDate)}
              </Text>
            </View>
          )}
        </View>
      </Pressable>

      <View style={styles.actions}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Изменить ${task.title}`}
          onPress={() => onEdit(task)}
          hitSlop={7}
          style={styles.actionButton}
        >
          <Feather name="edit-2" size={16} color={theme.muted} />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Удалить ${task.title}`}
          onPress={() => onDelete(task)}
          hitSlop={7}
          style={styles.actionButton}
        >
          <Feather name="trash-2" size={16} color={theme.muted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 94,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  completedContainer: {
    opacity: 0.76,
  },
  checkButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    marginTop: 1,
  },
  checkbox: {
    width: 21,
    height: 21,
    borderRadius: 7,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  categoryTag: {
    alignSelf: 'flex-start',
    minHeight: 20,
    borderRadius: 6,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 4,
    marginBottom: 5,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '700',
  },
  title: {
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600',
  },
  completedTitle: {
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    columnGap: 13,
    rowGap: 6,
    marginTop: 10,
  },
  priorityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dueMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    columnGap: 7,
  },
  actionButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
});