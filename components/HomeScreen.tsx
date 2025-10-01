import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStore, debugAsyncStorage, getCurrentMode } from "../store";
import RadarChart from "./RadarChart";
import { useThemeColors, useThemeName, getThemeToggleContent } from "../theme";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeProps) {
  const goals = useStore((s) => s.goals);
  const toggleTheme = useStore((s) => s.toggleTheme);
  const currentMode = getCurrentMode();
  const themeName = useThemeName();
  const colors = useThemeColors();
  const themeContent = getThemeToggleContent(themeName);
  const sliderJustify = themeName === "dark" ? "flex-end" : "flex-start";
  const modeColor = currentMode === "DEV" ? colors.accent : colors.textMuted;
  const modeDescription = currentMode === "DEV" ? "Demo data enabled." : "Tracking live entries.";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ padding: 16, gap: 20, backgroundColor: colors.background, flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "stretch", gap: 16 }}>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 12,
                  color: modeColor,
                  fontFamily: "monospace",
                  letterSpacing: 1,
                }}
              >
                {currentMode === 'DEV' ? 'DEV STORE' : 'PROD STORE'}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12, marginTop: 4 }}>
                {modeDescription}
              </Text>
            </View>
            <Pressable
              onPress={async () => {
                await Haptics.selectionAsync();
                toggleTheme();
              }}
              style={{
                flexBasis: 170,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.surface,
                padding: 12,
                gap: 6,
              }}
            >
              <Text style={{ color: colors.accent, fontSize: 12, fontWeight: "700" }}>
                {themeContent.title}
              </Text>
              <Text style={{ color: colors.textMuted, fontSize: 12 }}>
                {themeContent.subtitle}
              </Text>
              <View
                style={{
                  height: 10,
                  borderRadius: 9999,
                  backgroundColor: colors.surfaceMuted,
                  borderWidth: 1,
                  borderColor: colors.border,
                  paddingHorizontal: 2,
                  justifyContent: sliderJustify,
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    height: 6,
                    width: "40%",
                    borderRadius: 9999,
                    backgroundColor: colors.accent,
                  }}
                />
              </View>
            </Pressable>
          </View>

          <View style={{ flexDirection: "row", gap: 10 }}>
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("NewGoal");
              }}
              style={{
                backgroundColor: colors.button,
                padding: 12,
                borderRadius: 12,
                flex: 1,
              }}
            >
              <Text style={{ color: colors.buttonText, fontWeight: "700", textAlign: "center" }}>
                + New Goal
              </Text>
            </Pressable>

            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                debugAsyncStorage();
              }}
              style={{
                backgroundColor: colors.danger,
                padding: 12,
                borderRadius: 12,
              }}
            >
              <Text style={{ color: colors.dangerText, fontWeight: "700", textAlign: "center" }}>
                Debug
              </Text>
            </Pressable>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
              Consistency Overview
            </Text>
            <RadarChart goals={goals} size={250} />
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
              Goals
            </Text>

            {goals.map((goal, index) => (
              <View key={goal.id}>
                <Pressable
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    navigation.navigate("Goal", { goalId: goal.id });
                  }}
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    borderRadius: 12,
                    padding: 12,
                    backgroundColor: colors.surface,
                    gap: 4,
                  }}
                >
                  <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                    {goal.title}
                  </Text>
                  {goal.target && (
                    <Text style={{ color: colors.textMuted }}>
                      Target: {goal.target}
                    </Text>
                  )}
                  <Text style={{ color: colors.textMuted }}>
                    Sub-goals: {goal.subGoals.length}
                  </Text>
                </Pressable>
                {index < goals.length - 1 && <View style={{ height: 12 }} />}
              </View>
            ))}

            {goals.length === 0 && (
              <Text style={{ color: colors.textMuted }}>
                Tap "New Goal" to start charting your next win.
              </Text>
            )}
          </View>

          <View style={{ height: 20 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
