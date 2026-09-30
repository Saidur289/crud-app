import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { data as initialData } from '../data/todos';

const TodoContext = createContext();

export const TodoProvider = ({ children }) => {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [lastDeletedTodo, setLastDeletedTodo] = useState(null);

  // Load todos from AsyncStorage on mount
  useEffect(() => {
    const loadTodos = async () => {
      try {
        const storedValue = await AsyncStorage.getItem('@todos');
        if (storedValue !== null) {
          const parsedData = JSON.parse(storedValue);
          if (Array.isArray(parsedData)) {
            setData(parsedData);
          } else {
            setData(initialData);
          }
        } else {
          setData(initialData);
          await AsyncStorage.setItem('@todos', JSON.stringify(initialData));
        }
      } catch (error) {
        console.error("Failed to load todos from AsyncStorage:", error);
        setData(initialData);
      } finally {
        setIsLoaded(true);
      }
    };
    loadTodos();
  }, []);

  // Persist todos to AsyncStorage whenever data changes (after initial load)
  useEffect(() => {
    if (!isLoaded) return;
    const saveTodos = async () => {
      try {
        await AsyncStorage.setItem('@todos', JSON.stringify(data));
      } catch (error) {
        console.error("Failed to save todos to AsyncStorage:", error);
      }
    };
    saveTodos();
  }, [data, isLoaded]);

  const addTodo = (title) => {
    if (!title || title.trim() === '') return null;
    const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    const newTodo = { id: newId, title: title.trim(), completed: false };
    setData([newTodo, ...data]);
    return newTodo;
  };

  const toggleTodo = (id) => {
    setData(data.map(todo => (todo.id === Number(id) ? { ...todo, completed: !todo.completed } : todo)));
  };

  const deleteTodo = (id) => {
    const target = data.find(t => t.id === Number(id));
    if (target) {
      setLastDeletedTodo(target);
    }
    setData(data.filter(todo => todo.id !== Number(id)));
    return target;
  };

  const undoDelete = () => {
    if (lastDeletedTodo) {
      const restored = lastDeletedTodo;
      setData(prev => {
        if (prev.some(t => t.id === restored.id)) return prev;
        return [restored, ...prev];
      });
      setLastDeletedTodo(null);
      return restored;
    }
    return null;
  };

  const updateTodo = (id, newTitle, completed = null) => {
    setData(data.map(todo => {
      if (todo.id === Number(id)) {
        return {
          ...todo,
          title: newTitle !== undefined && newTitle !== null ? newTitle.trim() : todo.title,
          completed: completed !== null && completed !== undefined ? completed : todo.completed,
        };
      }
      return todo;
    }));
  };

  const getTodoById = (id) => {
    return data.find(todo => todo.id === Number(id));
  };

  const clearCompleted = () => {
    const completedItems = data.filter(t => t.completed);
    setData(data.filter(todo => !todo.completed));
    return completedItems.length;
  };

  return (
    <TodoContext.Provider value={{
      data,
      isLoaded,
      lastDeletedTodo,
      addTodo,
      toggleTodo,
      deleteTodo,
      undoDelete,
      updateTodo,
      getTodoById,
      clearCompleted,
    }}>
      {children}
    </TodoContext.Provider>
  );
};

export const useTodos = () => useContext(TodoContext);
