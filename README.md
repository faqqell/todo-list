# Todo

Мобильное приложение списка задач на Expo, React Native и TypeScript.

## Возможности

- Создание и редактирование задач с описанием, дедлайном и приоритетом.
- Отметка выполнения и удаление с подтверждением.
- Фильтры «Все», «Активные», «Выполненные» и поиск по названию.
- Локальное сохранение задач через AsyncStorage.
- Светлая и тёмная темы: системная тема выбирается автоматически, переключатель находится в верхней части экрана.
- Адаптация под Safe Area iOS и Android, анимация изменений списка.

## Структура

```text
.
├── App.tsx
├── app.json
├── src/
│   ├── components/
│   │   ├── TaskCard.tsx
│   │   └── TaskEditorModal.tsx
│   ├── hooks/
│   │   └── useTasks.ts
│   ├── screens/
│   │   └── HomeScreen.tsx
│   ├── theme/
│   │   └── colors.ts
│   └── types/
│       └── task.ts
└── package.json
```

## Зависимости

Основные пакеты установлены при создании проекта. Expo подобрал совместимые с SDK версии:

```bash
npx expo install @react-native-async-storage/async-storage @react-native-community/datetimepicker react-native-safe-area-context @expo/vector-icons
```

## Запуск

```bash
npm install
npx expo start
```

Откройте проект в Expo Go, отсканировав QR-код. Для запуска на подключённом симуляторе или эмуляторе используйте `npm run ios` или `npm run android`.

Проверка типов:

```bash
npx tsc --noEmit
```# todo-list
