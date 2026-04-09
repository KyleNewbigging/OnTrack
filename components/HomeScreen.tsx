import React, { useState, useLayoutEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, ScrollView, Alert, Switch, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from '@expo/vector-icons';
import { useStore, debugAsyncStorage, getCurrentMode } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import RadarChart from "./RadarChart";
import { haptics } from "../utils/haptics";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
  Privacy: undefined;
};

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeProps) {
  const goals = useStore((s) => s.goals);
  const resetAppData = useStore((s) => s.resetAppData);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const currentMode = getCurrentMode();
  const { theme, isDark, toggleTheme, resetThemePreference } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);
  const isDevToolsVisible = currentMode === "DEV";

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={() => {
            void haptics.tap();
            setSettingsVisible(true);
          }}
          style={{ padding: 8 }}
        >
          <Ionicons name="settings-outline" size={20} color={theme.text} />
        </Pressable>
      ),
    });
  }, [navigation, theme.text]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>Consistency Overview</Text>
          <RadarChart goals={goals} size={250} />

          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8, color: theme.text }}>Goals</Text>
          
          {/* Goals list */}
          {goals.map((goal, index) => (
            <View key={goal.id}>
              <View
                style={{ 
                  borderWidth: 1, 
                  borderColor: theme.border, 
                  borderRadius: 10, 
                  padding: 12, 
                  backgroundColor: theme.surface 
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                  <Pressable
                    onPress={() => {
                      void haptics.navigate();
                      navigation.navigate("Goal", { goalId: goal.id });
                    }}
                    style={{ flex: 1 }}
                  >
                    <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>{goal.title}</Text>
                    {goal.target && <Text style={{ color: theme.textSecondary }}>Target: {goal.target}</Text>}
                    <Text style={{ color: theme.textSecondary }}>Sub-goals: {goal.subGoals.length}</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      void haptics.warning();
                      Alert.alert(
                        "Delete goal?",
                        `This will remove "${goal.title}" and all its sub-goals.`,
                        [
                          { text: "Cancel", style: "cancel" },
                          {
                            text: "Delete",
                            style: "destructive",
                            onPress: () => {
                              void haptics.destructive();
                              deleteGoal(goal.id);
                            }
                          }
                        ]
                      );
                    }}
                    style={{
                      alignSelf: "center",
                      borderRadius: 9999,
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      opacity: 0.35
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
              </View>
              {index < goals.length - 1 && <View style={{ height: 8 }} />}
            </View>
          ))}

          <Pressable
            onPress={() => {
              void haptics.navigate();
              navigation.navigate("NewGoal");
            }}
            style={{
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.border,
              padding: 12,
              borderRadius: 10,
              marginTop: 4,
            }}
          >
            <Text style={{ color: theme.textSecondary, fontWeight: "600", textAlign: "center" }}>+ New Goal</Text>
          </Pressable>
          
          {/* Add bottom padding so content doesn't get cut off */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => {
          void haptics.tap();
          setSettingsVisible(false);
        }}
      >
        <View style={{ 
          flex: 1, 
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0, 0, 0, 0.5)' 
        }}>
          <View style={{ 
            backgroundColor: theme.surface,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 40,
            borderTopWidth: 1,
            borderTopColor: theme.border
          }}>
            {/* Modal Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Settings</Text>
              <Pressable
                onPress={() => {
                  void haptics.tap();
                  setSettingsVisible(false);
                }}
                style={{ 
                  padding: 8, 
                  borderRadius: 8,
                  backgroundColor: theme.background
                }}
              >
                <Ionicons name="close" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>

            {/* Dark Mode Toggle */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={() => {
                  void haptics.toggle();
                  toggleTheme();
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDark ? theme.surface : theme.background}
              />
            </View>

            <Pressable
              onPress={() => {
                void haptics.navigate();
                setSettingsVisible(false);
                navigation.navigate("Privacy");
              }}
              style={{
                backgroundColor: theme.background,
                padding: 12,
                borderRadius: 10,
                marginBottom: 20,
                borderWidth: 1,
                borderColor: theme.border
              }}
            >
              <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>Privacy & Data</Text>
              <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
                Goals and completion history stay on this device.
              </Text>
            </Pressable>

            {isDevToolsVisible && (
              <>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>Store Mode</Text>
                  <Text style={{ 
                    fontSize: 12, 
                    color: theme.warning, 
                    fontFamily: 'monospace',
                    letterSpacing: 0.5,
                    backgroundColor: theme.background,
                    padding: 6,
                    borderRadius: 6
                  }}>
                    ● DEV STORE
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    void haptics.tap();
                    debugAsyncStorage();
                    setSettingsVisible(false);
                  }}
                  style={{ 
                    backgroundColor: theme.danger, 
                    padding: 12, 
                    borderRadius: 10,
                    alignItems: 'center',
                    marginBottom: 12
                  }}
                >
                  <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Debug Storage</Text>
                </Pressable>
              </>
            )}

            {/* Clear Stores Button */}
            <Pressable
              onPress={() => {
                void haptics.warning();
                Alert.alert(
                  "Reset app data?",
                  "This will permanently delete all goals, tasks, and completion history stored on this device.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Reset", 
                      style: "destructive", 
                      onPress: async () => {
                        try {
                          await haptics.destructive();

                          resetAppData();
                          await resetThemePreference();
                          setSettingsVisible(false);

                          Alert.alert(
                            "App data reset",
                            "Your local data has been removed.",
                            [{ text: "OK" }]
                          );
                        } catch (error) {
                          console.error('Error resetting storage:', error);
                          Alert.alert("Error", "Failed to reset app data. Please try again.");
                        }
                      }
                    }
                  ]
                );
              }}
              style={{ 
                backgroundColor: theme.warning, 
                padding: 12, 
                borderRadius: 10,
                alignItems: 'center'
              }}
            >
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Reset App Data</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
