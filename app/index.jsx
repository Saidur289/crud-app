import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import Animated, {
  LinearTransition,
  FadeInUp,
  FadeOutDown,
  FadeInDown,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useTodos } from "../context/TodoContext";
import { triggerHaptic } from "../utils/haptics";
import { SHADOWS } from "../constants/theme";

const webPointer = Platform.select({
  web: { cursor: "pointer" },
  default: {},
});

export default function Index() {
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("All");

  const searchInputRef = useRef(null);
  const addInputRef = useRef(null);

  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const isTablet = width >= 768 && width < 1024;
  const isDesktop = width >= 1024;
  const isWide = width >= 768;

  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const {
    data,
    isLoaded,
    addTodo,
    toggleTodo,
    deleteTodo,
    undoDelete,
    clearCompleted,
  } = useTodos();

  const totalTasks = data.length;
  const completedTasks = useMemo(() => data.filter((t) => t.completed).length, [data]);
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredData = useMemo(() => {
    let result = data;
    if (filter === "Pending") result = result.filter((t) => !t.completed);
    if (filter === "Completed") result = result.filter((t) => t.completed);
    if (searchQuery.trim()) {
      const lowerQuery = searchQuery.toLowerCase().trim();
      result = result.filter((t) => t.title.toLowerCase().includes(lowerQuery));
    }
    return result;
  }, [data, filter, searchQuery]);

  const hasCompletedTasks = completedTasks > 0;

  // Keyboard shortcut listener on Web
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e) => {
      // '/' or 'Ctrl+K' focuses search
      if (
        (e.key === "/" && document.activeElement?.tagName !== "INPUT") ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape blurs or clears search
      if (e.key === "Escape") {
        if (searchQuery) {
          setSearchQuery("");
        } else {
          searchInputRef.current?.blur();
          addInputRef.current?.blur();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const showToast = (message, canUndo = false) => {
    setToast({ message, canUndo });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3500);
  };

  const handleAddTodo = () => {
    if (text.trim() === "") return;
    addTodo(text.trim());
    setText("");
    Keyboard.dismiss();
    triggerHaptic("medium");
    showToast("Task added");
  };

  const handleToggleTodo = (id) => {
    triggerHaptic("light");
    toggleTodo(id);
  };

  const handleDeleteTodo = (id) => {
    triggerHaptic("warning");
    deleteTodo(id);
    showToast("Task deleted", true);
  };

  const handleUndo = () => {
    const restored = undoDelete();
    if (restored) {
      triggerHaptic("success");
      setToast(null);
    }
  };

  const handleClearCompleted = () => {
    const confirmClear = () => {
      const count = clearCompleted();
      triggerHaptic("medium");
      showToast(`Cleared ${count} completed ${count === 1 ? "task" : "tasks"}`);
    };

    if (Platform.OS === "web") {
      if (window.confirm("Are you sure you want to clear all completed tasks?")) {
        confirmClear();
      }
    } else {
      Alert.alert(
        "Clear Completed Tasks",
        "Are you sure you want to remove all completed tasks?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Clear", style: "destructive", onPress: confirmClear },
        ]
      );
    }
  };

  const styles = useMemo(
    () => getStyles(colors, { isCompact, isTablet, isDesktop, isWide }),
    [colors, isCompact, isTablet, isDesktop, isWide]
  );

  const formattedDate = useMemo(() => {
    const options = { weekday: "short", month: "short", day: "numeric" };
    return new Date().toLocaleDateString("en-US", options);
  }, []);

  const renderItem = ({ item }) => (
    <Animated.View
      entering={FadeInUp.duration(260)}
      exiting={FadeOutDown.duration(200)}
      layout={LinearTransition.duration(240)}
      style={styles.todoItem}
    >
      {/* Checkbox */}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: item.completed }}
        accessibilityLabel={`Mark "${item.title}" as ${item.completed ? "pending" : "completed"}`}
        style={({ pressed, hovered }) => [
          styles.checkboxContainer,
          webPointer,
          hovered && styles.checkboxHovered,
          pressed && styles.checkboxPressed,
        ]}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        onPress={() => handleToggleTodo(item.id)}
      >
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={isCompact ? 22 : 24}
          color={item.completed ? colors.success : colors.textMuted}
        />
      </Pressable>

      {/* Task Title */}
      <Pressable
        style={[styles.todoContent, webPointer]}
        onPress={() => handleToggleTodo(item.id)}
      >
        <Text
          numberOfLines={3}
          style={[styles.todoText, item.completed && styles.completedText]}
        >
          {item.title}
        </Text>
      </Pressable>

      {/* Actions */}
      <View style={styles.actionButtons}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit task"
          style={({ pressed, hovered }) => [
            styles.iconButton,
            webPointer,
            hovered && styles.iconButtonHovered,
            pressed && styles.iconButtonPressed,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => {
            triggerHaptic("light");
            router.push(`/edit/${item.id}`);
          }}
        >
          <Ionicons name="pencil-outline" size={isCompact ? 15 : 17} color={colors.primary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete task"
          style={({ pressed, hovered }) => [
            styles.iconButton,
            styles.deleteIconButton,
            webPointer,
            hovered && styles.deleteIconButtonHovered,
            pressed && styles.iconButtonPressed,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => handleDeleteTodo(item.id)}
        >
          <Ionicons name="trash-outline" size={isCompact ? 15 : 17} color={colors.danger} />
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
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <View style={styles.responsiveShell}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>{formattedDate}</Text>
            <Text style={styles.headerTitle}>Tasks</Text>
          </View>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Toggle dark/light theme"
            style={({ pressed, hovered }) => [
              styles.themeToggleBtn,
              webPointer,
              hovered && styles.themeToggleHovered,
              pressed && styles.themeTogglePressed,
            ]}
            onPress={() => {
              triggerHaptic("light");
              toggleTheme();
            }}
          >
            <Ionicons
              name={isDarkMode ? "sunny-outline" : "moon-outline"}
              size={20}
              color={isDarkMode ? "#FBBF24" : colors.primary}
            />
          </Pressable>
        </View>

        {/* Progress Card */}
        {totalTasks > 0 && (
          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <View style={styles.progressLabelGroup}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={18}
                  color={colors.primary}
                />
                <Text style={styles.progressTitle}>Progress</Text>
              </View>
              <View style={styles.progressBadge}>
                <Text style={styles.progressBadgeText}>
                  {completedTasks}/{totalTasks} ({progressPercentage}%)
                </Text>
              </View>
            </View>

            <View style={styles.progressBarTrack}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progressPercentage}%` },
                  progressPercentage === 100 && styles.progressBarComplete,
                ]}
              />
            </View>
          </View>
        )}

        {/* Adaptive Controls: Quick Add & Search */}
        <View style={[styles.controlsGroup, isWide && styles.controlsGroupWide]}>
          {/* Add Input Bar */}
          <View style={[styles.inputContainer, isWide && styles.controlItemWide]}>
            <TextInput
              ref={addInputRef}
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="What needs to be done?"
              placeholderTextColor={colors.textMuted}
              returnKeyType="done"
              onSubmitEditing={handleAddTodo}
            />
            {text.length > 0 && (
              <Pressable
                style={[styles.inputClearBtn, webPointer]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                onPress={() => setText("")}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Add task"
              disabled={text.trim() === ""}
              style={({ pressed, hovered }) => [
                styles.addButton,
                text.trim() === "" && styles.addButtonDisabled,
                webPointer,
                hovered && text.trim() !== "" && styles.addButtonHovered,
                pressed && styles.addButtonPressed,
              ]}
              onPress={handleAddTodo}
            >
              <Ionicons name="add" size={22} color="#FFFFFF" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={[styles.searchContainer, isWide && styles.controlItemWide]}>
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.textMuted}
              style={styles.searchIcon}
            />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={isWide ? "Search tasks... (Press / to focus)" : "Search tasks..."}
              placeholderTextColor={colors.textMuted}
            />
            {isWide && !searchQuery && (
              <View style={styles.keyboardHintBadge}>
                <Text style={styles.keyboardHintText}>/</Text>
              </View>
            )}
            {searchQuery.length > 0 && (
              <Pressable
                style={[styles.searchClearBtn, webPointer]}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                onPress={() => setSearchQuery("")}
              >
                <Ionicons name="close-circle" size={18} color={colors.textMuted} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Segmented Filter Pills */}
        <View style={styles.filterContainer}>
          {[
            { key: "All", count: totalTasks },
            { key: "Pending", count: pendingTasks },
            { key: "Completed", count: completedTasks },
          ].map((item) => {
            const isActive = filter === item.key;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isActive }}
                style={({ pressed, hovered }) => [
                  styles.filterTab,
                  webPointer,
                  isActive && styles.filterTabActive,
                  !isActive && hovered && styles.filterTabHovered,
                  pressed && styles.filterTabPressed,
                ]}
                onPress={() => {
                  triggerHaptic("light");
                  setFilter(item.key);
                }}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    isActive && styles.filterTabTextActive,
                  ]}
                >
                  {item.key}
                </Text>
                <View
                  style={[
                    styles.filterCountBadge,
                    isActive && styles.filterCountBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      isActive && styles.filterCountTextActive,
                    ]}
                  >
                    {item.count}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>

        {/* Clear Completed Action */}
        {hasCompletedTasks && filter !== "Pending" && (
          <View style={styles.clearContainer}>
            <Pressable
              style={({ pressed, hovered }) => [
                styles.clearButton,
                webPointer,
                hovered && styles.clearButtonHovered,
                pressed && styles.clearButtonPressed,
              ]}
              onPress={handleClearCompleted}
            >
              <Ionicons name="trash-bin-outline" size={14} color={colors.danger} />
              <Text style={styles.clearButtonText}>Clear completed</Text>
            </Pressable>
          </View>
        )}

        {/* Task List / Empty States */}
        {filteredData.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <Ionicons
              name={
                searchQuery.trim()
                  ? "search-outline"
                  : filter === "Completed"
                  ? "ribbon-outline"
                  : "checkbox-outline"
              }
              size={isCompact ? 40 : 48}
              color={colors.textMuted}
              style={styles.emptyStateIcon}
            />
            <Text style={styles.emptyStateTitle}>
              {searchQuery.trim()
                ? "No tasks match your search"
                : filter === "Completed"
                ? "No completed tasks yet"
                : filter === "Pending"
                ? "All tasks are done!"
                : "No tasks yet"}
            </Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery.trim()
                ? `Try searching for something else or clear the search query.`
                : filter === "Completed"
                ? "Completed tasks will show up here once you check them off."
                : filter === "Pending"
                ? "Great job! You have cleared every task on your list."
                : "Add your first task above to start organizing your day."}
            </Text>
            {searchQuery.trim().length > 0 && (
              <Pressable
                style={({ pressed, hovered }) => [
                  styles.emptyStateActionBtn,
                  webPointer,
                  hovered && styles.emptyStateActionBtnHovered,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => setSearchQuery("")}
              >
                <Text style={styles.emptyStateActionText}>Clear Search</Text>
              </Pressable>
            )}
          </View>
        ) : (
          <Animated.FlatList
            data={filteredData}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderItem}
            itemLayoutAnimation={LinearTransition.duration(240)}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      {/* Floating Toast Notification */}
      {toast && (
        <Animated.View
          entering={FadeInDown.duration(240)}
          exiting={FadeOutDown.duration(200)}
          style={[styles.toastContainer, isWide && styles.toastContainerWide]}
        >
          <Text style={styles.toastText}>{toast.message}</Text>
          {toast.canUndo && (
            <Pressable
              style={({ pressed }) => [
                styles.toastUndoButton,
                webPointer,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleUndo}
            >
              <Text style={styles.toastUndoText}>Undo</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (COLORS, { isCompact, isTablet, isDesktop, isWide }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    loadingContainer: {
      justifyContent: "center",
      alignItems: "center",
    },
    // Responsive Shell
    responsiveShell: {
      flex: 1,
      width: "100%",
      maxWidth: isWide ? 760 : undefined,
      alignSelf: isWide ? "center" : "stretch",
      paddingHorizontal: isCompact ? 12 : 20,
    },
    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: isCompact ? 8 : 14,
      paddingBottom: isCompact ? 12 : 16,
    },
    headerSubtitle: {
      fontSize: isCompact ? 11 : 13,
      fontWeight: "600",
      color: COLORS.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 2,
    },
    headerTitle: {
      fontSize: isCompact ? 24 : isWide ? 32 : 28,
      fontWeight: "700",
      letterSpacing: -0.5,
      color: COLORS.text,
    },
    themeToggleBtn: {
      width: isCompact ? 40 : 44,
      height: isCompact ? 40 : 44,
      borderRadius: isCompact ? 20 : 22,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.card,
    },
    themeToggleHovered: {
      backgroundColor: COLORS.borderSubtle,
    },
    themeTogglePressed: {
      opacity: 0.7,
      transform: [{ scale: 0.95 }],
    },
    // Progress Card
    progressCard: {
      marginBottom: 16,
      backgroundColor: COLORS.surface,
      borderRadius: 14,
      padding: isCompact ? 12 : 16,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      ...SHADOWS.card,
    },
    progressHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    progressLabelGroup: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    progressTitle: {
      fontSize: isCompact ? 13 : 14,
      fontWeight: "600",
      color: COLORS.text,
    },
    progressBadge: {
      backgroundColor: COLORS.primarySurface,
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 10,
    },
    progressBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.primary,
    },
    progressBarTrack: {
      height: 7,
      backgroundColor: COLORS.borderSubtle,
      borderRadius: 4,
      overflow: "hidden",
    },
    progressBarFill: {
      height: "100%",
      backgroundColor: COLORS.primary,
      borderRadius: 4,
    },
    progressBarComplete: {
      backgroundColor: COLORS.success,
    },
    // Responsive Controls Group
    controlsGroup: {
      marginBottom: 12,
      gap: 10,
    },
    controlsGroupWide: {
      flexDirection: "row",
      gap: 12,
    },
    controlItemWide: {
      flex: 1,
      marginBottom: 0,
    },
    // Input Area
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    input: {
      flex: 1,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingVertical: isCompact ? 10 : 12,
      paddingRight: 36,
      fontSize: isCompact ? 14 : 15,
      color: COLORS.text,
      ...SHADOWS.card,
    },
    inputClearBtn: {
      position: "absolute",
      right: isCompact ? 54 : 60,
      padding: 6,
    },
    addButton: {
      width: isCompact ? 42 : 46,
      height: isCompact ? 42 : 46,
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.card,
    },
    addButtonDisabled: {
      opacity: 0.45,
    },
    addButtonHovered: {
      backgroundColor: COLORS.primaryDark,
    },
    addButtonPressed: {
      transform: [{ scale: 0.95 }],
    },
    // Search Area
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      paddingHorizontal: 12,
      ...SHADOWS.card,
    },
    searchIcon: {
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      paddingVertical: isCompact ? 8 : 10,
      fontSize: isCompact ? 13 : 14,
      color: COLORS.text,
    },
    keyboardHintBadge: {
      backgroundColor: COLORS.borderSubtle,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      marginRight: 4,
    },
    keyboardHintText: {
      fontSize: 11,
      fontWeight: "700",
      color: COLORS.textMuted,
    },
    searchClearBtn: {
      padding: 6,
    },
    // Filter Pills
    filterContainer: {
      flexDirection: "row",
      marginBottom: 12,
      backgroundColor: COLORS.surface,
      borderRadius: 12,
      padding: 4,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      gap: 4,
    },
    filterTab: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: isCompact ? 4 : 6,
      paddingVertical: isCompact ? 6 : 8,
      paddingHorizontal: isCompact ? 4 : 8,
      borderRadius: 8,
    },
    filterTabActive: {
      backgroundColor: COLORS.primary,
    },
    filterTabHovered: {
      backgroundColor: COLORS.borderSubtle,
    },
    filterTabPressed: {
      transform: [{ scale: 0.97 }],
    },
    filterTabText: {
      fontSize: isCompact ? 12 : 13,
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    filterTabTextActive: {
      color: "#FFFFFF",
    },
    filterCountBadge: {
      backgroundColor: COLORS.borderSubtle,
      paddingHorizontal: isCompact ? 5 : 6,
      paddingVertical: 1,
      borderRadius: 10,
    },
    filterCountBadgeActive: {
      backgroundColor: "rgba(255, 255, 255, 0.25)",
    },
    filterCountText: {
      fontSize: 11,
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    filterCountTextActive: {
      color: "#FFFFFF",
    },
    // Clear completed
    clearContainer: {
      flexDirection: "row",
      justifyContent: "flex-end",
      marginBottom: 8,
    },
    clearButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: 6,
    },
    clearButtonHovered: {
      backgroundColor: COLORS.dangerSurface,
    },
    clearButtonPressed: {
      opacity: 0.6,
    },
    clearButtonText: {
      color: COLORS.danger,
      fontSize: 12,
      fontWeight: "600",
    },
    // Todo List
    listContainer: {
      paddingBottom: 40,
    },
    todoItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.surface,
      paddingVertical: isCompact ? 11 : 13,
      paddingHorizontal: isCompact ? 12 : 16,
      borderRadius: 12,
      marginBottom: 8,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      ...SHADOWS.card,
    },
    checkboxContainer: {
      marginRight: isCompact ? 10 : 12,
      padding: 2,
    },
    checkboxHovered: {
      opacity: 0.8,
    },
    checkboxPressed: {
      transform: [{ scale: 0.9 }],
    },
    todoContent: {
      flex: 1,
      paddingRight: 8,
    },
    todoText: {
      fontSize: isCompact ? 14 : 15,
      fontWeight: "500",
      lineHeight: isCompact ? 19 : 21,
      color: COLORS.text,
    },
    completedText: {
      textDecorationLine: "line-through",
      color: COLORS.textMuted,
    },
    actionButtons: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    iconButton: {
      width: isCompact ? 32 : 36,
      height: isCompact ? 32 : 36,
      borderRadius: 8,
      backgroundColor: COLORS.primarySurface,
      alignItems: "center",
      justifyContent: "center",
    },
    iconButtonHovered: {
      backgroundColor: COLORS.primaryLight + "30",
    },
    deleteIconButton: {
      backgroundColor: COLORS.dangerSurface,
    },
    deleteIconButtonHovered: {
      backgroundColor: COLORS.danger + "25",
    },
    iconButtonPressed: {
      opacity: 0.6,
      transform: [{ scale: 0.94 }],
    },
    // Empty state
    emptyStateContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 30,
      paddingBottom: 60,
      minHeight: 240,
    },
    emptyStateIcon: {
      marginBottom: 12,
      opacity: 0.7,
    },
    emptyStateTitle: {
      fontSize: isCompact ? 16 : 17,
      fontWeight: "600",
      color: COLORS.text,
      marginBottom: 6,
      textAlign: "center",
    },
    emptyStateSubtext: {
      fontSize: isCompact ? 13 : 14,
      color: COLORS.textMuted,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 16,
      maxWidth: 380,
    },
    emptyStateActionBtn: {
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 8,
      backgroundColor: COLORS.primarySurface,
    },
    emptyStateActionBtnHovered: {
      backgroundColor: COLORS.primaryLight + "30",
    },
    buttonPressed: {
      transform: [{ scale: 0.96 }],
    },
    // Toast
    toastContainer: {
      position: "absolute",
      bottom: 24,
      left: 20,
      right: 20,
      backgroundColor: COLORS.text,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 12,
      ...SHADOWS.floating,
    },
    toastContainerWide: {
      maxWidth: 480,
      alignSelf: "center",
      left: "auto",
      right: "auto",
      width: "100%",
    },
    toastText: {
      color: COLORS.background,
      fontSize: 14,
      fontWeight: "500",
    },
    toastUndoButton: {
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 6,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
    },
    toastUndoText: {
      color: "#FFFFFF",
      fontSize: 13,
      fontWeight: "700",
    },
  });
