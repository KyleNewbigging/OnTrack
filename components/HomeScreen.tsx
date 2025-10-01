import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, ScrollView, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore, debugAsyncStorage, getCurrentMode } from "../store";
import RadarChart from "./RadarChart";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Overview: { goalId: string };
};

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeProps) {
  const goals = useStore((s) => s.goals);
  const currentMode = getCurrentMode();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 12 }}>
          
          {/* Store Mode Indicator */}
          <Text style={{ 
            fontSize: 10, 
            color: currentMode === 'DEV' ? '#f59e0b' : '#6b7280', 
            opacity: 0.6, 
            textAlign: 'right',
            fontFamily: 'monospace',
            letterSpacing: 0.5
          }}>
            {currentMode === 'DEV' ? '● DEV STORE' : '● PROD STORE'}
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={() => navigation.navigate("NewGoal")}
              style={{ backgroundColor: "#111827", padding: 12, borderRadius: 10, flex: 1 }}
            >
              <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>+ New Goal</Text>
            </Pressable>
            
            <Pressable
              onPress={() => debugAsyncStorage()}
              style={{ backgroundColor: "#ef4444", padding: 12, borderRadius: 10 }}
            >
              <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>Debug</Text>
            </Pressable>
            

          </View>

          <Text style={{ fontSize: 18, fontWeight: "700" }}>Consistency Overview</Text>
          <RadarChart goals={goals} size={250} />

          <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8 }}>Goals</Text>
          
          {/* Goals list */}
          {goals.map((goal, index) => (
            <View key={goal.id}>
              <Pressable
                onPress={() => navigation.navigate("Goal", { goalId: goal.id })}
                style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }}
              >
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{goal.title}</Text>
                {goal.target && <Text style={{ color: "#6b7280" }}>Target: {goal.target}</Text>}
                <Text style={{ color: "#6b7280" }}>Sub-goals: {goal.subGoals.length}</Text>
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
