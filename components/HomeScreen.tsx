import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, Text, View, Pressable, FlatList } from "react-native";
import { useStore } from "../store";
import Heatmap from "./Heatmap";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Overview: { goalId: string };
};

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation }: HomeProps) {
  const goals = useStore((s) => s.goals);
  const completionsByDate = useStore((s) => s.completionsByDate);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Pressable
          onPress={() => navigation.navigate("NewGoal")}
          style={{ backgroundColor: "#111827", padding: 12, borderRadius: 10 }}
        >
          <Text style={{ color: "white", fontWeight: "600", textAlign: "center" }}>+ New Goal</Text>
        </Pressable>

        <Text style={{ fontSize: 18, fontWeight: "700" }}>Consistency</Text>
        <Heatmap startOffsetDays={180} values={completionsByDate()} />

        <Text style={{ fontSize: 18, fontWeight: "700", marginTop: 8 }}>Goals</Text>
        <FlatList
          data={goals}
          keyExtractor={(g) => g.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => navigation.navigate("Goal", { goalId: item.id })}
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12 }}
            >
              <Text style={{ fontSize: 16, fontWeight: "700" }}>{item.title}</Text>
              {item.target && <Text style={{ color: "#6b7280" }}>Target: {item.target}</Text>}
              <Text style={{ color: "#6b7280" }}>Sub-goals: {item.subGoals.length}</Text>
            </Pressable>
          )}
        />
      </View>
    </SafeAreaView>
  );
}
