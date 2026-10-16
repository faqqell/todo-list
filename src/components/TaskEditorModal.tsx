import { Feather } from '@expo/vector-icons';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import type { AppTheme } from '../theme/colors';
import type { TaskDraft, TaskPriority, TodoTask } from '../types/task';

interface TaskEditorModalProps {
  visible: boolean;
  task: TodoTask | null;
  theme: AppTheme;
  onClose: () => void;
  onSave: (draft: TaskDraft) => void;
}

const priorities: { value: TaskPriority; label: string }[] = [
  { value: 'low', label: 'Низкий' },
  { value: 'medium', label: 'Средний' },
  { value: 'high', label: 'Высокий' },
];

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function TaskEditorModal({
  visible,
  task,
  theme,
  onClose,
  onSave,
}: TaskEditorModalProps) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [dueDate, setDueDate] = useState<Date | null>(
    task?.dueDate ? new Date(task.dueDate) : null,
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [validationError, setValidationError] = useState('');
  const isEditing = task !== null;

  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date): void => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      setDueDate(selectedDate);
    }
  };

  const handleSave = (): void => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      setValidationError('Добавь название задачи');
      return;
    }
    onSave({
      title: trimmedTitle,
      description: description.trim(),
      dueDate: dueDate?.toISOString() ?? null,
      priority,
      completed: task?.completed ?? false,
    });
  };

  const inputStyle = [
    styles.input,
    { color: theme.text, backgroundColor: theme.surface, borderColor: theme.border },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.sheet, { backgroundColor: theme.background }]}>
          <View style={styles.handleRow}>
            <View style={[styles.handle, { backgroundColor: theme.border }]} />
          </View>
          <View style={styles.header}>
            <View>
              <Text style={[styles.eyebrow, { color: theme.accent }]}>ЗАДАЧА</Text>
              <Text style={[styles.heading, { color: theme.text }]}>
                {isEditing ? 'Изменить' : 'Новая задача'}
              </Text>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Закрыть редактор"
              onPress={onClose}
              style={[styles.closeButton, { backgroundColor: theme.surfaceRaised }]}
            >
              <Feather name="x" size={18} color={theme.text} />
            </Pressable>
          </View>

          <ScrollView
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.form}
          >
            <Text style={[styles.label, { color: theme.text }]}>Название</Text>
            <TextInput
              value={title}
              onChangeText={(value: string) => {
                setTitle(value);
                if (validationError) setValidationError('');
              }}
              placeholder="Например, купить продукты"
              placeholderTextColor={theme.subtle}
              maxLength={100}
              returnKeyType="next"
              style={inputStyle}
              autoFocus={false}
            />
            {validationError.length > 0 && (
              <Text style={[styles.error, { color: theme.danger }]}>{validationError}</Text>
            )}

            <Text style={[styles.label, styles.spacedLabel, { color: theme.text }]}>
              Описание <Text style={{ color: theme.muted }}>· необязательно</Text>
            </Text>
            <TextInput
              value={description}
              onChangeText={setDescription}
              placeholder="Добавь детали или заметку"
              placeholderTextColor={theme.subtle}
              maxLength={500}
              multiline
              textAlignVertical="top"
              style={[inputStyle, styles.descriptionInput]}
            />

            <Text style={[styles.label, styles.spacedLabel, { color: theme.text }]}>
              Приоритет
            </Text>
            <View style={styles.priorityRow}>
              {priorities.map((option) => {
                const selected = priority === option.value;
                const color = {
                  low: theme.low,
                  medium: theme.medium,
                  high: theme.high,
                }[option.value];
                return (
                  <Pressable
                    accessibilityRole="radio"
                    accessibilityState={{ selected }}
                    key={option.value}
                    onPress={() => setPriority(option.value)}
                    style={[
                      styles.priorityOption,
                      {
                        backgroundColor: selected ? color : theme.surface,
                        borderColor: selected ? color : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        { color: selected ? '#FFFFFF' : theme.muted },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, styles.spacedLabel, { color: theme.text }]}>
              Дедлайн
            </Text>
            <View style={styles.dateRow}>
              <Pressable
                accessibilityRole="button"
                onPress={() => setShowDatePicker((isShown) => !isShown)}
                style={[
                  styles.dateButton,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <Feather name="calendar" size={16} color={theme.accent} />
                <Text style={[styles.dateText, { color: dueDate ? theme.text : theme.muted }]}>
                  {dueDate ? formatDate(dueDate) : 'Выбрать дату'}
                </Text>
              </Pressable>
              {dueDate && (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Убрать дедлайн"
                  onPress={() => setDueDate(null)}
                  style={styles.clearDateButton}
                >
                  <Feather name="x" size={16} color={theme.muted} />
                </Pressable>
              )}
            </View>
            {showDatePicker && (
              <View style={[styles.pickerWrap, { backgroundColor: theme.surface }]}>
                <DateTimePicker
                  value={dueDate ?? new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                />
              </View>
            )}
          </ScrollView>

          <View style={[styles.footer, { borderTopColor: theme.border }]}>
            <Pressable
              accessibilityRole="button"
              onPress={handleSave}
              style={[styles.saveButton, { backgroundColor: theme.accent }]}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Сохранить изменения' : 'Добавить задачу'}
              </Text>
              <Feather name="arrow-up-right" size={17} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(9, 16, 12, 0.48)',
  },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: Platform.OS === 'ios' ? 28 : 16,
  },
  handleRow: {
    alignItems: 'center',
    paddingTop: 10,
  },
  handle: {
    width: 38,
    height: 4,
    borderRadius: 2,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    paddingHorizontal: 22,
    paddingBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 8,
  },
  spacedLabel: {
    marginTop: 19,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 13,
    fontSize: 14,
  },
  descriptionInput: {
    height: 86,
    paddingTop: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
  priorityRow: {
    flexDirection: 'row',
    columnGap: 8,
  },
  priorityOption: {
    flex: 1,
    minHeight: 40,
    borderWidth: 1,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '600',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 8,
  },
  dateButton: {
    flex: 1,
    minHeight: 46,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 10,
  },
  dateText: {
    fontSize: 14,
  },
  clearDateButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pickerWrap: {
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 8,
    overflow: 'hidden',
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  saveButton: {
    minHeight: 50,
    borderRadius: 11,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});