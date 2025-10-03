import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStore } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import { format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

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
  const toggleTask = useStore((s) => s.toggleTaskCompletion);
  const deleteGoal = useStore((s) => s.deleteGoal);
  const { theme } = useTheme();

  const [subTitle, setSubTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState<"once" | "daily" | "weekly">("daily");
  const [isEditing, setIsEditing] = React.useState(false);

  if (!goal) return <Text>Not found</Text>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800", color: theme.text }}>{goal.title}</Text>
        {goal.target && <Text style={{ color: theme.textSecondary }}>Target: {goal.target}</Text>}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("Consistency", { goalId });
            }}
            style={{
              backgroundColor: "#3b82f6",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 9999, // pill
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>See Consistency</Text>
          </Pressable>

          <Pressable
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              setIsEditing(!isEditing);
            }}
            style={{
              backgroundColor: theme.textSecondary,
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 9999, // pill
            }}
          >
            <Text style={{ color: theme.background, fontWeight: "700" }}>{isEditing ? "Finish Editing" : "Edit"}</Text>
          </Pressable>
        </View>

        {isEditing && (
          <View style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 12, gap: 8, backgroundColor: theme.surface }}>
          <Text style={{ fontWeight: "700", color: theme.text }}>Add sub-goal / task</Text>
          <TextInput
            placeholder="e.g., Take creatine"
            value={subTitle}
            onChangeText={setSubTitle}
            style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 8, padding: 8, backgroundColor: theme.background, color: theme.text }}
            placeholderTextColor={theme.textSecondary}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["once", "daily", "weekly"].map((f) => (
              <Pressable
                key={f}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setFrequency(f as any);
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
          <Pressable
            onPress={async () => {
              if (subTitle.trim()) {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                addSubGoal(goalId, subTitle.trim(), frequency);
                setSubTitle("");
              }
            }}
            style={{ backgroundColor: theme.primary, padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Add</Text>
          </Pressable>
          
          {/* Delete Goal Button - Only visible when editing */}
          <Pressable
            onPress={() => {
              Alert.alert(
                "Delete goal?",
                `This will remove "${goal.title}" and all its sub-goals.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete", style: "destructive", onPress: async () => {
                      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      deleteGoal(goal.id);
                      // after delete, pop back to Home
                      navigation.goBack();
                    }
                  },
                ]
              );
            }}
            style={{
              backgroundColor: theme.danger,
              padding: 10,
              borderRadius: 8,
              marginTop: 8
            }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Delete Goal</Text>
          </Pressable>
        </View>
        )}

        {/* Pending Tasks Section */}
        <Text style={{ fontWeight: "700", marginTop: 4, color: theme.text }}>Tasks</Text>
        {(() => {
          const today = new Date();
          const pendingTasks = goal.subGoals.filter(item => 
            !item.completions.some(date => 
              format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
            )
          );
          
          if (pendingTasks.length === 0) {
            return (
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
            );
          }
          
          return (
            <FlatList
              data={pendingTasks}
              keyExtractor={(t) => t.id}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
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
                  <Text style={{ fontWeight: "700", color: theme.text }}>{item.title}</Text>
                  <Text style={{ color: theme.textSecondary }}>Frequency: {item.frequency}</Text>
                  <Text style={{ color: theme.textSecondary }}>Done today: No</Text>
                </Pressable>
              )}
            />
          );
        })()}

        {/* Completed Tasks Section */}
        {goal.subGoals.filter(item => {
          const today = new Date();
          return item.completions.some(date => 
            format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
          );
        }).length > 0 && (
          <>
            <Text style={{ fontWeight: "700", marginTop: 16, color: theme.textSecondary }}>Completed Today</Text>
            <FlatList
              data={goal.subGoals.filter(item => {
                const today = new Date();
                return item.completions.some(date => 
                  format(date, "yyyy-MM-dd") === format(today, "yyyy-MM-dd")
                );
              })}
              keyExtractor={(t) => t.id}
              ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
              renderItem={({ item }) => (
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
                  <Text style={{ fontWeight: "700", color: theme.textSecondary, textDecorationLine: "line-through" }}>{item.title}</Text>
                  <Text style={{ color: theme.textSecondary }}>Frequency: {item.frequency}</Text>
                  <Text style={{ color: theme.success }}>Done today: Yes ✓</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
