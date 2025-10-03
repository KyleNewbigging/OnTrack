import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStore } from "../store";
import { useTheme } from "../contexts/ThemeContext";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type NewGoalProps = NativeStackScreenProps<RootStackParamList, "NewGoal">;

export default function NewGoalScreen({ navigation }: NewGoalProps) {
  const addGoal = useStore((s) => s.addGoal);
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState("");
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 12 }}>
        {/* Label + Input for Goal Title */}
        <Text style={{ fontWeight: "700", fontSize: 16, color: theme.text }}>Goal Title</Text>
        <TextInput
          placeholder="e.g., Fitness"
          value={title}
          onChangeText={setTitle}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            padding: 10,
            backgroundColor: theme.surface,
            color: theme.text
          }}
          placeholderTextColor={theme.textSecondary}
        />

        {/* Label + Input for Target */}
        <Text style={{ fontWeight: "700", fontSize: 16, color: theme.text }}>Target (optional)</Text>
        <TextInput
          placeholder="e.g., 200 lbs, 10% BF"
          value={target}
          onChangeText={setTarget}
          style={{
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 8,
            padding: 10,
            backgroundColor: theme.surface,
            color: theme.text
          }}
          placeholderTextColor={theme.textSecondary}
        />

        <Pressable
          onPress={async () => {
            if (title.trim()) {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              addGoal(title.trim(), target.trim() || undefined);
              navigation.goBack();
            }
          }}
          style={{ backgroundColor: theme.primary, padding: 12, borderRadius: 10 }}
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
