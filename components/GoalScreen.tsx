import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput, ScrollView, Modal, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStore, getCustomFrequencyProgress, shouldShowCustomTask } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";
import { Frequency, CustomFrequency } from "../types";
import { haptics } from "../utils/haptics";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type GoalProps = NativeStackScreenProps<RootStackParamList, "Goal">;

export default function GoalScreen({ navigation, route }: GoalProps) {
  const MAX_WEEKLY_CUSTOM_TARGET = 7;
  const MAX_MONTHLY_CUSTOM_TARGET = 31;
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);
  const addSubGoal = useStore((s) => s.addSubGoal);
  const updateGoal = useStore((s) => s.updateGoal);
  const deleteSubGoal = useStore((s) => s.deleteSubGoal);
  const toggleTask = useStore((s) => s.toggleTaskCompletion);
  const { theme } = useTheme();

  const [subTitle, setSubTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState<Frequency>("daily");
  const [customFrequency, setCustomFrequency] = React.useState<CustomFrequency>({ type: "weekly", target: 3 });
  const [isEditing, setIsEditing] = React.useState(false);
  const [isEditingGoalTitle, setIsEditingGoalTitle] = React.useState(false);
  const [goalTitleDraft, setGoalTitleDraft] = React.useState(goal.title);

  if (!goal) return <Text>Not found</Text>;

  React.useEffect(() => {
    if (!isEditingGoalTitle) {
      setGoalTitleDraft(goal.title);
    }
  }, [goal.title, isEditingGoalTitle]);

  const saveGoalTitle = () => {
    const trimmedTitle = goalTitleDraft.trim();

    if (!trimmedTitle) {
      void haptics.error();
      return;
    }

    updateGoal(goalId, { title: trimmedTitle });
    void haptics.success();
    setIsEditingGoalTitle(false);
  };

  const isCompletedToday = (dates: Date[], referenceDate: Date) =>
    dates.some(date => format(date, "yyyy-MM-dd") === format(referenceDate, "yyyy-MM-dd"));

  const getMaxCustomTarget = (type: CustomFrequency["type"]) =>
    type === "weekly" ? MAX_WEEKLY_CUSTOM_TARGET : MAX_MONTHLY_CUSTOM_TARGET;

  const normalizeCustomTarget = (target: number, type: CustomFrequency["type"]) =>
    Math.min(getMaxCustomTarget(type), Math.max(1, target));

  const adjustCustomTarget = (delta: number) => {
    const nextTarget = normalizeCustomTarget(customFrequency.target + delta, customFrequency.type);

    if (nextTarget === customFrequency.target) {
      void haptics.warning();
      return;
    }

    void haptics.toggle();
    setCustomFrequency((prev) => ({ ...prev, target: nextTarget }));
  };

  const confirmDeleteTask = (taskId: string, taskTitle: string) => {
    void haptics.warning();
    Alert.alert(
      "Delete task?",
      `This will remove "${taskTitle}" from this goal.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            void haptics.destructive();
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
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {isEditingGoalTitle ? (
            <>
              <TextInput
                value={goalTitleDraft}
                onChangeText={setGoalTitleDraft}
                style={{
                  flex: 1,
                  fontSize: 22,
                  fontWeight: "800",
                  color: theme.text,
                  borderWidth: 1,
                  borderColor: theme.primary,
                  borderRadius: 10,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: theme.surface,
                }}
                placeholder="Goal name"
                placeholderTextColor={theme.textSecondary}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={saveGoalTitle}
              />
              <Pressable
                onPress={saveGoalTitle}
                hitSlop={8}
                style={{ padding: 6 }}
              >
                <Ionicons name="checkmark-outline" size={20} color={theme.primary} />
              </Pressable>
              <Pressable
                onPress={() => {
                  void haptics.tap();
                  setGoalTitleDraft(goal.title);
                  setIsEditingGoalTitle(false);
                }}
                hitSlop={8}
                style={{ padding: 6 }}
              >
                <Ionicons name="close-outline" size={20} color={theme.textSecondary} />
              </Pressable>
            </>
          ) : (
            <>
              <Text style={{ flex: 1, fontSize: 22, fontWeight: "800", color: theme.text }}>{goal.title}</Text>
              <Pressable
                onPress={() => {
                  void haptics.tap();
                  setGoalTitleDraft(goal.title);
                  setIsEditingGoalTitle(true);
                }}
                hitSlop={8}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: theme.surface,
                  borderWidth: 1,
                  borderColor: theme.border,
                }}
              >
                <Ionicons name="create-outline" size={16} color={theme.textSecondary} />
              </Pressable>
            </>
          )}
        </View>
        {goal.target && <Text style={{ color: theme.textSecondary }}>Target: {goal.target}</Text>}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={() => {
              void haptics.navigate();
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
                onPress={() => {
                  void haptics.success();
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
                  onPress={() => {
                    void haptics.tap();
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
          onPress={() => {
            void haptics.tap();
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
          onRequestClose={() => {
            void haptics.tap();
            setIsEditing(false);
          }}
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
              onPress={() => {
                void haptics.tap();
                setIsEditing(false);
              }}
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
                    onPress={() => {
                      void haptics.toggle();
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
                  <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
                    <Pressable
                      onPress={() => {
                        adjustCustomTarget(-1);
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 8,
                        padding: 8,
                        backgroundColor: theme.background,
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Ionicons name="remove" size={18} color={theme.text} />
                    </Pressable>
                    <View
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 8,
                        paddingHorizontal: 16,
                        paddingVertical: 10,
                        backgroundColor: theme.background,
                        minWidth: 84,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Text style={{ color: theme.text, fontWeight: "700", fontSize: 16 }}>
                        {customFrequency.target}
                      </Text>
                    </View>
                    <Pressable
                      onPress={() => {
                        adjustCustomTarget(1);
                      }}
                      style={{
                        borderWidth: 1,
                        borderColor: theme.border,
                        borderRadius: 8,
                        padding: 8,
                        backgroundColor: theme.background,
                        width: 44,
                        height: 44,
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      <Ionicons name="add" size={18} color={theme.text} />
                    </Pressable>
                    <Text style={{ color: theme.text, alignSelf: "center" }}>times per</Text>
                  </View>

                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {(["weekly", "monthly"] as const).map((type) => (
                      <Pressable
                        key={type}
                        onPress={() => {
                          void haptics.toggle();
                          const normalizedTarget = normalizeCustomTarget(customFrequency.target, type);
                          setCustomFrequency(prev => ({ ...prev, type, target: normalizedTarget }));
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
                  onPress={() => {
                    void haptics.tap();
                    setIsEditing(false);
                  }}
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
                  onPress={() => {
                    if (subTitle.trim()) {
                      void haptics.success();
                      addSubGoal(
                        goalId,
                        subTitle.trim(),
                        frequency,
                        frequency === "custom"
                          ? {
                              ...customFrequency,
                              target: normalizeCustomTarget(customFrequency.target, customFrequency.type),
                            }
                          : undefined
                      );
                      setSubTitle("");
                      setIsEditing(false);
                      return;
                    }

                    void haptics.error();
                  }}
                  style={{ flex: 1, backgroundColor: theme.primary, padding: 10, borderRadius: 8 }}
                >
                  <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Add</Text>
                </Pressable>
              </View>
              {frequency === "custom" ? (
                <Text style={{ color: theme.textSecondary, fontSize: 12 }}>
                  {customFrequency.type === "weekly"
                    ? `Choose from 1 to ${MAX_WEEKLY_CUSTOM_TARGET} times per week.`
                    : `Choose from 1 to ${MAX_MONTHLY_CUSTOM_TARGET} times per month.`}
                </Text>
              ) : null}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </SafeAreaView>
  );
}
