import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "../store";
import { useTheme } from "../contexts/ThemeContext";
import { haptics } from "../utils/haptics";
import LabeledTextField from "./LabeledTextField";

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
  const [titleError, setTitleError] = React.useState("");
  const { theme } = useTheme();

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);

    if (nextTitle.trim()) {
      setTitleError("");
    }
  };

  const handleCreateGoal = () => {
    if (title.trim()) {
      void haptics.success();
      addGoal(title.trim(), target.trim() || undefined);
      navigation.goBack();
      return;
    }

    setTitleError("Enter a goal title.");
    void haptics.error();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom", "left", "right"]}>
      <View style={{ padding: 16, gap: 12 }}>
        <LabeledTextField
          label="Goal Title"
          placeholder="e.g., Fitness"
          value={title}
          onChangeText={handleTitleChange}
          errorText={titleError || undefined}
          returnKeyType="done"
          onSubmitEditing={handleCreateGoal}
        />

        <LabeledTextField
          label="Target (optional)"
          placeholder="e.g., 200 lbs, 10% BF"
          value={target}
          onChangeText={setTarget}
        />

        <Pressable
          onPress={handleCreateGoal}
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
