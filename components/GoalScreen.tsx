import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStore } from "../store";
import { format } from "date-fns";
import { useThemeColors, type ThemeColors } from "../theme";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type GoalProps = NativeStackScreenProps<RootStackParamList, "Goal">;

type TaskCardProps = {
  item: {
    id: string;
    title: string;
    frequency: "once" | "daily" | "weekly";
  };
  completed: boolean;
  onToggle: () => void;
  onDelete: () => void;
  colors: ThemeColors;
};

const TaskCard = ({ item, completed, onToggle, onDelete, colors }: TaskCardProps) => (
  <Pressable
    onPress={onToggle}
    onLongPress={onDelete}
    delayLongPress={300}
    style={{
      padding: 12,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      backgroundColor: completed ? colors.surfaceMuted : colors.surface,
      opacity: completed ? 0.85 : 1,
      gap: 4,
    }}
  >
    <Text
      style={{
        fontWeight: "700",
        color: completed ? colors.textMuted : colors.text,
        textDecorationLine: completed ? "line-through" : "none",
      }}
    >
      {item.title}
    </Text>
    <Text style={{ color: colors.textMuted }}>
      Frequency: {item.frequency}
    </Text>
    <Text style={{ color: completed ? colors.success : colors.textMuted }}>
      Done today: {completed ? "Yes" : "No"}
    </Text>
  </Pressable>
);

export default function GoalScreen({ navigation, route }: GoalProps) {
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);
  const addSubGoal = useStore((s) => s.addSubGoal);
  const toggleTask = useStore((s) => s.toggleTaskCompletion);
  const deleteSubGoal = useStore((s) => s.deleteSubGoal);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const colors = useThemeColors();

  const [subTitle, setSubTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState<"once" | "daily" | "weekly">("daily");
  const [isEditing, setIsEditing] = React.useState(false);

  const longPressTriggeredRef = React.useRef(false);

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const pendingTasks = goal?.subGoals.filter(
    (item) => !item.completions.some((date) => format(date, "yyyy-MM-dd") === todayKey)
  ) ?? [];
  const completedToday = goal?.subGoals.filter((item) =>
    item.completions.some((date) => format(date, "yyyy-MM-dd") === todayKey)
  ) ?? [];

  const handleSubGoalPress = React.useCallback(
    async (subId: string) => {
      if (longPressTriggeredRef.current) {
        longPressTriggeredRef.current = false;
        return;
      }
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      toggleTask(goalId, subId);
    },
    [goalId, toggleTask]
  );

  const handleSubGoalLongPress = React.useCallback(
    (subId: string, title: string) => {
      longPressTriggeredRef.current = true;
      void Haptics.selectionAsync();
      Alert.alert(
        "Delete task?",
        `This will remove "${title}" from your goal.`,
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => {
              longPressTriggeredRef.current = false;
            },
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              longPressTriggeredRef.current = false;
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              deleteSubGoal(goalId, subId);
            },
          },
        ],
        { cancelable: true }
      );
    },
    [deleteSubGoal, goalId]
  );

  if (!goal) {
    return (
      <SafeAreaView
        style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}
        edges={['bottom', 'left', 'right']}
      >
        <Text style={{ color: colors.text }}>Not found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 16, backgroundColor: colors.background, flex: 1 }}>
        <View style={{ gap: 6 }}>
          <Text style={{ fontSize: 22, fontWeight: "800", color: colors.text }}>{goal.title}</Text>
          {goal.target && <Text style={{ color: colors.textMuted }}>Target: {goal.target}</Text>}
        </View>

        <View style={{ flexDirection: "row", gap: 10, flexWrap: "wrap" }}>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Consistency", { goalId });
            }}
            style={{
              backgroundColor: colors.accent,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: colors.buttonText, fontWeight: "700" }}>See Consistency</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsEditing((prev) => !prev);
            }}
            style={{
              backgroundColor: colors.button,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 9999,
            }}
          >
            <Text style={{ color: colors.buttonText, fontWeight: "700" }}>
              {isEditing ? "Finish Editing" : "Edit"}
            </Text>
          </Pressable>
        </View>

        {isEditing && (
          <View
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 12,
              padding: 12,
              gap: 10,
              backgroundColor: colors.surface,
            }}
          >
            <Text style={{ fontWeight: "700", color: colors.text }}>Add sub-goal / task</Text>
            <TextInput
              placeholder="e.g., Take creatine"
              placeholderTextColor={colors.textMuted}
              value={subTitle}
              onChangeText={setSubTitle}
              style={{
                borderWidth: 1,
                borderColor: colors.inputBorder,
                backgroundColor: colors.inputBackground,
                borderRadius: 10,
                padding: 10,
                color: colors.text,
              }}
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              {["once", "daily", "weekly"].map((f) => {
                const selected = frequency === f;
                return (
                  <Pressable
                    key={f}
                    onPress={async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setFrequency(f as typeof frequency);
                    }}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 10,
                      borderWidth: 1,
                      borderColor: selected ? colors.accent : colors.border,
                      backgroundColor: selected ? colors.surfaceMuted : colors.surface,
                    }}
                  >
                    <Text
                      style={{
                        fontWeight: "600",
                        color: selected ? colors.accent : colors.text,
                        textTransform: "capitalize",
                      }}
                    >
                      {f}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Pressable
              onPress={async () => {
                if (!subTitle.trim()) return;
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                addSubGoal(goalId, subTitle.trim(), frequency);
                setSubTitle("");
              }}
              style={{ backgroundColor: colors.button, padding: 12, borderRadius: 10 }}
            >
              <Text style={{ color: colors.buttonText, textAlign: "center", fontWeight: "700" }}>Add</Text>
            </Pressable>

            <Pressable
              onPress={() => {
                Alert.alert(
                  "Delete goal?",
                  `This will remove "${goal.title}" and all its sub-goals.`,
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        deleteGoal(goal.id);
                        navigation.goBack();
                      },
                    },
                  ]
                );
              }}
              style={{
                backgroundColor: colors.danger,
                padding: 12,
                borderRadius: 10,
                marginTop: 4,
              }}
            >
              <Text style={{ color: colors.dangerText, textAlign: "center", fontWeight: "700" }}>
                Delete Goal
              </Text>
            </Pressable>
          </View>
        )}

        <View style={{ flex: 1, gap: 16 }}>
          <View>
            <Text style={{ fontWeight: "700", color: colors.text }}>Tasks</Text>
            {pendingTasks.length === 0 ? (
              <View
                style={{
                  padding: 20,
                  borderRadius: 12,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: "center",
                  marginTop: 10,
                  gap: 4,
                }}
              >
                <Text style={{ fontWeight: "700", fontSize: 18, color: colors.success }}>
                  All done for today!
                </Text>
                <Text style={{ color: colors.textMuted, textAlign: "center" }}>
                  You are on track. Everything is checked off.
                </Text>
              </View>
            ) : (
              <FlatList
                data={pendingTasks}
                keyExtractor={(t) => t.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                  <TaskCard
                    item={item}
                    completed={false}
                    onToggle={() => {
                      void handleSubGoalPress(item.id);
                    }}
                    onDelete={() => handleSubGoalLongPress(item.id, item.title)}
                    colors={colors}
                  />
                )}
              />
            )}
          </View>

          {completedToday.length > 0 && (
            <View style={{ gap: 10 }}>
              <Text style={{ fontWeight: "700", color: colors.textMuted }}>Completed Today</Text>
              <FlatList
                data={completedToday}
                keyExtractor={(t) => t.id}
                ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
                renderItem={({ item }) => (
                  <TaskCard
                    item={item}
                    completed
                    onToggle={() => {
                      void handleSubGoalPress(item.id);
                    }}
                    onDelete={() => handleSubGoalLongPress(item.id, item.title)}
                    colors={colors}
                  />
                )}
              />
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
