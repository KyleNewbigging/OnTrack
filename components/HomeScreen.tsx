import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, Text, View, Pressable, ScrollView } from "react-native";
import { useStore } from "../store";
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

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ padding: 16, gap: 12 }}>
          <Pressable
            onPress={() => navigation.navigate("NewGoal")}
            style={{ backgroundColor: "#111827", padding: 12, borderRadius: 10 }}
          >
            <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>+ New Goal</Text>
          </Pressable>

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
