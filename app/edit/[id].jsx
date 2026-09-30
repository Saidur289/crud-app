import React from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useTheme } from "../../context/ThemeContext";
import EditTaskPane from "../../components/EditTaskPane";

export default function EditTodo() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={["top", "left", "right"]}>
      <EditTaskPane id={id} onClose={() => router.back()} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
