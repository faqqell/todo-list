import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  UIManager,
  View,
  useColorScheme,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { TaskCard } from '../components/TaskCard';
import { TaskEditorModal } from '../components/TaskEditorModal';
import { useTasks } from '../hooks/useTasks';
import { themes } from '../theme/colors';
import type { AppTheme } from '../theme/colors';
import type { TaskDraft, TaskFilter, TodoTask } from '../types/task';

const filterOptions: { key: TaskFilter; label: string }[] = [
  { key: 'all', label: 'Все' },
  { key: 'active', label: 'Активные' },
  { key: 'completed', label: 'Выполненные' },
];

if (Platform.OS === 'android') {
  const androidUIManager = UIManager as typeof UIManager & {
    setLayoutAnimationEnabledExperimental?: (enabled: boolean) => void;
  };
  androidUIManager.setLayoutAnimationEnabledExperimental?.(true);
}

function todayLabel(): string {
  return new Intl.DateTimeFormat('ru-RU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(new Date());
}

function FilterTab({
  label,
  count,
  selected,
  theme,
  onPress,
}: {
  label: string;
  count: number;
  selected: boolean;
  theme: AppTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.filterTab,
        selected && { backgroundColor: theme.text },
      ]}
    >
      <Text style={[styles.filterLabel, { color: selected ? theme.background : theme.muted }]}>
        {label}
      </Text>
      <Text style={[styles.filterCount, { color: selected ? theme.background : theme.subtle }]}>
        {count}
      </Text>
    </Pressable>
  );
}

export function HomeScreen() {
  const systemScheme = useColorScheme();
  const [themeOverride, setThemeOverride] = useState<'light' | 'dark' | null>(null);
  const [filter, setFilter] = useState<TaskFilter>('all');
  const [search, setSearch] = useState('');
  const [editorVisible, setEditorVisible] = useState(false);
  const [editorSession, setEditorSession] = useState(0);
  const [editingTask, setEditingTask] = useState<TodoTask | null>(null);
  const { tasks, setTasks, isLoading } = useTasks();
  const insets = useSafeAreaInsets();
  const colorMode = themeOverride ?? (systemScheme === 'dark' ? 'dark' : 'light');
  const theme = themes[colorMode];
  const activeTasks = tasks.filter((task) => !task.completed);
  const completedCount = tasks.length - activeTasks.length;
  const progress = tasks.length === 0 ? 0 : completedCount / tasks.length;
  const query = search.trim().toLocaleLowerCase('ru-RU');

  const visibleTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filter === 'active' && task.completed) return false;
        if (filter === 'completed' && !task.completed) return false;
        return task.title.toLocaleLowerCase('ru-RU').includes(query);
      })
      .sort((first, second) => {
        return Number(first.completed) - Number(second.completed) ||
          second.createdAt.localeCompare(first.createdAt);
      });
  }, [filter, query, tasks]);

  const counts: Record<TaskFilter, number> = {
    all: tasks.length,
    active: activeTasks.length,
    completed: completedCount,
  };

  const openCreateModal = (): void => {
    setEditingTask(null);
    setEditorSession((session) => session + 1);
    setEditorVisible(true);
  };

  const openEditModal = (task: TodoTask): void => {
    setEditingTask(task);
    setEditorSession((session) => session + 1);
    setEditorVisible(true);
  };

  const closeEditor = (): void => {
    setEditorVisible(false);
  };

  const saveTask = (draft: TaskDraft): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const now = new Date().toISOString();
    if (editingTask) {
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === editingTask.id
            ? { ...task, ...draft, updatedAt: now }
            : task,
        ),
      );
    } else {
      const newTask: TodoTask = {
        ...draft,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((currentTasks) => [newTask, ...currentTasks]);
    }
    setEditorVisible(false);
  };

  const toggleTask = (taskId: string): void => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const now = new Date().toISOString();
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === taskId
          ? { ...task, completed: !task.completed, updatedAt: now }
          : task,
      ),
    );
  };

  const confirmDelete = (task: TodoTask): void => {
    Alert.alert('Удалить задачу?', `«${task.title}» будет удалена без возможности восстановления.`, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: () => {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
          setTasks((currentTasks) => currentTasks.filter((item) => item.id !== task.id));
        },
      },
    ]);
  };

  const toggleTheme = (): void => {
    setThemeOverride(colorMode === 'dark' ? 'light' : 'dark');
  };

  const emptyTitle = query.length > 0
    ? 'Ничего не нашлось'
    : filter === 'completed'
      ? 'Пока без галочек'
      : filter === 'active' && tasks.length > 0
        ? 'Все задачи сделаны'
        : 'Начни с одной задачи';
  const emptyMessage = query.length > 0
    ? 'Попробуй изменить поисковый запрос.'
    : filter === 'completed'
      ? 'Выполненные задачи появятся здесь.'
      : filter === 'active' && tasks.length > 0
        ? 'Отличная работа. Список свободен.'
        : 'Запиши то, что важно сделать сегодня.';

  return (
    <SafeAreaView
      edges={['top', 'left', 'right']}
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar style={colorMode === 'dark' ? 'light' : 'dark'} />
      <View style={styles.page}>
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.accent }]}>МОЙ СПИСОК</Text>
            <Text style={[styles.dateLabel, { color: theme.muted }]}>{todayLabel()}</Text>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={colorMode === 'dark' ? 'Включить светлую тему' : 'Включить тёмную тему'}
            onPress={toggleTheme}
            style={[styles.themeButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Feather name={colorMode === 'dark' ? 'sun' : 'moon'} size={17} color={theme.text} />
          </Pressable>
        </View>

        <View style={styles.titleBlock}>
          <Text style={[styles.pageTitle, { color: theme.text }]}>Планируй.{ '\n' }Делай.</Text>
          <Text style={[styles.subtitle, { color: theme.muted }]}>Маленькие шаги тоже ведут вперёд.</Text>
        </View>

        <View style={[styles.progressPanel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={[styles.progressEyebrow, { color: theme.muted }]}>СЕГОДНЯ В ПЛАНЕ</Text>
              <Text style={[styles.progressTitle, { color: theme.text }]}>
                {activeTasks.length === 0 && tasks.length > 0
                  ? 'Всё выполнено'
                  : `${activeTasks.length} ${activeTasks.length === 1 ? 'задача' : activeTasks.length > 1 && activeTasks.length < 5 ? 'задачи' : 'задач'} впереди`}
              </Text>
            </View>
            <View style={[styles.progressBadge, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.progressBadgeText, { color: theme.accentText }]}>
                {completedCount}/{tasks.length}
              </Text>
            </View>
          </View>
          <View style={[styles.progressTrack, { backgroundColor: theme.surfaceRaised }]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: theme.accent, width: `${progress * 100}%` },
              ]}
            />
          </View>
        </View>

        <View style={[styles.searchField, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="search" size={17} color={theme.muted} />
          <TextInput
            accessibilityLabel="Поиск задач"
            value={search}
            onChangeText={setSearch}
            placeholder="Найти задачу"
            placeholderTextColor={theme.subtle}
            returnKeyType="search"
            style={[styles.searchInput, { color: theme.text }]}
          />
          {search.length > 0 && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Очистить поиск"
              onPress={() => setSearch('')}
              hitSlop={8}
            >
              <Feather name="x-circle" size={17} color={theme.muted} />
            </Pressable>
          )}
        </View>

        <View accessibilityRole="tablist" style={styles.filterRow}>
          {filterOptions.map((option) => (
            <FilterTab
              key={option.key}
              label={option.label}
              count={counts[option.key]}
              selected={filter === option.key}
              theme={theme}
              onPress={() => setFilter(option.key)}
            />
          ))}
        </View>

        <View style={styles.listHeading}>
          <Text style={[styles.listTitle, { color: theme.text }]}>
            {filter === 'completed' ? 'Готово' : filter === 'active' ? 'В процессе' : 'Мои задачи'}
          </Text>
          <Text style={[styles.listCount, { color: theme.muted }]}>
            {visibleTasks.length} шт.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.accent} />
          </View>
        ) : visibleTasks.length === 0 ? (
          <View style={[styles.emptyState, { borderColor: theme.border }]}>
            <View style={[styles.emptyIcon, { backgroundColor: theme.surfaceRaised }]}>
              <Feather name={query ? 'search' : 'check'} size={20} color={theme.accent} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text }]}>{emptyTitle}</Text>
            <Text style={[styles.emptyMessage, { color: theme.muted }]}>{emptyMessage}</Text>
          </View>
        ) : (
          <FlatList
            data={visibleTasks}
            keyExtractor={(task) => task.id}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                theme={theme}
                onToggle={toggleTask}
                onEdit={openEditModal}
                onDelete={confirmDelete}
              />
            )}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.taskList}
            keyboardShouldPersistTaps="handled"
          />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Добавить задачу"
          onPress={openCreateModal}
          style={[
            styles.addButton,
            { backgroundColor: theme.accent, marginBottom: Math.max(insets.bottom, 14) },
          ]}
        >
          <Feather name="plus" size={21} color="#FFFFFF" />
          <Text style={styles.addButtonText}>Новая задача</Text>
        </Pressable>
      </View>

      <TaskEditorModal
        key={editorSession}
        visible={editorVisible}
        task={editingTask}
        theme={theme}
        onClose={closeEditor}
        onSave={saveTask}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  page: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 7,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  dateLabel: {
    fontSize: 12,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleBlock: {
    marginTop: 20,
    marginBottom: 18,
  },
  pageTitle: {
    fontSize: 34,
    lineHeight: 37,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 13,
    marginTop: 8,
  },
  progressPanel: {
    borderWidth: 1,
    borderRadius: 13,
    padding: 15,
    marginBottom: 14,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressEyebrow: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginTop: 4,
  },
  progressBadge: {
    minWidth: 43,
    height: 31,
    paddingHorizontal: 8,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  progressTrack: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 13,
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  searchField: {
    height: 46,
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  searchInput: {
    flex: 1,
    minWidth: 0,
    height: '100%',
    fontSize: 14,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 5,
    marginTop: 12,
    marginBottom: 19,
  },
  filterTab: {
    minHeight: 35,
    paddingHorizontal: 10,
    borderRadius: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 6,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
  filterCount: {
    fontSize: 10,
    fontWeight: '700',
  },
  listHeading: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  listCount: {
    fontSize: 11,
  },
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 2,
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  emptyIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 6,
    maxWidth: 250,
  },
  taskList: {
    paddingBottom: 8,
  },
  addButton: {
    minHeight: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    columnGap: 8,
    marginTop: 12,
    shadowColor: '#17241C',
    shadowOpacity: 0.13,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});