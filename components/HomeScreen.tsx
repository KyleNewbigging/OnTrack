import React, { useState, useLayoutEffect } from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, ScrollView, Alert, Switch, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from "expo-haptics";
import { useStore, debugAsyncStorage, getCurrentMode } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import RadarChart from "./RadarChart";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeProps) {
  const goals = useStore((s) => s.goals);
  const currentMode = getCurrentMode();
  const { theme, isDark, toggleTheme } = useTheme();
  const [settingsVisible, setSettingsVisible] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
          
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("NewGoal");
            }}
            style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>+ New Goal</Text>
          </Pressable>

          <Text style={{ fontSize: 18, fontWeight: "700", color: theme.text }}>Consistency Overview</Text>
          <RadarChart goals={goals} size={250} />

          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8, color: theme.text }}>Goals</Text>
          
          {/* Goals list */}
          {goals.map((goal, index) => (
            <View key={goal.id}>
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate("Goal", { goalId: goal.id });
                }}
                style={{ 
                  borderWidth: 1, 
                  borderColor: theme.border, 
                  borderRadius: 10, 
                  padding: 12, 
                  backgroundColor: theme.surface 
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>{goal.title}</Text>
                {goal.target && <Text style={{ color: theme.textSecondary }}>Target: {goal.target}</Text>}
                <Text style={{ color: theme.textSecondary }}>Sub-goals: {goal.subGoals.length}</Text>
              </Pressable>
              {index < goals.length - 1 && <View style={{ height: 8 }} />}
            </View>
          ))}
          
          {/* Add bottom padding so content doesn't get cut off */}
          <View style={{ height: 20 }} />
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={settingsVisible}
        onRequestClose={() => setSettingsVisible(false)}
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
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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
                onValueChange={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleTheme();
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDark ? theme.surface : theme.background}
              />
            </View>

            {/* Store Mode Indicator */}
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <Text style={{ color: theme.text, fontWeight: "600", fontSize: 16 }}>Store Mode</Text>
              <Text style={{ 
                fontSize: 12, 
                color: currentMode === 'DEV' ? theme.warning : theme.textSecondary, 
                fontFamily: 'monospace',
                letterSpacing: 0.5,
                backgroundColor: theme.background,
                padding: 6,
                borderRadius: 6
              }}>
                {currentMode === 'DEV' ? '● DEV STORE' : '● PROD STORE'}
              </Text>
            </View>

            {/* Debug Button */}
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

            {/* Clear Stores Button */}
            <Pressable
              onPress={async () => {
                Alert.alert(
                  "Clear All Data?",
                  "This will permanently delete all goals, tasks, and completions. This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Clear All", 
                      style: "destructive", 
                      onPress: async () => {
                        try {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                          
                          // Get all keys and clear OnTrack related storage
                          const allKeys = await AsyncStorage.getAllKeys();
                          const onTrackKeys = allKeys.filter(key => 
                            key.startsWith('ontrack') || key === 'theme'
                          );
                          
                          if (onTrackKeys.length > 0) {
                            await AsyncStorage.multiRemove(onTrackKeys);
                          }
                          
                          setSettingsVisible(false);
                          
                          Alert.alert(
                            "Data Cleared",
                            "All data has been cleared. Please restart the app to see fresh data.",
                            [{ text: "OK" }]
                          );
                        } catch (error) {
                          console.error('Error clearing storage:', error);
                          Alert.alert("Error", "Failed to clear data. Please try again.");
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
              <Text style={{ color: "white", fontWeight: "600", fontSize: 16 }}>Clear All Data</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
