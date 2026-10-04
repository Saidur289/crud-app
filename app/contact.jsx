import React, { useState } from "react";
import { View, Text, ScrollView, Pressable, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { SHADOWS } from "../constants/theme";

export default function Contact() {
  const { colors } = useTheme();
  const router = useRouter();
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;
    Alert.alert("Message Sent", "Thank you for contacting us!");
    setMessage("");
    router.back();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={["top", "left", "right"]}>
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={{ fontSize: 20, fontWeight: "700", color: colors.text, marginLeft: 8 }}>Contact Us</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ fontSize: 16, color: colors.text, lineHeight: 24, marginBottom: 16 }}>
          Have a question or feedback? Send us a message below.
        </Text>
        <TextInput
          style={{
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.borderColor,
            borderRadius: 12,
            padding: 16,
            fontSize: 16,
            color: colors.text,
            minHeight: 120,
            textAlignVertical: "top",
            marginBottom: 20,
            ...SHADOWS.card,
          }}
          multiline
          placeholder="Your message..."
          placeholderTextColor={colors.textMuted}
          value={message}
          onChangeText={setMessage}
        />
        <Pressable
          style={({ pressed }) => [
            {
              backgroundColor: colors.primary,
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
              opacity: message.trim() ? 1 : 0.5,
              ...SHADOWS.card,
            },
            pressed && { transform: [{ scale: 0.98 }] },
          ]}
          disabled={!message.trim()}
          onPress={handleSubmit}
        >
          <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>Send Message</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
