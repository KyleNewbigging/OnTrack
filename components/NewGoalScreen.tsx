import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Overview: { goalId: string };
};

type NewGoalProps = NativeStackScreenProps<RootStackParamList, "NewGoal">;

export default function NewGoalScreen({ navigation }: NewGoalProps) {
  const addGoal = useStore((s) => s.addGoal);
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState("");

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom', 'left', 'right']}>
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
