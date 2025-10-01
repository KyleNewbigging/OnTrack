import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  Text,
  View,
  Pressable,
  ScrollView,
  Modal,
  Switch,
  Alert,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import {
  useStore,
  debugAsyncStorage,
  getCurrentMode,
} from "../store";
import RadarChart from "./RadarChart";
import {
  useThemeColors,
  useThemeName,
  getThemeToggleContent,
} from "../theme";

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
  const clearStore = useStore((s) => s.clearStore);
  const currentMode = getCurrentMode();
  const themeName = useThemeName();
  const colors = useThemeColors();
  const themeContent = getThemeToggleContent(themeName);

  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);

  const modeDescription =
    currentMode === "DEV"
      ? "Demo data enabled."
      : "Tracking live entries.";
  const modeAccent = currentMode === "DEV" ? colors.accent : colors.textMuted;

  const openSettings = React.useCallback(async () => {
    await Haptics.selectionAsync();
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = React.useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={openSettings} style={styles.headerIcon} hitSlop={10}>
          <Text style={[styles.headerIconText, { color: colors.text }]}>{String.fromCharCode(0x2699)}</Text>
        </Pressable>
      ),
      headerStyle: { backgroundColor: colors.background },
      headerTitleStyle: { color: colors.text },
      headerTintColor: colors.text,
    });
  }, [navigation, openSettings, colors.background, colors.text]);

  const handleToggleTheme = React.useCallback(async () => {
    await Haptics.selectionAsync();
    toggleTheme();
  }, [toggleTheme]);

  const handleClearStore = React.useCallback(() => {
    Alert.alert(
      "Clear local data?",
      "This removes all goals and completions stored on this device.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Warning
            );
            clearStore();
            closeSettings();
          },
        },
      ]
    );
  }, [clearStore, closeSettings]);

  const handleDebug = React.useCallback(async () => {
    await Haptics.selectionAsync();
    await debugAsyncStorage();
  }, []);

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: colors.background }}
      edges={['bottom', 'left', 'right']}
    >
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ gap: 8 }}>
          <Text
            style={{
              fontSize: 12,
              color: modeAccent,
              fontFamily: "monospace",
              letterSpacing: 1,
            }}
          >
            {currentMode === "DEV" ? "DEV STORE" : "PROD STORE"}
          </Text>
          <Text style={{ color: colors.textMuted, fontSize: 12 }}>
            {modeDescription}
          </Text>
        </View>

        <View style={{ flexDirection: "row", gap: 12 }}>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate("NewGoal");
            }}
            style={{
              backgroundColor: colors.button,
              paddingVertical: 12,
              paddingHorizontal: 16,
              borderRadius: 14,
              flex: 1,
            }}
          >
            <Text
              style={{
                color: colors.buttonText,
                fontWeight: "700",
                textAlign: "center",
              }}
            >
              + New Goal
            </Text>
          </Pressable>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
            Consistency Overview
          </Text>
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 16,
              padding: 12,
              backgroundColor: colors.surface,
            }}
          >
            <RadarChart goals={goals} size={250} />
          </View>
        </View>

        <View style={{ gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: colors.text }}>
            Goals
          </Text>
          {goals.length === 0 ? (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 16,
                backgroundColor: colors.surface,
              }}
            >
              <Text style={{ color: colors.textMuted }}>
                Tap "New Goal" to start charting your next win.
              </Text>
            </View>
          ) : (
            goals.map((goal, index) => (
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
                {index < goals.length - 1 && <View style={{ height: 10 }} />}
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <Modal
        visible={isSettingsOpen}
        animationType="fade"
        transparent
        onRequestClose={closeSettings}
      >
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.backdropDismiss} onPress={closeSettings} />
          <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={[styles.sheetTitle, { color: colors.text }]}>Settings</Text>
              <Pressable onPress={closeSettings} hitSlop={10}>
                <Text style={[styles.closeText, { color: colors.textMuted }]}>Close</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Appearance</Text>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Dark mode</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Flip OnTrack into night mode.</Text>
                </View>
                <Switch
                  value={themeName === "dark"}
                  onValueChange={handleToggleTheme}
                  trackColor={{ false: "#d1d5db", true: colors.accentMuted }}
                  thumbColor={themeName === "dark" ? colors.surface : "#ffffff"}
                  ios_backgroundColor={colors.border}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Developer</Text>
              <Pressable style={styles.row} onPress={handleClearStore}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Clear local store</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Removes every goal and completion saved on this device.</Text>
                </View>
                <Text style={[styles.rowIndicator, { color: colors.textMuted }]}>{'>'}</Text>
              </Pressable>

              <Pressable style={styles.row} onPress={handleDebug}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.rowTitle, { color: colors.text }]}>Dump AsyncStorage</Text>
                  <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>Log keys and payload sizes to the console.</Text>
                </View>
                <Text style={[styles.rowIndicator, { color: colors.textMuted }]}>{'>'}</Text>
              </Pressable>
            </View>

            <View style={styles.section}>
              <Text style={[styles.sectionLabel, { color: colors.text }]}>Coming soon</Text>
              <Text style={[styles.rowSubtitle, { color: colors.textMuted }]}>We'll tuck new controls and experiments in here.</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerIcon: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  headerIconText: {
    fontSize: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "flex-end",
  },
  backdropDismiss: {
    flex: 1,
  },
  sheet: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    gap: 20,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 48,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(148, 163, 184, 0.45)",
    marginBottom: 8,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  closeText: {
    fontSize: 14,
    fontWeight: "600",
  },
  section: {
    gap: 12,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  rowSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
  rowIndicator: {
    fontSize: 18,
    color: "#6b7280",
  },
});
