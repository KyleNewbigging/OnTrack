import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store";
import Heatmap from "./Heatmap";
import { format } from "date-fns";
import { useThemeColors } from "../theme";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type OverviewProps = NativeStackScreenProps<RootStackParamList, "Consistency">;

export default function OverviewScreen({ route }: OverviewProps) {
  const { goalId } = route.params;
  const colors = useThemeColors();
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);

  if (!goal) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: colors.background }}
        edges={['bottom', 'left', 'right']}
      >
        <Text style={{ color: colors.text }}>Goal not found</Text>
      </SafeAreaView>
    );
  }

  const buildHeatmap = (dates: Date[]) => {
    const map: Record<string, number> = {};
    dates.forEach((date) => {
      const key = format(date, "yyyy-MM-dd");
      map[key] = 1;
    });
    return map;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom', 'left', 'right']}>
      <View style={{ flex: 1, padding: 16, gap: 16, backgroundColor: colors.background }}>
        <View style={{ gap: 4 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>
            {goal.title} / Consistency
          </Text>
          <Text style={{ color: colors.textMuted }}>
            Each tile marks a day you logged progress.
          </Text>
        </View>

        <FlatList
          data={goal.subGoals}
          keyExtractor={(task) => task.id}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item: task }) => (
            <View
              style={{
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 12,
                padding: 12,
                backgroundColor: colors.surface,
                gap: 8,
              }}
            >
              <View>
                <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
                  {task.title}
                </Text>
                <Text style={{ color: colors.textMuted, fontSize: 14 }}>
                  Frequency: {task.frequency} - Completions: {task.completions.length}
                </Text>
              </View>

              <Heatmap startOffsetDays={180} values={buildHeatmap(task.completions)} />
            </View>
          )}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </SafeAreaView>
  );
}
