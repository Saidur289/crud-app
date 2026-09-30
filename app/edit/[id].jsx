import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Text,
  View,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
  useWindowDimensions,
} from "react-native";
import Animated, { FadeInUp, FadeOutDown, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { useTodos } from "../../context/TodoContext";
import { triggerHaptic } from "../../utils/haptics";
import { SHADOWS } from "../../constants/theme";

const webPointer = Platform.select({
  web: { cursor: "pointer" },
  default: {},
});

export default function EditTodo() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTodoById, updateTodo, deleteTodo } = useTodos();
  const { colors } = useTheme();

  const { width } = useWindowDimensions();
  const isCompact = width < 420;
  const isWide = width >= 768;

  const todo = getTodoById(id);
  const [editText, setEditText] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    if (todo) {
      setEditText(todo.title);
      setIsCompleted(Boolean(todo.completed));
    }
  }, [todo]);

  const hasChanges = useMemo(() => {
    if (!todo) return false;
    return editText.trim() !== todo.title || isCompleted !== todo.completed;
  }, [todo, editText, isCompleted]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2000);
  };

  const handleSave = useCallback(() => {
    if (editText.trim() === "") return;
    updateTodo(Number(id), editText.trim(), isCompleted);
    triggerHaptic("success");
    Keyboard.dismiss();
    showToast("Changes saved");
    setTimeout(() => {
      router.back();
    }, 400);
  }, [editText, id, isCompleted, router, updateTodo]);

  // Keyboard shortcut listener on Web (Ctrl+S / Cmd+S to save, Escape to back)
  useEffect(() => {
    if (Platform.OS !== "web") return;

    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        if (editText.trim() !== "" && hasChanges) {
          handleSave();
        }
      }
      if (e.key === "Escape") {
        router.back();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editText, handleSave, hasChanges, router]);

  const handleToggleStatus = () => {
    triggerHaptic("light");
    setIsCompleted((prev) => !prev);
  };

  const handleDelete = () => {
    triggerHaptic("warning");
    deleteTodo(Number(id));
    router.back();
  };

  const styles = useMemo(
    () => getStyles(colors, { isCompact, isWide }),
    [colors, isCompact, isWide]
  );

  if (!todo) {
    return (
      <SafeAreaView style={[styles.container, styles.centeredContainer]}>
        <Animated.View entering={FadeInUp.duration(300)} style={styles.notFoundCard}>
          <View style={styles.notFoundIconContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.textMuted} />
          </View>
          <Text style={styles.notFoundTitle}>Task Not Found</Text>
          <Text style={styles.notFoundSubtext}>
            This task may have been removed or does not exist.
          </Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back to tasks"
            style={({ pressed, hovered }) => [
              styles.backButtonPrimary,
              webPointer,
              hovered && styles.backButtonPrimaryHovered,
              pressed && styles.buttonPressed,
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={18} color="#FFFFFF" />
            <Text style={styles.backButtonPrimaryText}>Back to Tasks</Text>
          </Pressable>
        </Animated.View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.responsiveShell}>
          {/* Header */}
          <View style={styles.header}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed, hovered }) => [
                styles.backButton,
                webPointer,
                hovered && styles.buttonHovered,
                pressed && styles.buttonPressed,
              ]}
              onPress={() => {
                triggerHaptic("light");
                router.back();
              }}
            >
              <Ionicons name="arrow-back" size={20} color={colors.text} />
            </Pressable>

            <Text style={styles.headerTitle}>Edit Task</Text>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Delete task"
              style={({ pressed, hovered }) => [
                styles.deleteTopBtn,
                webPointer,
                hovered && styles.deleteTopBtnHovered,
                pressed && styles.buttonPressed,
              ]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={colors.danger} />
            </Pressable>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Main Edit Card */}
            <Animated.View entering={FadeInUp.duration(320)} style={styles.editCard}>
              {/* Meta Row: ID & Status Pill */}
              <View style={styles.metaRow}>
                <View style={styles.idBadge}>
                  <Text style={styles.idBadgeText}>Task #{todo.id}</Text>
                </View>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Status is ${isCompleted ? "completed" : "pending"}. Tap to toggle`}
                  style={({ pressed, hovered }) => [
                    styles.statusBadge,
                    webPointer,
                    isCompleted ? styles.statusBadgeCompleted : styles.statusBadgePending,
                    hovered && { opacity: 0.85 },
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleToggleStatus}
                >
                  <Ionicons
                    name={isCompleted ? "checkmark-circle" : "time-outline"}
                    size={15}
                    color={isCompleted ? colors.success : colors.primary}
                  />
                  <Text
                    style={[
                      styles.statusBadgeText,
                      isCompleted
                        ? styles.statusBadgeTextCompleted
                        : styles.statusBadgeTextPending,
                    ]}
                  >
                    {isCompleted ? "Completed" : "Pending"}
                  </Text>
                  <Ionicons
                    name="swap-horizontal"
                    size={12}
                    color={isCompleted ? colors.success : colors.primary}
                    style={{ opacity: 0.6 }}
                  />
                </Pressable>
              </View>

              {/* Input Label */}
              <Text style={styles.label}>Task Description</Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  style={styles.editInput}
                  value={editText}
                  onChangeText={setEditText}
                  placeholder="What needs to be done?"
                  placeholderTextColor={colors.textMuted}
                  multiline
                  textAlignVertical="top"
                  autoFocus
                />
                {editText.length > 0 && (
                  <Pressable
                    style={[styles.clearTextBtn, webPointer]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    onPress={() => setEditText("")}
                  >
                    <Ionicons name="close-circle" size={18} color={colors.textMuted} />
                  </Pressable>
                )}
              </View>

              {/* Action Row */}
              <View style={styles.actionRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cancel"
                  style={({ pressed, hovered }) => [
                    styles.cancelBtn,
                    webPointer,
                    hovered && styles.cancelBtnHovered,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={() => {
                    triggerHaptic("light");
                    router.back();
                  }}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Save changes"
                  disabled={editText.trim() === "" || !hasChanges}
                  style={({ pressed, hovered }) => [
                    styles.saveBtn,
                    (editText.trim() === "" || !hasChanges) && styles.saveBtnDisabled,
                    webPointer,
                    hovered && editText.trim() !== "" && hasChanges && styles.saveBtnHovered,
                    pressed && styles.buttonPressed,
                  ]}
                  onPress={handleSave}
                >
                  <Ionicons name="checkmark" size={18} color="#FFFFFF" />
                  <Text style={styles.saveBtnText}>
                    {isWide ? "Save Changes (Ctrl+S)" : "Save"}
                  </Text>
                </Pressable>
              </View>
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <Animated.View
          entering={FadeInDown.duration(240)}
          exiting={FadeOutDown.duration(200)}
          style={[styles.toastContainer, isWide && styles.toastContainerWide]}
        >
          <Ionicons name="checkmark-circle" size={18} color={colors.success} />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </SafeAreaView>
  );
}

const getStyles = (COLORS, { isCompact, isWide }) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    keyboardContainer: {
      flex: 1,
    },
    responsiveShell: {
      flex: 1,
      width: "100%",
      maxWidth: isWide ? 620 : undefined,
      alignSelf: isWide ? "center" : "stretch",
      paddingHorizontal: isCompact ? 12 : 20,
    },
    centeredContainer: {
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    // Header
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingTop: isCompact ? 8 : 14,
      paddingBottom: isCompact ? 12 : 16,
    },
    headerTitle: {
      fontSize: isCompact ? 18 : 20,
      fontWeight: "700",
      letterSpacing: -0.3,
      color: COLORS.text,
    },
    backButton: {
      width: isCompact ? 40 : 44,
      height: isCompact ? 40 : 44,
      borderRadius: 12,
      backgroundColor: COLORS.surface,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      alignItems: "center",
      justifyContent: "center",
      ...SHADOWS.card,
    },
    deleteTopBtn: {
      width: isCompact ? 40 : 44,
      height: isCompact ? 40 : 44,
      borderRadius: 12,
      backgroundColor: COLORS.dangerSurface,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteTopBtnHovered: {
      backgroundColor: COLORS.danger + "25",
    },
    buttonHovered: {
      backgroundColor: COLORS.borderSubtle,
    },
    buttonPressed: {
      opacity: 0.7,
      transform: [{ scale: 0.96 }],
    },
    scrollContent: {
      paddingTop: 8,
      paddingBottom: 40,
    },
    // Edit Card
    editCard: {
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      padding: isCompact ? 16 : 22,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      ...SHADOWS.card,
    },
    metaRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    idBadge: {
      backgroundColor: COLORS.borderSubtle,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 8,
    },
    idBadgeText: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    statusBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 5,
      paddingVertical: 6,
      paddingHorizontal: 12,
      borderRadius: 20,
      borderWidth: 1,
    },
    statusBadgeCompleted: {
      backgroundColor: COLORS.successSurface,
      borderColor: COLORS.success,
    },
    statusBadgePending: {
      backgroundColor: COLORS.primarySurface,
      borderColor: COLORS.primary,
    },
    statusBadgeText: {
      fontSize: 12,
      fontWeight: "600",
    },
    statusBadgeTextCompleted: {
      color: COLORS.success,
    },
    statusBadgeTextPending: {
      color: COLORS.primary,
    },
    label: {
      fontSize: 12,
      fontWeight: "600",
      color: COLORS.textMuted,
      textTransform: "uppercase",
      letterSpacing: 0.8,
      marginBottom: 8,
    },
    inputWrapper: {
      position: "relative",
      marginBottom: 24,
    },
    editInput: {
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      borderRadius: 12,
      paddingHorizontal: 16,
      paddingTop: 14,
      paddingBottom: 14,
      paddingRight: 40,
      fontSize: 16,
      lineHeight: 22,
      color: COLORS.text,
      minHeight: 120,
    },
    clearTextBtn: {
      position: "absolute",
      right: 12,
      top: 14,
    },
    // Action Row
    actionRow: {
      flexDirection: "row",
      gap: 12,
    },
    cancelBtn: {
      flex: 1,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: COLORS.background,
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      alignItems: "center",
      justifyContent: "center",
    },
    cancelBtnHovered: {
      backgroundColor: COLORS.borderSubtle,
    },
    cancelBtnText: {
      fontSize: 15,
      fontWeight: "600",
      color: COLORS.textSecondary,
    },
    saveBtn: {
      flex: 1.4,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      paddingVertical: 14,
      borderRadius: 12,
      backgroundColor: COLORS.primary,
      ...SHADOWS.card,
    },
    saveBtnDisabled: {
      opacity: 0.45,
    },
    saveBtnHovered: {
      backgroundColor: COLORS.primaryDark,
    },
    saveBtnText: {
      fontSize: 15,
      fontWeight: "700",
      color: "#FFFFFF",
    },
    // Not Found Card
    notFoundCard: {
      backgroundColor: COLORS.surface,
      borderRadius: 16,
      padding: 32,
      alignItems: "center",
      borderWidth: 1,
      borderColor: COLORS.borderColor,
      ...SHADOWS.card,
      maxWidth: 380,
      width: "100%",
    },
    notFoundIconContainer: {
      marginBottom: 16,
    },
    notFoundTitle: {
      fontSize: 19,
      fontWeight: "700",
      color: COLORS.text,
      marginBottom: 8,
    },
    notFoundSubtext: {
      fontSize: 14,
      color: COLORS.textMuted,
      textAlign: "center",
      lineHeight: 20,
      marginBottom: 24,
    },
    backButtonPrimary: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: COLORS.primary,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 10,
    },
    backButtonPrimaryHovered: {
      backgroundColor: COLORS.primaryDark,
    },
    backButtonPrimaryText: {
      color: "#FFFFFF",
      fontSize: 14,
      fontWeight: "600",
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
      gap: 10,
      paddingVertical: 12,
      paddingHorizontal: 18,
      borderRadius: 12,
      ...SHADOWS.floating,
    },
    toastContainerWide: {
      maxWidth: 420,
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
  });
