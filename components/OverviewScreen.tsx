import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";
import { useStore, getCustomFrequencyProgress, getGoalStreak } from "../store";
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
  const streakBadgeSize = 24;
  const streakRingSize = 32;
  const streakRingStrokeWidth = 3;
  const streakRingRadius = (streakRingSize - streakRingStrokeWidth) / 2;
  const streakRingCircumference = 2 * Math.PI * streakRingRadius;
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
                    const customProgress = task.frequency === "custom" && task.customFrequency
                      ? getCustomFrequencyProgress(task, new Date())
                      : null;
                    const progressRatio = customProgress
                      ? Math.min(customProgress.completed / customProgress.target, 1)
                      : 0;
                    const progressOffset = streakRingCircumference * (1 - progressRatio);
                    
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
                            top: -10,
                            right: -14,
                            width: streakRingSize,
                            height: streakRingSize,
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                            {customProgress ? (
                              <Svg
                                width={streakRingSize}
                                height={streakRingSize}
                                style={{ position: "absolute" }}
                              >
                                <Circle
                                  cx={streakRingSize / 2}
                                  cy={streakRingSize / 2}
                                  r={streakRingRadius}
                                  stroke={theme.border}
                                  strokeWidth={streakRingStrokeWidth}
                                  fill="none"
                                  opacity={0.45}
                                />
                                <Circle
                                  cx={streakRingSize / 2}
                                  cy={streakRingSize / 2}
                                  r={streakRingRadius}
                                  stroke="#FF8A3D"
                                  strokeWidth={streakRingStrokeWidth}
                                  fill="none"
                                  strokeDasharray={`${streakRingCircumference} ${streakRingCircumference}`}
                                  strokeDashoffset={progressOffset}
                                  strokeLinecap="round"
                                  transform={`rotate(-90 ${streakRingSize / 2} ${streakRingSize / 2})`}
                                />
                              </Svg>
                            ) : null}
                            <View style={{
                              backgroundColor: hasStreak ? theme.primary : theme.textSecondary,
                              borderRadius: streakBadgeSize / 2,
                              minWidth: streakBadgeSize,
                              height: streakBadgeSize,
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
