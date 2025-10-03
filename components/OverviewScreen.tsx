import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore, getGoalStreak } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import Heatmap from "./Heatmap";
import { format } from "date-fns";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type OverviewProps = NativeStackScreenProps<RootStackParamList, "Consistency">;

export default function OverviewScreen({ navigation, route }: OverviewProps) {
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);
  const { theme } = useTheme();

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
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 16 }}>
        <View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text }}>{goal.title} - Consistency</Text>
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>Task completion heatmaps</Text>
        </View>

        <FlatList
          data={goal.subGoals}
          keyExtractor={(task) => task.id}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
          renderItem={({ item: task }) => (
            <View style={{ 
              borderWidth: 1, 
              borderColor: theme.border, 
              borderRadius: 10, 
              padding: 12,
              backgroundColor: theme.surface
            }}>
              <View style={{ marginBottom: 8 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>{task.title}</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 14 }}>
                      Frequency: {task.frequency === "custom" && task.customFrequency 
                        ? `${task.customFrequency.target} times per ${task.customFrequency.type.slice(0, -2)}`
                        : task.frequency
                      } • Completions: {task.completions.length}
                    </Text>
                  </View>
                  
                  {/* Fire Streak Indicator - Always Show */}
                  {(() => {
                    const streak = getGoalStreak(task);
                    const hasStreak = streak > 0;
                    
                    return (
                      <View style={{ alignItems: "center", marginLeft: 12 }}>
                        <View style={{ position: "relative" }}>
                          <Ionicons 
                            name="flame" 
                            size={28} 
                            color={hasStreak ? "#FF6B35" : theme.textSecondary}
                            style={{ opacity: hasStreak ? 1 : 0.5 }}
                          />
                          <View style={{
                            position: "absolute",
                            top: -6,
                            right: -10,
                            backgroundColor: hasStreak ? theme.primary : theme.textSecondary,
                            borderRadius: 12,
                            minWidth: 24,
                            height: 24,
                            justifyContent: "center",
                            alignItems: "center",
                            paddingHorizontal: 6,
                            borderWidth: 2,
                            borderColor: theme.surface,
                            opacity: hasStreak ? 1 : 0.6,
                          }}>
                            <Text style={{
                              color: "white",
                              fontSize: 11,
                              fontWeight: "bold",
                            }}>
                              {streak}
                            </Text>
                          </View>
                        </View>
                        <Text style={{ 
                          fontSize: 10, 
                          color: hasStreak ? theme.textSecondary : theme.textSecondary, 
                          marginTop: 2,
                          fontWeight: "600",
                          opacity: hasStreak ? 1 : 0.6,
                        }}>
                          {streak} streak
                        </Text>
                      </View>
                    );
                  })()}
                </View>
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
