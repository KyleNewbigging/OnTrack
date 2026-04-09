import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput, ScrollView, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useStore, getCustomFrequencyProgress, shouldShowCustomTask } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { Frequency, CustomFrequency } from "../types";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type GoalProps = NativeStackScreenProps<RootStackParamList, "Goal">;

export default function GoalScreen({ navigation, route }: GoalProps) {
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);
  const addSubGoal = useStore((s) => s.addSubGoal);
  const deleteSubGoal = useStore((s) => s.deleteSubGoal);
  const toggleTask = useStore((s) => s.toggleTaskCompletion);
  const { theme } = useTheme();

  const [subTitle, setSubTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState<Frequency>("daily");
  const [customFrequency, setCustomFrequency] = React.useState<CustomFrequency>({ type: "weekly", target: 3 });
  const [isEditing, setIsEditing] = React.useState(false);

  if (!goal) return <Text>Not found</Text>;

  const isCompletedToday = (dates: Date[], referenceDate: Date) =>
    dates.some(date => format(date, "yyyy-MM-dd") === format(referenceDate, "yyyy-MM-dd"));

  const confirmDeleteTask = (taskId: string, taskTitle: string) => {
    Alert.alert(
      "Delete task?",
      `This will remove "${taskTitle}" from this goal.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            deleteSubGoal(goalId, taskId);
          }
        }
      ]
    );
  };

  const today = new Date();
  const pendingTasks = goal.subGoals.filter(item => {
    if (item.frequency === "custom") {
      return shouldShowCustomTask(item, today);
    }

    if (item.frequency === "daily") {
      return !isCompletedToday(item.completions, today);
    }

    if (item.frequency === "weekly") {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      return !item.completions.some(date =>
        isWithinInterval(date, { start: weekStart, end: weekEnd })
      );
    }

    if (item.frequency === "once") {
      return item.completions.length === 0;
    }

    return true;
  });

  const completedTasks = goal.subGoals.filter(item => {
    if (item.frequency === "custom") {
      const progress = getCustomFrequencyProgress(item, today);
      return isCompletedToday(item.completions, today) || progress.achieved;
    }

    if (item.frequency === "daily") {
      return isCompletedToday(item.completions, today);
    }

    if (item.frequency === "weekly") {
      const weekStart = startOfWeek(today, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
      return item.completions.some(date =>
        isWithinInterval(date, { start: weekStart, end: weekEnd })
      );
    }

    if (item.frequency === "once") {
      return item.completions.length > 0;
    }

    return false;
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom', 'left', 'right']}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text }}>{goal.title}</Text>
        {goal.target && <Text style={{ color: theme.textSecondary }}>Target: {goal.target}</Text>}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Consistency", { goalId });
            }}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.primary + "55",
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 9999,
            }}
          >
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.primary + "20",
              }}
            >
              <Ionicons name="analytics-outline" size={14} color={theme.primary} />
            </View>
            <Text style={{ color: theme.text, fontWeight: "700" }}>See Consistency</Text>
            <Ionicons name="arrow-forward" size={14} color={theme.textSecondary} />
          </Pressable>
        </View>

        {/* Pending Tasks Section */}
        <Text style={{ fontWeight: "700", marginTop: 4, color: theme.text }}>Tasks</Text>
        {pendingTasks.length === 0 ? (
          <View style={{
            padding: 20,
            borderRadius: 12,
            backgroundColor: theme.completionCard,
            borderWidth: 1,
            borderColor: theme.completionCardBorder,
            alignItems: "center",
            marginTop: 8
          }}>
            <Text style={{ fontWeight: "700", fontSize: 18, color: theme.success, marginBottom: 4 }}>
              All done for today!
            </Text>
            <Text style={{ color: theme.success, textAlign: "center" }}>
              You're right on track! All tasks completed.
            </Text>
          </View>
        ) : (
          pendingTasks.map((item, index) => (
            <View key={item.id}>
              <Pressable
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  toggleTask(goalId, item.id);
                }}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: theme.border,
                  borderRadius: 10,
                  backgroundColor: theme.surface,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <Text style={{ fontWeight: "700", color: theme.text }}>{item.title}</Text>
                    {item.frequency === "custom" && item.customFrequency ? (() => {
                      const progress = getCustomFrequencyProgress(item, new Date());
                      return (
                        <View style={{ marginTop: 8 }}>
                          <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
                            {progress.completed}/{progress.target} times this {item.customFrequency.type.slice(0, -2)}
                          </Text>
                          <View style={{ flexDirection: "row", gap: 2 }}>
                            {Array.from({ length: progress.target }, (_, progressIndex) => (
                              <View
                                key={progressIndex}
                                style={{
                                  flex: 1,
                                  height: 6,
                                  backgroundColor: progressIndex < progress.completed ? theme.primary : theme.border,
                                  borderRadius: 3,
                                }}
                              />
                            ))}
                          </View>
                          {progress.target > progress.completed && (
                            <Text style={{ color: theme.textSecondary, fontSize: 11, marginTop: 2 }}>
                              {progress.target - progress.completed} more to go
                            </Text>
                          )}
                        </View>
                      );
                    })() : (() => {
                      if (item.frequency === "weekly") {
                        const weekStart = startOfWeek(today, { weekStartsOn: 0 });
                        const weekEnd = endOfWeek(today, { weekStartsOn: 0 });
                        const completedThisWeek = item.completions.some(date =>
                          isWithinInterval(date, { start: weekStart, end: weekEnd })
                        );
                        return (
                          <>
                            <Text style={{ color: theme.textSecondary }}>Frequency: Weekly</Text>
                            <Text style={{ color: theme.textSecondary }}>
                              Done this week: {completedThisWeek ? "Yes" : "No"}
                            </Text>
                          </>
                        );
                      } else if (item.frequency === "daily") {
                        return (
                          <>
                            <Text style={{ color: theme.textSecondary }}>Frequency: Daily</Text>
                            <Text style={{ color: theme.textSecondary }}>Done today: No</Text>
                          </>
                        );
                      } else if (item.frequency === "once") {
                        return (
                          <>
                            <Text style={{ color: theme.textSecondary }}>Frequency: Once</Text>
                            <Text style={{ color: theme.textSecondary }}>Status: Pending</Text>
                          </>
                        );
                      }
                      return (
                        <>
                          <Text style={{ color: theme.textSecondary }}>Frequency: {item.frequency}</Text>
                          <Text style={{ color: theme.textSecondary }}>Status: Pending</Text>
                        </>
                      );
                    })()}
                  </View>
                  <Pressable
                    onPress={() => confirmDeleteTask(item.id, item.title)}
                    hitSlop={8}
                    style={{
                      alignSelf: "center",
                      borderRadius: 9999,
                      paddingHorizontal: 4,
                      paddingVertical: 4,
                      opacity: 0.35
                    }}
                  >
                    <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
                  </Pressable>
                </View>
              </Pressable>
              {index < pendingTasks.length - 1 && <View style={{ height: 8 }} />}
            </View>
          ))
        )}

        {/* Completed Tasks Section */}
        {completedTasks.length > 0 ? (
          <>
            <Text style={{ fontWeight: "700", marginTop: 16, color: theme.textSecondary }}>Completed</Text>
            {completedTasks.map((item, index) => (
              <View key={item.id}>
                <Pressable
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    toggleTask(goalId, item.id);
                  }}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: theme.completedBorder,
                    borderRadius: 10,
                    backgroundColor: theme.completedBackground,
                    opacity: 0.7,
                  }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, paddingRight: 12 }}>
                      <Text style={{ fontWeight: "700", color: theme.textSecondary, textDecorationLine: "line-through" }}>{item.title}</Text>
                      {item.frequency === "custom" && item.customFrequency ? (() => {
                        const progress = getCustomFrequencyProgress(item, new Date());
                        const completedToday = isCompletedToday(item.completions, new Date());
                        return (
                          <View style={{ marginTop: 8 }}>
                            <Text style={{ color: theme.textSecondary, fontSize: 12, marginBottom: 4 }}>
                              {progress.completed}/{progress.target} times this {item.customFrequency.type.slice(0, -2)}
                            </Text>
                            <View style={{ flexDirection: "row", gap: 2 }}>
                              {Array.from({ length: progress.target }, (_, progressIndex) => (
                                <View
                                  key={progressIndex}
                                  style={{
                                    flex: 1,
                                    height: 6,
                                    backgroundColor: progressIndex < progress.completed ? theme.success : theme.border,
                                    borderRadius: 3,
                                  }}
                                />
                              ))}
                            </View>
                            <Text style={{ color: theme.success, fontSize: 11, marginTop: 2 }}>
                              {progress.achieved ? "Goal achieved! ✓" : completedToday ? "Done today ✓" : "Progress made ✓"}
                            </Text>
                          </View>
                        );
                      })() : (() => {
                        if (item.frequency === "weekly") {
                          return (
                            <>
                              <Text style={{ color: theme.textSecondary }}>Frequency: Weekly</Text>
                              <Text style={{ color: theme.success }}>Done this week: Yes ✓</Text>
                            </>
                          );
                        } else if (item.frequency === "daily") {
                          return (
                            <>
                              <Text style={{ color: theme.textSecondary }}>Frequency: Daily</Text>
                              <Text style={{ color: theme.success }}>Done today: Yes ✓</Text>
                            </>
                          );
                        } else if (item.frequency === "once") {
                          return (
                            <>
                              <Text style={{ color: theme.textSecondary }}>Frequency: Once</Text>
                              <Text style={{ color: theme.success }}>Completed ✓</Text>
                            </>
                          );
                        }
                        return (
                          <>
                            <Text style={{ color: theme.textSecondary }}>Frequency: {item.frequency}</Text>
                            <Text style={{ color: theme.success }}>Completed ✓</Text>
                          </>
                        );
                      })()}
                    </View>
                    <Pressable
                      onPress={() => confirmDeleteTask(item.id, item.title)}
                      hitSlop={8}
                      style={{
                        alignSelf: "center",
                        borderRadius: 9999,
                        paddingHorizontal: 4,
                        paddingVertical: 4,
                        opacity: 0.35
                      }}
                    >
                      <Ionicons name="trash-outline" size={16} color={theme.textSecondary} />
                    </Pressable>
                  </View>
                </Pressable>
                {index < completedTasks.length - 1 && <View style={{ height: 8 }} />}
              </View>
            ))}
          </>
        ) : null}

        <Pressable
          onPress={async () => {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setIsEditing(!isEditing);
          }}
          style={{
            backgroundColor: theme.surface,
            borderWidth: 1,
            borderColor: theme.border,
            padding: 12,
            borderRadius: 10,
            marginTop: 8
          }}
        >
          <Text
            style={{
              color: theme.textSecondary,
              textAlign: "center",
              fontWeight: "600"
            }}
          >
            + New Task
          </Text>
        </Pressable>

        <Modal
          animationType="fade"
          transparent={true}
          visible={isEditing}
          onRequestClose={() => setIsEditing(false)}
        >
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              padding: 24,
              backgroundColor: "rgba(15, 23, 42, 0.35)"
            }}
          >
            <Pressable
              onPress={() => setIsEditing(false)}
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
              }}
            />
            <View
              style={{
                borderWidth: 1,
                borderColor: theme.border,
                borderRadius: 16,
                padding: 16,
                gap: 10,
                backgroundColor: theme.surface,
              }}
            >
              <Text style={{ fontWeight: "700", fontSize: 18, color: theme.text }}>New Task</Text>
              <TextInput
                placeholder="e.g., Take creatine"
                value={subTitle}
                onChangeText={setSubTitle}
                style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 10, backgroundColor: theme.background, color: theme.text }}
                placeholderTextColor={theme.textSecondary}
                autoFocus={true}
              />
              <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                {(["once", "daily", "weekly", "custom"] as Frequency[]).map((f) => (
                  <Pressable
                    key={f}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFrequency(f);
                    }}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: frequency === f ? theme.primary : theme.border,
                      backgroundColor: frequency === f ? theme.primary + "20" : "transparent",
                    }}
                  >
                    <Text style={{ fontWeight: "600", color: frequency === f ? theme.primary : theme.text }}>{f}</Text>
                  </Pressable>
                ))}
              </View>

              {frequency === "custom" && (
                <View style={{ gap: 8 }}>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                      placeholder="3"
                      value={customFrequency.target.toString()}
                      onChangeText={(text) => {
                        const num = parseInt(text) || 1;
                        setCustomFrequency(prev => ({ ...prev, target: Math.max(1, num) }));
                      }}
                      keyboardType="numeric"
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 8,
                        padding: 8,
                        backgroundColor: theme.background,
                        color: theme.text,
                        width: 60,
                        textAlign: "center"
                      }}
                      placeholderTextColor={theme.textSecondary}
                    />
                    <Text style={{ color: theme.text, alignSelf: "center" }}>times per</Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(["weekly", "monthly"] as const).map((type) => (
                      <Pressable
                        key={type}
                        onPress={async () => {
                          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          setCustomFrequency(prev => ({ ...prev, type }));
                        }}
                        style={{
                          paddingHorizontal: 12,
                          paddingVertical: 6,
                          borderRadius: 8,
                          borderWidth: 1,
                          borderColor: customFrequency.type === type ? theme.primary : theme.border,
                          backgroundColor: customFrequency.type === type ? theme.primary + "20" : "transparent",
                        }}
                      >
                        <Text style={{ fontWeight: "600", color: customFrequency.type === type ? theme.primary : theme.text }}>
                          {type}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              )}

              <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                <Pressable
                  onPress={() => setIsEditing(false)}
                  style={{
                    flex: 1,
                    backgroundColor: theme.background,
                    borderWidth: 1,
                    borderColor: theme.border,
                    padding: 10,
                    borderRadius: 8
                  }}
                >
                  <Text style={{ color: theme.textSecondary, textAlign: "center", fontWeight: "600" }}>Cancel</Text>
                </Pressable>
                <Pressable
                  onPress={async () => {
                    if (subTitle.trim()) {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      addSubGoal(
                        goalId,
                        subTitle.trim(),
                        frequency,
                        frequency === "custom" ? customFrequency : undefined
                      );
                      setSubTitle("");
                      setIsEditing(false);
                    }
                  }}
                  style={{ flex: 1, backgroundColor: theme.primary, padding: 10, borderRadius: 8 }}
                >
                  <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Add</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
