import { useState, useMemo, useEffect } from "react";
import { Text, View, TextInput, Pressable, StyleSheet, Modal, ActivityIndicator } from "react-native";
import Animated, { LinearTransition, FadeInUp, FadeOutDown, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { data as initialData } from "../data/todos";
import { useTheme } from "../context/ThemeContext";

const LIGHT_COLORS = {
  primary: '#6200EE',
  secondary: '#03DAC6',
  background: '#F6F6F6',
  surface: '#FFFFFF',
  text: '#121212',
  textLight: '#888888',
  danger: '#B00020',
  borderColor: '#E0E0E0',
};

const DARK_COLORS = {
  primary: '#BB86FC',
  secondary: '#03DAC6',
  background: '#121212',
  surface: '#1E1E1E',
  text: '#FFFFFF',
  textLight: '#AAAAAA',
  danger: '#CF6679',
  borderColor: '#333333',
};

export default function Index() {
  const [data, setData] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [text, setText] = useState('');
  
  // Modal state
  const [editingTodo, setEditingTodo] = useState(null);
  const [editText, setEditText] = useState('');

  // Toast state
  const [toastMessage, setToastMessage] = useState(null);

  const { isDarkMode, toggleTheme } = useTheme();

  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;
  const styles = useMemo(() => getStyles(colors), [colors]);

  // Load todos from AsyncStorage on component mount
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

  // Save todos to AsyncStorage whenever data changes (only after initial load completes)
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

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3000);
  };

  const addTodo = () => {
    if (text.trim() === '') return;
    const newId = data.length > 0 ? Math.max(...data.map(d => d.id)) + 1 : 1;
    setData([{ id: newId, title: text, completed: false }, ...data]);
    setText('');
    showToast("Task added successfully!");
  }

  const toggleTodo = (id) => {
    setData(data.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo));
  }

  const deleteTodo = (id) => {
    setData(data.filter(todo => todo.id !== id));
    showToast("Task deleted successfully!");
  }

  const openEditModal = (todo) => {
    setEditingTodo(todo);
    setEditText(todo.title);
  }

  const handleSaveUpdate = () => {
    if (editText.trim() === '') return;
    setData(data.map(todo => todo.id === editingTodo.id ? { ...todo, title: editText } : todo));
    setEditingTodo(null);
    showToast("Task updated successfully!");
  }

  const renderItem = ({ item }) => (
    <Animated.View 
      entering={FadeInUp.duration(350)}
      exiting={FadeOutDown.duration(300)}
      layout={LinearTransition.duration(300)}
      style={styles.todoItem}
    >
      <Text style={[styles.todoText, item.completed && styles.completedText]}>
        {item.title}
      </Text>
      <View style={styles.actionButtons}>
        <Pressable 
          style={[styles.button, styles.toggleButton, item.completed && styles.completedButton]} 
          onPress={() => toggleTodo(item.id)}
        >
          <Text style={[styles.buttonText, !item.completed && { color: '#000' }]}>
            {item.completed ? 'Undo' : 'Done'}
          </Text>
        </Pressable>
        <Pressable 
          style={[styles.button, styles.updateButton]} 
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.buttonText}>Update</Text>
        </Pressable>
        <Pressable 
          style={[styles.button, styles.deleteButton]} 
          onPress={() => deleteTodo(item.id)}
        >
          <Text style={styles.buttonText}>Delete</Text>
        </Pressable>
      </View>
    </Animated.View>
  );

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Tasks</Text>
        <Pressable style={styles.themeToggleBtn} onPress={toggleTheme}>
          <Text style={styles.themeToggleText}>{isDarkMode ? '☀️' : '🌙'}</Text>
        </Pressable>
      </View>
      <View style={styles.inputContainer}>
        <TextInput 
          style={styles.input} 
          value={text} 
          onChangeText={setText} 
          placeholder="Enter task text..."
          placeholderTextColor={colors.textLight}
        />
        <Pressable style={styles.addButton} onPress={addTodo}>
          <Text style={styles.addButtonText}>Add</Text>
        </Pressable>
      </View>

      <Animated.FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        itemLayoutAnimation={LinearTransition.duration(300)}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />

      {/* Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!editingTodo}
        onRequestClose={() => setEditingTodo(null)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            entering={FadeInUp.duration(250)}
            style={styles.modalContent}
          >
            <Text style={styles.modalTitle}>Update Task</Text>
            <TextInput
              style={styles.modalInput}
              value={editText}
              onChangeText={setEditText}
              placeholder="Update task title..."
              placeholderTextColor={colors.textLight}
              autoFocus
            />
            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditingTodo(null)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveUpdate}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      </Modal>

      {/* Toast Notification */}
      {toastMessage && (
        <Animated.View
          entering={FadeInDown.duration(300)}
          exiting={FadeOutDown.duration(300)}
          style={styles.toastContainer}
        >
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (COLORS) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 15,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  themeToggleBtn: {
    padding: 10,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
  },
  themeToggleText: {
    fontSize: 18,
  },
  inputContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  todoItem: {
    backgroundColor: COLORS.surface,
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 5,
    borderLeftColor: COLORS.secondary,
  },
  todoText: {
    fontSize: 18,
    color: COLORS.text,
    marginBottom: 15,
    fontWeight: '500',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: COLORS.textLight,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6,
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleButton: {
    backgroundColor: COLORS.secondary,
  },
  completedButton: {
    backgroundColor: COLORS.textLight,
  },
  updateButton: {
    backgroundColor: COLORS.primary,
  },
  deleteButton: {
    backgroundColor: COLORS.danger,
    flex: 0.8,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: 15,
  },
  modalInput: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 6,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.borderColor,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontWeight: 'bold',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  // Toast styles
  toastContainer: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
