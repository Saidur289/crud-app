import React, { useState, useMemo, useRef, useEffect, useCallback } from "react";
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
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  Easing,
  interpolate,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, Link } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useTodos } from "../context/TodoContext";
import { triggerHaptic } from "../utils/haptics";
import { SHADOWS } from "../constants/theme";
import EditTaskPane from "../components/EditTaskPane";

const webPointer = Platform.select({ web: { cursor: "pointer" }, default: {} });

// ─── Animated Progress Bar ───────────────────────────────────────────────────
function AnimatedProgressBar({ percentage, colors }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(percentage / 100, {
      duration: 700,
      easing: Easing.out(Easing.cubic),
    });
  }, [percentage]);

  const barStyle = useAnimatedStyle(() => ({
    width: `${progress.value * 100}%`,
    backgroundColor:
      progress.value === 1 ? colors.success : colors.primary,
  }));

  return (
    <View style={[progressStyles.track, { backgroundColor: colors.borderColor }]}>
      <Animated.View style={[progressStyles.fill, barStyle]} />
    </View>
  );
}
const progressStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 99, overflow: "hidden" },
  fill: { height: "100%", borderRadius: 99 },
});

// ─── FAB ─────────────────────────────────────────────────────────────────────
function FAB({ onPress, colors }) {
  const scale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={[fabStyle, fabStyles.wrapper]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Add new task"
        onPressIn={() => { scale.value = withSpring(0.92); }}
        onPressOut={() => { scale.value = withSpring(1); }}
        onPress={onPress}
        style={[
          fabStyles.btn,
          { backgroundColor: colors.primary },
          Platform.select({
            web: { boxShadow: `0 8px 24px ${colors.primary}55` },
            default: {
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 12,
            },
          }),
        ]}
      >
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </Animated.View>
  );
}
const fabStyles = StyleSheet.create({
  wrapper: { position: "absolute", bottom: 28, right: 20, zIndex: 50 },
  btn: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
  },
});

// ─── Task Item ────────────────────────────────────────────────────────────────
const TaskItem = React.memo(function TaskItem({
  item,
  colors,
  isCompact,
  isWide,
  isSelected,
  onToggle,
  onEdit,
  onDelete,
}) {
  const checkScale = useSharedValue(1);

  const handleToggle = () => {
    checkScale.value = withSpring(0.85, {}, () => {
      checkScale.value = withSpring(1);
    });
    onToggle(item.id);
  };

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const formattedDate = useMemo(() => {
    if (!item.createdAt) return null;
    const d = new Date(item.createdAt);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const isToday = d.toDateString() === today.toDateString();
    const isTomorrow = d.toDateString() === tomorrow.toDateString();
    if (isToday) return `Today, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    if (isTomorrow) return `Tomorrow, ${d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }, [item.createdAt]);

  return (
    <Animated.View
      entering={FadeInUp.duration(260).springify()}
      exiting={FadeOutDown.duration(200)}
      layout={LinearTransition.duration(240)}
      style={[
        {
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          paddingVertical: isCompact ? 12 : 14,
          paddingHorizontal: isCompact ? 12 : 16,
          borderRadius: 14,
          marginBottom: 8,
          borderWidth: 1,
          borderColor: isSelected ? colors.primary : colors.borderColor,
          ...(isSelected ? { backgroundColor: colors.primarySurface } : {}),
          ...SHADOWS.card,
        },
      ]}
    >
      {/* Checkbox */}
      <Animated.View style={checkStyle}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: item.completed }}
          accessibilityLabel={`Mark "${item.title}" as ${item.completed ? "pending" : "completed"}`}
          style={[
            {
              width: 26,
              height: 26,
              borderRadius: 13,
              borderWidth: 2,
              borderColor: item.completed ? colors.success : colors.borderColor,
              backgroundColor: item.completed ? colors.success : "transparent",
              alignItems: "center",
              justifyContent: "center",
              marginRight: isCompact ? 10 : 12,
            },
            webPointer,
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={handleToggle}
        >
          {item.completed && (
            <Ionicons name="checkmark" size={15} color="#FFFFFF" />
          )}
        </Pressable>
      </Animated.View>

      {/* Task Content */}
      <Pressable
        style={{ flex: 1, paddingRight: 8 }}
        onPress={() => onToggle(item.id)}
      >
        <Text
          numberOfLines={2}
          style={{
            fontSize: isCompact ? 14 : 15,
            fontWeight: "500",
            lineHeight: isCompact ? 20 : 22,
            color: item.completed ? colors.textMuted : colors.text,
            textDecorationLine: item.completed ? "line-through" : "none",
          }}
        >
          {item.title}
        </Text>
        {formattedDate && (
          <Text
            style={{
              fontSize: 12,
              color: colors.textMuted,
              marginTop: 2,
            }}
          >
            {formattedDate}
          </Text>
        )}
      </Pressable>

      {/* Actions */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Edit task"
          style={({ pressed, hovered }) => [
            {
              width: isCompact ? 32 : 36,
              height: isCompact ? 32 : 36,
              borderRadius: 10,
              backgroundColor: colors.primarySurface,
              alignItems: "center",
              justifyContent: "center",
            },
            webPointer,
            hovered && { opacity: 0.8 },
            pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => onEdit(item.id)}
        >
          <Ionicons name="pencil-outline" size={isCompact ? 14 : 16} color={colors.primary} />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Delete task"
          style={({ pressed, hovered }) => [
            {
              width: isCompact ? 32 : 36,
              height: isCompact ? 32 : 36,
              borderRadius: 10,
              backgroundColor: colors.dangerSurface,
              alignItems: "center",
              justifyContent: "center",
            },
            webPointer,
            hovered && { opacity: 0.8 },
            pressed && { opacity: 0.6, transform: [{ scale: 0.92 }] },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => onDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={isCompact ? 14 : 16} color={colors.danger} />
        </Pressable>
      </View>
    </Animated.View>
  );
});

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ searchQuery, filter, colors, isCompact, onClearSearch }) {
  const icon = searchQuery.trim()
    ? "search-outline"
    : filter === "Completed"
    ? "ribbon-outline"
    : filter === "Pending"
    ? "checkmark-done-circle-outline"
    : "add-circle-outline";

  const title = searchQuery.trim()
    ? "No tasks match your search"
    : filter === "Completed"
    ? "No completed tasks yet"
    : filter === "Pending"
    ? "All caught up! 🎉"
    : "No tasks yet";

  const subtitle = searchQuery.trim()
    ? "Try a different keyword or clear the search."
    : filter === "Completed"
    ? "Complete a task to see it here."
    : filter === "Pending"
    ? "Every task on your list is done. Great work!"
    : "Add your first task above to get started.";

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 32,
        paddingBottom: 80,
        minHeight: 260,
      }}
    >
      <View
        style={{
          width: 72,
          height: 72,
          borderRadius: 36,
          backgroundColor: colors.primarySurface,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 16,
        }}
      >
        <Ionicons name={icon} size={34} color={colors.primary} />
      </View>
      <Text
        style={{
          fontSize: isCompact ? 17 : 18,
          fontWeight: "700",
          color: colors.text,
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: isCompact ? 13 : 14,
          color: colors.textMuted,
          textAlign: "center",
          lineHeight: 21,
          maxWidth: 300,
          marginBottom: 20,
        }}
      >
        {subtitle}
      </Text>
      {searchQuery.trim().length > 0 && (
        <Pressable
          style={({ pressed }) => [
            {
              paddingVertical: 9,
              paddingHorizontal: 20,
              borderRadius: 10,
              backgroundColor: colors.primarySurface,
              borderWidth: 1,
              borderColor: colors.primary + "40",
            },
            webPointer,
            pressed && { opacity: 0.7 },
          ]}
          onPress={onClearSearch}
        >
          <Text style={{ fontSize: 14, fontWeight: "600", color: colors.primary }}>
            Clear Search
          </Text>
        </Pressable>
      )}
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function Index() {
  const [text, setText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);
  const [filter, setFilter] = useState("All");
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [addInputVisible, setAddInputVisible] = useState(false);

  const searchInputRef = useRef(null);
  const addInputRef = useRef(null);

  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const isWide = width >= 768;

  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const { data, isLoaded, addTodo, toggleTodo, deleteTodo, undoDelete, clearCompleted } = useTodos();

  const totalTasks = data.length;
  const completedTasks = useMemo(() => data.filter((t) => t.completed).length, [data]);
  const pendingTasks = totalTasks - completedTasks;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  const filteredData = useMemo(() => {
    let result = data;
    if (filter === "Pending") result = result.filter((t) => !t.completed);
    if (filter === "Completed") result = result.filter((t) => t.completed);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [data, filter, searchQuery]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const formattedDate = useMemo(() => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  }, []);

  // Web keyboard shortcuts
  useEffect(() => {
    if (Platform.OS !== "web") return;
    const handleKeyDown = (e) => {
      if (
        (e.key === "/" && document.activeElement?.tagName !== "INPUT") ||
        ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === "Escape") {
        if (searchQuery) setSearchQuery("");
        else {
          searchInputRef.current?.blur();
          addInputRef.current?.blur();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchQuery]);

  const showToast = useCallback((message, canUndo = false) => {
    setToast({ message, canUndo });
    setTimeout(() => {
      setToast((cur) => (cur?.message === message ? null : cur));
    }, 3500);
  }, []);

  const handleAddTodo = useCallback(() => {
    if (!text.trim()) return;
    addTodo(text.trim());
    setText("");
    Keyboard.dismiss();
    triggerHaptic("medium");
    showToast("Task added ✓");
  }, [text, addTodo, showToast]);

  const handleToggle = useCallback((id) => {
    triggerHaptic("light");
    toggleTodo(id);
  }, [toggleTodo]);

  const handleEdit = useCallback((id) => {
    triggerHaptic("light");
    if (isWide) setSelectedTodoId(id);
    else router.push(`/edit/${id}`);
  }, [isWide, router]);

  const handleDelete = useCallback((id) => {
    triggerHaptic("warning");
    deleteTodo(id);
    if (selectedTodoId === id) setSelectedTodoId(null);
    showToast("Task deleted", true);
  }, [deleteTodo, selectedTodoId, showToast]);

  const handleUndo = useCallback(() => {
    const restored = undoDelete();
    if (restored) {
      triggerHaptic("success");
      setToast(null);
    }
  }, [undoDelete]);

  const handleClearCompleted = useCallback(() => {
    const doClear = () => {
      const count = clearCompleted();
      triggerHaptic("medium");
      showToast(`Cleared ${count} completed ${count === 1 ? "task" : "tasks"}`);
    };
    if (Platform.OS === "web") {
      if (window.confirm("Clear all completed tasks?")) doClear();
    } else {
      Alert.alert("Clear Completed", "Remove all completed tasks?", [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: doClear },
      ]);
    }
  }, [clearCompleted, showToast]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.background, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  const renderItem = ({ item }) => (
    <TaskItem
      item={item}
      colors={colors}
      isCompact={isCompact}
      isWide={isWide}
      isSelected={isWide && selectedTodoId === item.id}
      onToggle={handleToggle}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );

  // Everything above the task list is rendered as a header inside the FlatList
  // so we get a SINGLE scroller with full virtualization — no nested ScrollView.
  const ListHeader = (
    <View>
      {/* ── Header ── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingTop: isCompact ? 10 : 16,
          paddingBottom: isCompact ? 14 : 20,
        }}
      >
        <View>
          <Text
            style={{
              fontSize: isCompact ? 11 : 12,
              fontWeight: "600",
              color: colors.textMuted,
              textTransform: "uppercase",
              letterSpacing: 1,
              marginBottom: 2,
            }}
          >
            {greeting} · {formattedDate}
          </Text>
          <Text
            style={{
              fontSize: isCompact ? 26 : isWide ? 28 : 30,
              fontWeight: "800",
              letterSpacing: -0.8,
              color: colors.text,
            }}
          >
            Flow Tasks
          </Text>
          <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
            <Link href="/about" style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>About</Link>
            <Link href="/contact" style={{ fontSize: 13, color: colors.primary, fontWeight: "600" }}>Contact</Link>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Toggle theme"
          style={({ pressed, hovered }) => [
            {
              width: isCompact ? 40 : 44,
              height: isCompact ? 40 : 44,
              borderRadius: isCompact ? 20 : 22,
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.borderColor,
              alignItems: "center",
              justifyContent: "center",
              ...SHADOWS.card,
            },
            webPointer,
            hovered && { borderColor: colors.primary },
            pressed && { opacity: 0.7, transform: [{ scale: 0.94 }] },
          ]}
          onPress={() => { triggerHaptic("light"); toggleTheme(); }}
        >
          <Ionicons
            name={isDarkMode ? "sunny-outline" : "moon-outline"}
            size={20}
            color={isDarkMode ? "#FBBF24" : colors.primary}
          />
        </Pressable>
      </View>

      {/* ── Progress Card ── */}
      {totalTasks > 0 && (
        <Animated.View
          entering={FadeInDown.duration(350).springify()}
          style={{
            backgroundColor: colors.surface,
            borderRadius: 16,
            padding: isCompact ? 14 : 18,
            marginBottom: 14,
            borderWidth: 1,
            borderColor: colors.borderColor,
            ...SHADOWS.card,
          }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
              <Ionicons name="checkmark-done-circle-outline" size={18} color={colors.primary} />
              <Text style={{ fontSize: 14, fontWeight: "600", color: colors.text }}>
                Today's Progress
              </Text>
            </View>
            <View
              style={{
                backgroundColor: colors.primarySurface,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 99,
                borderWidth: 1,
                borderColor: colors.primary + "30",
              }}
            >
              <Text style={{ fontSize: 12, fontWeight: "700", color: colors.primary }}>
                {progressPercentage}%
              </Text>
            </View>
          </View>

          <AnimatedProgressBar percentage={progressPercentage} colors={colors} />

          <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 8 }}>
            {completedTasks} of {totalTasks} tasks completed
            {progressPercentage === 100 ? " — Outstanding! 🎉" : ""}
          </Text>
        </Animated.View>
      )}

      {/* ── Add Task Input ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          marginBottom: 10,
        }}
      >
        <View
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 13,
            paddingHorizontal: 14,
            ...SHADOWS.card,
          }}
        >
          <Ionicons name="add-circle-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
          <TextInput
            ref={addInputRef}
            style={{
              flex: 1,
              paddingVertical: isCompact ? 11 : 13,
              fontSize: isCompact ? 14 : 15,
              color: colors.text,
            }}
            value={text}
            onChangeText={setText}
            placeholder="Add a new task..."
            placeholderTextColor={colors.textMuted}
            returnKeyType="done"
            onSubmitEditing={handleAddTodo}
          />
          {text.length > 0 && (
            <Pressable
              hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              onPress={() => setText("")}
              style={webPointer}
            >
              <Ionicons name="close-circle" size={18} color={colors.textMuted} />
            </Pressable>
          )}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Add task"
          disabled={text.trim() === ""}
          style={({ pressed, hovered }) => [
            {
              width: isCompact ? 44 : 48,
              height: isCompact ? 44 : 48,
              backgroundColor: colors.primary,
              borderRadius: 13,
              alignItems: "center",
              justifyContent: "center",
              opacity: text.trim() === "" ? 0.4 : 1,
              ...SHADOWS.card,
            },
            webPointer,
            hovered && text.trim() !== "" && { backgroundColor: colors.primaryDark },
            pressed && { transform: [{ scale: 0.93 }] },
          ]}
          onPress={handleAddTodo}
        >
          <Ionicons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* ── Search Bar ── */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: colors.surface,
          borderRadius: 13,
          borderWidth: 1,
          borderColor: colors.borderColor,
          paddingHorizontal: 13,
          marginBottom: 14,
          ...SHADOWS.card,
        }}
      >
        <Ionicons name="search-outline" size={17} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          ref={searchInputRef}
          style={{
            flex: 1,
            paddingVertical: isCompact ? 9 : 11,
            fontSize: isCompact ? 13 : 14,
            color: colors.text,
          }}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search tasks..."
          placeholderTextColor={colors.textMuted}
        />
        {isWide && !searchQuery && (
          <View
            style={{
              backgroundColor: colors.borderColor,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 5,
              borderWidth: 1,
              borderColor: colors.borderColor,
            }}
          >
            <Text style={{ fontSize: 11, fontWeight: "700", color: colors.textMuted }}>/</Text>
          </View>
        )}
        {searchQuery.length > 0 && (
          <Pressable
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
            onPress={() => setSearchQuery("")}
            style={webPointer}
          >
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </Pressable>
        )}
      </View>

      {/* ── Filter Pills ── */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: colors.surface,
          borderRadius: 13,
          padding: 4,
          borderWidth: 1,
          borderColor: colors.borderColor,
          gap: 4,
          marginBottom: 12,
          ...SHADOWS.card,
        }}
      >
        {[
          { key: "All", count: totalTasks },
          { key: "Pending", count: pendingTasks },
          { key: "Completed", count: completedTasks },
        ].map(({ key, count }) => {
          const active = filter === key;
          return (
            <Pressable
              key={key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              style={({ pressed, hovered }) => [
                {
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: isCompact ? 4 : 6,
                  paddingVertical: isCompact ? 7 : 9,
                  paddingHorizontal: isCompact ? 4 : 8,
                  borderRadius: 10,
                  backgroundColor: active ? colors.primary : "transparent",
                },
                webPointer,
                !active && hovered && { backgroundColor: colors.borderColor },
                pressed && { transform: [{ scale: 0.97 }] },
              ]}
              onPress={() => { triggerHaptic("light"); setFilter(key); }}
            >
              <Text
                style={{
                  fontSize: isCompact ? 12 : 13,
                  fontWeight: "600",
                  color: active ? "#FFFFFF" : colors.textMuted,
                }}
              >
                {key}
              </Text>
              <View
                style={{
                  backgroundColor: active ? "rgba(255,255,255,0.25)" : colors.borderColor,
                  paddingHorizontal: 6,
                  paddingVertical: 1,
                  borderRadius: 99,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "700",
                    color: active ? "#FFFFFF" : colors.textMuted,
                  }}
                >
                  {count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* ── Clear Completed ── */}
      {completedTasks > 0 && filter !== "Pending" && (
        <View style={{ flexDirection: "row", justifyContent: "flex-end", marginBottom: 8 }}>
          <Pressable
            style={({ pressed, hovered }) => [
              {
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: 8,
              },
              webPointer,
              hovered && { backgroundColor: colors.dangerSurface },
              pressed && { opacity: 0.6 },
            ]}
            onPress={handleClearCompleted}
          >
            <Ionicons name="trash-bin-outline" size={13} color={colors.danger} />
            <Text style={{ color: colors.danger, fontSize: 12, fontWeight: "600" }}>
              Clear completed
            </Text>
          </Pressable>
        </View>
      )}

    </View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <View
        style={{
          flex: 1,
          flexDirection: isWide ? "row" : "column",
          ...(isWide
            ? {
                maxWidth: 1200,
                alignSelf: "center",
                width: "100%",
                gap: 24,
                paddingHorizontal: 24,
                paddingTop: 12,
              }
            : {}),
        }}
      >
        {/* List Pane — single Animated.FlatList with ListHeaderComponent */}
        <View
          style={{
            flex: 1,
            maxWidth: isWide ? 480 : undefined,
          }}
        >
          {filteredData.length === 0 ? (
            <Animated.FlatList
              data={[]}
              keyExtractor={(item) => item.id.toString()}
              renderItem={null}
              ListHeaderComponent={ListHeader}
              ListFooterComponent={
                <EmptyState
                  searchQuery={searchQuery}
                  filter={filter}
                  colors={colors}
                  isCompact={isCompact}
                  onClearSearch={() => setSearchQuery("")}
                />
              }
              contentContainerStyle={{
                paddingHorizontal: isCompact ? 12 : isWide ? 0 : 20,
                paddingBottom: 120,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Animated.FlatList
              data={filteredData}
              keyExtractor={(item) => item.id.toString()}
              renderItem={renderItem}
              ListHeaderComponent={ListHeader}
              itemLayoutAnimation={LinearTransition.duration(240)}
              contentContainerStyle={{
                paddingHorizontal: isCompact ? 12 : isWide ? 0 : 20,
                paddingBottom: 120,
              }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Detail Pane (wide only) */}
        {isWide && (
          <View
            style={{
              flex: 1.3,
              backgroundColor: colors.surface,
              borderRadius: 20,
              borderWidth: 1,
              borderColor: colors.borderColor,
              marginTop: 12,
              marginBottom: 12,
              paddingHorizontal: 16,
              ...SHADOWS.elevated,
            }}
          >
            {selectedTodoId ? (
              <EditTaskPane id={selectedTodoId} onClose={() => setSelectedTodoId(null)} />
            ) : (
              <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 32 }}>
                <View
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: 36,
                    backgroundColor: colors.primarySurface,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <Ionicons name="document-text-outline" size={32} color={colors.primary} />
                </View>
                <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text, marginBottom: 8 }}>
                  No Task Selected
                </Text>
                <Text style={{ fontSize: 14, color: colors.textMuted, textAlign: "center" }}>
                  Select a task from the list to view and edit its details.
                </Text>
              </View>
            )}
          </View>
        )}
      </View>

      {/* FAB (mobile only) */}
      {!isWide && (
        <FAB
          colors={colors}
          onPress={() => {
            triggerHaptic("light");
            addInputRef.current?.focus();
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <Animated.View
          entering={FadeInDown.duration(240)}
          exiting={FadeOutDown.duration(200)}
          style={[
            {
              position: "absolute",
              bottom: 24,
              left: 20,
              right: 20,
              backgroundColor: colors.text,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 13,
              paddingHorizontal: 18,
              borderRadius: 14,
              ...SHADOWS.floating,
            },
            isWide && {
              maxWidth: 480,
              alignSelf: "center",
              left: "auto",
              right: "auto",
              width: "100%",
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="checkmark-circle" size={18} color={colors.success} />
            <Text style={{ color: colors.background, fontSize: 14, fontWeight: "500" }}>
              {toast.message}
            </Text>
          </View>
          {toast.canUndo && (
            <Pressable
              style={({ pressed }) => [
                {
                  paddingVertical: 5,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  backgroundColor: "rgba(255,255,255,0.18)",
                },
                webPointer,
                pressed && { opacity: 0.7 },
              ]}
              onPress={handleUndo}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 13, fontWeight: "700" }}>Undo</Text>
            </Pressable>
          )}
        </Animated.View>
      )}
    </SafeAreaView>
  );
}
