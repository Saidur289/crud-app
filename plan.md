# Plan: Dynamic Route for Todo Edit Page

## Goal
Replace the current **modal-based** todo update with a **dedicated edit page** using Expo Router's dynamic routes. When the user taps "Update" on a todo, they navigate to `/edit/[id]` where they can update the todo title and navigate back.

---

## Current Architecture

| File | Purpose |
|------|---------|
| [`app/_layout.tsx`](file:///d:/document/crud-app/crud-app/app/_layout.tsx) | Root layout — `Stack` navigator wrapped in `ThemeProvider` |
| [`app/index.jsx`](file:///d:/document/crud-app/crud-app/app/index.jsx) | Main todo list screen (add, toggle, delete, **modal update**) |
| [`context/ThemeContext.js`](file:///d:/document/crud-app/crud-app/context/ThemeContext.js) | Dark/light theme context with AsyncStorage persistence |
| [`data/todos.js`](file:///d:/document/crud-app/crud-app/data/todos.js) | Initial seed data (20 todos) |

> [!IMPORTANT]
> Currently, updating a todo uses an in-component `<Modal>`. We will replace this with navigation to a new dynamic route page.

---

## Implementation Steps

### Step 1 — Create a `TodoContext` (shared state)

Since the edit page needs to **read and write** the same todo list, we need to lift the `data` state out of `index.jsx` into a shared context.

**Create:** `context/TodoContext.js`

- Move `data`, `setData`, `isLoaded`, `addTodo`, `toggleTodo`, `deleteTodo`, and `updateTodo` into the context provider.
- Keep AsyncStorage load/save logic inside the provider.
- Export `useTodos()` hook.

---

### Step 2 — Create the dynamic route page

**Create:** `app/edit/[id].jsx`

Using Expo Router's file-based routing, a file at `app/edit/[id].jsx` automatically creates the route `/edit/:id`.

This page will:
1. Read `id` from `useLocalSearchParams()`.
2. Look up the todo from `TodoContext`.
3. Show an edit form (title input).
4. On "Save", call `updateTodo(id, newTitle)` from context, show a toast, and navigate back via `router.back()`.
5. Include a "Back" / cancel button.
6. Support dark/light theme using `useTheme()`.

---

### Step 3 — Update `app/index.jsx`

1. **Remove** all modal-related state and JSX (`editingTodo`, `editText`, `<Modal>`, `openEditModal`, `handleSaveUpdate`).
2. **Replace** `openEditModal(item)` with navigation:
   ```jsx
   import { useRouter } from 'expo-router';
   const router = useRouter();
   // On "Update" press:
   router.push(`/edit/${item.id}`);
   ```
3. **Replace** local `data` state with `useTodos()` from context.
4. Keep add-todo input, toggle, delete, and toast in this file.

---

### Step 4 — Update `app/_layout.tsx`

Wrap the `Stack` with **both** `ThemeProvider` and the new `TodoProvider`:

```tsx
<ThemeProvider>
  <TodoProvider>
    <Stack screenOptions={{ headerShown: false }} />
  </TodoProvider>
</ThemeProvider>
```

---

## File Changes Summary

| Action | File | What Changes |
|--------|------|-------------|
| **Create** | `context/TodoContext.js` | New shared todo state context + provider |
| **Create** | `app/edit/[id].jsx` | New dynamic route edit page |
| **Modify** | `app/index.jsx` | Remove modal, use context, navigate on "Update" |
| **Modify** | `app/_layout.tsx` | Add `TodoProvider` wrapper |

---

## Routing Structure (After)

```
app/
├── _layout.tsx          ← Stack (ThemeProvider + TodoProvider)
├── index.jsx            ← Todo list (home screen)
└── edit/
    └── [id].jsx         ← Dynamic edit page (/edit/1, /edit/2, …)
```

---

## Key Design Decisions

1. **Context over params:** We pass only the `id` via the route. The edit page fetches the full todo from `TodoContext` — this keeps the URL clean and avoids serialization issues.
2. **`router.back()` after save:** Provides natural navigation UX with the stack transition animation.
3. **No new dependencies required:** Everything uses existing `expo-router`, `react-native-reanimated`, and `AsyncStorage`.

> [!TIP]
> The edit page will include entry/exit animations using `react-native-reanimated` for a polished transition feel.

---

## Phase 2: Additional Features (Filtering & Clear Completed)

### Goal
Enhance the task management experience by adding the ability to filter tasks by their completion status and providing a quick action to clear all completed tasks.

### Features to Add

1. **Task Filtering (All / Pending / Completed):**
   - Add a segmented control / tab bar below the input field on `index.jsx`.
   - Update the `FlatList` to render a filtered list of tasks based on the selected tab.
2. **Clear Completed Tasks:**
   - Add a "Clear Completed" button that appears when there are completed tasks, allowing the user to bulk-delete them.

### Implementation Steps

**Step 1 — Update `TodoContext.js`**
- Add a new function `clearCompleted()` that filters out all completed tasks from the `data` state.
- Export `clearCompleted` in the context value.

**Step 2 — Update `index.jsx`**
- Create a state `const [filter, setFilter] = useState('All');` ('All', 'Pending', 'Completed').
- Add UI for filter tabs below the "Add Task" input.
- Create a derived variable `filteredData` that filters the `data` based on the active `filter`.
- Pass `filteredData` to the `FlatList` instead of `data`.
- Add a "Clear Completed" button (perhaps at the bottom or top of the list) that calls `clearCompleted()` and shows a toast.

### File Changes Summary

| Action | File | What Changes |
|--------|------|-------------|
| **Modify** | `context/TodoContext.js` | Add `clearCompleted` action. |
| **Modify** | `app/index.jsx` | Add `filter` state, filter tabs UI, use `filteredData` for list, add "Clear Completed" button. |

---

## Phase 3: Task Search & Statistics

### Goal
Make it easier to find specific tasks in large lists and provide visual feedback on overall progress.

### Features to Add

1. **Task Search:**
   - Add a search input field just above the task list (or filter tabs) that filters tasks by their title text.
2. **Task Statistics (Progress):**
   - Add a simple progress bar and text (e.g., "5 of 10 tasks completed (50%)") at the top of the screen to give users a sense of accomplishment.

### Implementation Steps

**Step 1 — Update `index.jsx` State**
- Add `const [searchQuery, setSearchQuery] = useState('');`
- Update the `filteredData` `useMemo` to *also* filter by the `searchQuery` (case-insensitive).

**Step 2 — Add Progress UI in `index.jsx`**
- Calculate `totalTasks` and `completedTasks` from `data`.
- Calculate `progressPercentage = (completedTasks / totalTasks) * 100` (handle divide by zero).
- Add a visual progress bar component below the header.

**Step 3 — Add Search UI in `index.jsx`**
- Add a new `<TextInput>` for searching tasks, visually distinct from the "Add Task" input.

### File Changes Summary

| Action | File | What Changes |
|--------|------|-------------|
| **Modify** | `app/index.jsx` | Add `searchQuery` state, progress bar UI, search input UI, and update `filteredData` logic. |
