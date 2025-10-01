import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput, FlatList, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store";
import { format } from "date-fns";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Overview: { goalId: string };
};

type GoalProps = NativeStackScreenProps<RootStackParamList, "Goal">;

export default function GoalScreen({ navigation, route }: GoalProps) {
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);
  const addSubGoal = useStore((s) => s.addSubGoal);
  const toggleTask = useStore((s) => s.toggleTaskCompletion);
  const deleteGoal = useStore((s) => s.deleteGoal);

  const [subTitle, setSubTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState<"once" | "daily" | "weekly">("daily");
  const [isEditing, setIsEditing] = React.useState(false);

  if (!goal) return <Text>Not found</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>{goal.title}</Text>
        {goal.target && <Text style={{ color: "#374151" }}>Target: {goal.target}</Text>}
        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
          <Pressable
            onPress={() => navigation.navigate("Overview", { goalId })}
            style={{
              backgroundColor: "#3b82f6",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 9999, // pill
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Overview</Text>
          </Pressable>

          <Pressable
            onPress={() => setIsEditing(!isEditing)}
            style={{
              backgroundColor: "#111827",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 9999, // pill
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>{isEditing ? "Cancel" : "Edit"}</Text>
          </Pressable>
          
          <Pressable
            onPress={() => {
              Alert.alert(
                "Delete goal?",
                `This will remove "${goal.title}" and all its sub-goals.`,
                [
                  { text: "Cancel", style: "cancel" },
                  {
                    text: "Delete", style: "destructive", onPress: () => {
                      deleteGoal(goal.id);
                      // after delete, pop back to Home
                      navigation.goBack();
                    }
                  },
                ]
              );
            }}
            style={{
              backgroundColor: "#ef4444",
              paddingVertical: 8,
              paddingHorizontal: 14,
              borderRadius: 9999, // pill
            }}
          >
            <Text style={{ color: "white", fontWeight: "700" }}>Delete</Text>
          </Pressable>
        </View>

        {isEditing && (
          <View style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, gap: 8 }}>
          <Text style={{ fontWeight: "700" }}>Add sub-goal / task</Text>
          <TextInput
            placeholder="e.g., Take creatine"
            value={subTitle}
            onChangeText={setSubTitle}
            style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8, padding: 8 }}
          />
          <View style={{ flexDirection: "row", gap: 8 }}>
            {["once", "daily", "weekly"].map((f) => (
              <Pressable
                key={f}
                onPress={() => setFrequency(f as any)}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: frequency === f ? "#111827" : "#e5e7eb",
                }}
              >
                <Text style={{ fontWeight: "600" }}>{f}</Text>
              </Pressable>
            ))}
          </View>
          <Pressable
            onPress={() => {
              if (subTitle.trim()) {
                addSubGoal(goalId, subTitle.trim(), frequency);
                setSubTitle("");
              }
            }}
            style={{ backgroundColor: "#111827", padding: 10, borderRadius: 8 }}
          >
            <Text style={{ color: "white", textAlign: "center", fontWeight: "700" }}>Add</Text>
          </Pressable>
        </View>
        )}

        {/* Pending Tasks Section */}
        <Text style={{ fontWeight: "700", marginTop: 4 }}>Tasks</Text>
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
                backgroundColor: "#f0fdf4",
                borderWidth: 1,
                borderColor: "#bbf7d0",
                alignItems: "center",
                marginTop: 8
              }}>
                <Text style={{ fontWeight: "700", fontSize: 18, color: "#166534", marginBottom: 4 }}>
                  All done for today!
                </Text>
                <Text style={{ color: "#16a34a", textAlign: "center" }}>
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
                  onPress={() => toggleTask(goalId, item.id)}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#e5e7eb",
                    borderRadius: 10,
                    backgroundColor: "white",
                  }}
                >
                  <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                  <Text style={{ color: "#6b7280" }}>Frequency: {item.frequency}</Text>
                  <Text style={{ color: "#6b7280" }}>Done today: No</Text>
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
            <Text style={{ fontWeight: "700", marginTop: 16, color: "#6b7280" }}>Completed Today</Text>
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
                  onPress={() => toggleTask(goalId, item.id)}
                  style={{
                    padding: 12,
                    borderWidth: 1,
                    borderColor: "#d1d5db",
                    borderRadius: 10,
                    backgroundColor: "#f9fafb",
                    opacity: 0.7,
                  }}
                >
                  <Text style={{ fontWeight: "700", color: "#6b7280", textDecorationLine: "line-through" }}>{item.title}</Text>
                  <Text style={{ color: "#9ca3af" }}>Frequency: {item.frequency}</Text>
                  <Text style={{ color: "#10b981" }}>Done today: Yes ✓</Text>
                </Pressable>
              )}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
