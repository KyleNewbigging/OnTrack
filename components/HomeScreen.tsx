import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, ScrollView, Alert, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1, backgroundColor: theme.background }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 12 }}>
          
          {/* Theme Toggle and Store Mode */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ color: theme.textSecondary, fontWeight: "600" }}>Dark Mode</Text>
              <Switch
                value={isDark}
                onValueChange={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleTheme();
                }}
                trackColor={{ false: theme.border, true: theme.primary }}
                thumbColor={isDark ? theme.background : theme.surface}
              />
            </View>
            <Text style={{ 
              fontSize: 10, 
              color: currentMode === 'DEV' ? theme.warning : theme.textSecondary, 
              opacity: 0.6, 
              fontFamily: 'monospace',
              letterSpacing: 0.5
            }}>
              {currentMode === 'DEV' ? '● DEV STORE' : '● PROD STORE'}
            </Text>
          </View>
          
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate("NewGoal");
              }}
              style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 10, flex: 1 }}
            >
              <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>+ New Goal</Text>
            </Pressable>
            
            <Pressable
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                debugAsyncStorage();
              }}
              style={{ backgroundColor: theme.danger, padding: 12, borderRadius: 10 }}
            >
              <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Debug</Text>
            </Pressable>
            

          </View>

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
    </SafeAreaView>
  );
}
