import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store";
import Heatmap from "./Heatmap";
import { format } from "date-fns";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Overview: { goalId: string };
};

type OverviewProps = NativeStackScreenProps<RootStackParamList, "Overview">;

export default function OverviewScreen({ navigation, route }: OverviewProps) {
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);

  if (!goal) return <Text>Goal not found</Text>;

  // Transform task completions into heatmap format for each task
  const getTaskHeatmapData = (taskCompletions: Date[]) => {
    const heatmapData: Record<string, number> = {};
    taskCompletions.forEach(date => {
      const dateKey = format(date, "yyyy-MM-dd");
      heatmapData[dateKey] = 1; // 1 indicates completion
    });
    return heatmapData;
  };

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "800" }}>{goal.title} - Overview</Text>
          <Text style={{ color: "#374151", marginTop: 4 }}>Task completion heatmaps</Text>
        </View>

        <FlatList
          data={goal.subGoals}
          keyExtractor={(task) => task.id}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item: task }) => (
            <View style={{ 
              borderWidth: 1, 
              borderColor: "#e5e7eb", 
              borderRadius: 10, 
              padding: 12,
              backgroundColor: "white"
            }}>
              <View style={{ marginBottom: 8 }}>
                <Text style={{ fontSize: 16, fontWeight: "700" }}>{task.title}</Text>
                <Text style={{ color: "#6b7280", fontSize: 14 }}>
                  Frequency: {task.frequency} • Completions: {task.completions.length}
                </Text>
              </View>
              
              <Heatmap 
                startOffsetDays={180} 
                values={getTaskHeatmapData(task.completions)} 
              />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
