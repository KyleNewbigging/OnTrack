import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, NativeStackScreenProps } from "@react-navigation/native-stack";
import { SafeAreaView, Text, View, Pressable, TextInput, FlatList } from "react-native";
import { useStore } from "./store";
import { StatusBar } from "expo-status-bar";
import { format } from "date-fns";
import { Alert } from "react-native";


import Heatmap from "./components/Heatmap";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

type HomeProps = NativeStackScreenProps<RootStackParamList, "Home">;
type GoalProps = NativeStackScreenProps<RootStackParamList, "Goal">;
type NewGoalProps = NativeStackScreenProps<RootStackParamList, "NewGoal">;


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "OnTrack" }} />
        <Stack.Screen name="Goal" component={GoalScreen} options={{ title: "Goal" }} />
        <Stack.Screen name="NewGoal" component={NewGoalScreen} options={{ title: "New Goal" }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

function HomeScreen({ navigation }: HomeProps) {
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

function GoalScreen({ navigation, route }: GoalProps) {
  const { goalId } = route.params;
  const goal = useStore((s) => s.goals.find((g) => g.id === goalId)!);
  const addSubGoal = useStore((s) => s.addSubGoal);
  const toggleTask = useStore((s) => s.toggleTaskCompletion);
  const deleteGoal = useStore((s) => s.deleteGoal);

  const [subTitle, setSubTitle] = React.useState("");
  const [frequency, setFrequency] = React.useState<"once" | "daily" | "weekly">("daily");

  if (!goal) return <Text>Not found</Text>;

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12 }}>
        <Text style={{ fontSize: 22, fontWeight: "800" }}>{goal.title}</Text>
        {goal.target && <Text style={{ color: "#374151" }}>Target: {goal.target}</Text>}
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
            alignSelf: "flex-start",
            backgroundColor: "#ef4444",
            paddingVertical: 8,
            paddingHorizontal: 14,
            borderRadius: 9999, // pill
          }}
        >
          <Text style={{ color: "white", fontWeight: "700" }}>Delete</Text>
        </Pressable>

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

        <Text style={{ fontWeight: "700", marginTop: 4 }}>Tasks</Text>
        <FlatList
          data={goal.subGoals}
          keyExtractor={(t) => t.id}
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
          renderItem={({ item }) => {
            const today = format(new Date(), "yyyy-MM-dd");
            const isDone = item.completions.includes(today);
            return (
              <Pressable
                onPress={() => toggleTask(goalId, item.id)}
                style={{
                  padding: 12,
                  borderWidth: 1,
                  borderColor: isDone ? "#10b981" : "#e5e7eb",
                  borderRadius: 10,
                  backgroundColor: isDone ? "#ecfdf5" : "white",
                }}
              >
                <Text style={{ fontWeight: "700" }}>{item.title}</Text>
                <Text style={{ color: "#6b7280" }}>Frequency: {item.frequency}</Text>
                <Text style={{ color: "#6b7280" }}>Done today: {isDone ? "Yes" : "No"}</Text>
              </Pressable>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

function NewGoalScreen({ navigation }: NewGoalProps) {
  const addGoal = useStore((s) => s.addGoal);
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState("");

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 12 }}>
        {/* Label + Input for Goal Title */}
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Goal Title</Text>
        <TextInput
          placeholder="e.g., Fitness"
          value={title}
          onChangeText={setTitle}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 8,
            padding: 10,
          }}
        />

        {/* Label + Input for Target */}
        <Text style={{ fontWeight: "700", fontSize: 16 }}>Target (optional)</Text>
        <TextInput
          placeholder="e.g., 200 lbs, 10% BF"
          value={target}
          onChangeText={setTarget}
          style={{
            borderWidth: 1,
            borderColor: "#e5e7eb",
            borderRadius: 8,
            padding: 10,
          }}
        />

        <Pressable
          onPress={() => {
            if (title.trim()) {
              addGoal(title.trim(), target.trim() || undefined);
              navigation.goBack();
            }
          }}
          style={{ backgroundColor: "#111827", padding: 12, borderRadius: 10 }}
        >
          <Text
            style={{ color: "white", textAlign: "center", fontWeight: "700" }}
          >
            Create Goal
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}