import React from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function About() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  
  const isLargeScreen = width > 768;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#E4EBF4" }} edges={["top", "left", "right"]}>
      {/* Navigation */}
      <View style={{ flexDirection: "row", alignItems: "center", padding: 16 }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 16, alignItems: 'center' }}>
        {/* Top Title */}
        <Text style={{ fontSize: 36, fontWeight: "800", color: "#000", marginTop: 20, marginBottom: 40, textAlign: 'center' }}>
          About Us Design
        </Text>

        {/* Main Card */}
        <View style={{
          backgroundColor: "#050505",
          borderRadius: 16,
          padding: 32,
          width: '100%',
          maxWidth: 960,
          flexDirection: isLargeScreen ? "row" : "column",
          gap: 40,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.1,
          shadowRadius: 15,
          elevation: 5,
        }}>
          {/* Left Column - Text Content */}
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text style={{ fontSize: 26, fontWeight: "700", color: "#FFF", marginBottom: 16 }}>
              About Us Section Heading
            </Text>
            <Text style={{ fontSize: 14, color: "#A0AAB5", lineHeight: 24, marginBottom: 32 }}>
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus,
              luctus nec ullamcorper mattis, pulvinar dapibus leo. Lorem ipsum
              dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis, pulvinar dapibus leo.
            </Text>

            <Pressable style={{ 
              backgroundColor: "#FFF", 
              paddingVertical: 14, 
              paddingHorizontal: 28, 
              borderRadius: 4, 
              alignSelf: "flex-start" 
            }}>
              <Text style={{ color: "#000", fontSize: 14, fontWeight: "600" }}>Click here</Text>
            </Pressable>

            <View style={{ flexDirection: "row", marginTop: 48, gap: 48 }}>
              <View>
                <Text style={{ fontSize: 24, fontWeight: "800", color: "#FFF", marginBottom: 8 }}>120+</Text>
                <Text style={{ fontSize: 14, color: "#E2E8F0" }}>Lorem Ipsum</Text>
              </View>
              <View>
                <Text style={{ fontSize: 24, fontWeight: "800", color: "#FFF", marginBottom: 8 }}>56K+</Text>
                <Text style={{ fontSize: 14, color: "#E2E8F0" }}>Lorem Ipsum</Text>
              </View>
            </View>
          </View>

          {/* Right Column - Image Grid */}
          <View style={{ 
            flex: 1.2, 
            flexDirection: "row", 
            flexWrap: "wrap", 
            gap: 12,
            justifyContent: "center"
          }}>
            {[1, 2, 3, 4].map((item) => (
              <View 
                key={item} 
                style={{ 
                  width: '47%', 
                  aspectRatio: 1, 
                  backgroundColor: "#E2E8F0", 
                  borderRadius: 8,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                 <Ionicons name="image" size={48} color="#CBD5E1" />
              </View>
            ))}
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {/* Footer Text */}
        <Text style={{ fontSize: 20, color: "#334155", marginTop: 60, marginBottom: 20 }}>
          wpshogun.com
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
