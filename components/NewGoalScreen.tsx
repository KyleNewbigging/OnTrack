import React from "react";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Text, View, Pressable, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { useStore } from "../store";
import { useThemeColors } from "../theme";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

type NewGoalProps = NativeStackScreenProps<RootStackParamList, "NewGoal">;

export default function NewGoalScreen({ navigation }: NewGoalProps) {
  const addGoal = useStore((s) => s.addGoal);
  const colors = useThemeColors();
  const [title, setTitle] = React.useState("");
  const [target, setTarget] = React.useState("");
  const isReady = title.trim().length > 0;
  const ctaTextColor = isReady ? colors.buttonText : colors.textMuted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom', 'left', 'right']}>
      <View style={{ padding: 16, gap: 16, backgroundColor: colors.background }}>
        <View>
          <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>Goal Title</Text>
          <TextInput
            placeholder="e.g., Fitness"
            placeholderTextColor={colors.textMuted}
            value={title}
            onChangeText={setTitle}
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
            }}
          />
        </View>

        <View>
          <Text style={{ fontWeight: "700", fontSize: 16, color: colors.text }}>Target (optional)</Text>
          <TextInput
            placeholder="e.g., 200 lbs, 10% BF"
            placeholderTextColor={colors.textMuted}
            value={target}
            onChangeText={setTarget}
            style={{
              borderWidth: 1,
              borderColor: colors.inputBorder,
              backgroundColor: colors.inputBackground,
              borderRadius: 10,
              padding: 12,
              color: colors.text,
            }}
          />
        </View>

        <Pressable
          onPress={async () => {
            if (!isReady) return;
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            addGoal(title.trim(), target.trim() || undefined);
            navigation.goBack();
          }}
          style={{
            backgroundColor: isReady ? colors.button : colors.border,
            padding: 14,
            borderRadius: 12,
            opacity: isReady ? 1 : 0.7,
          }}
        >
          <Text style={{ color: ctaTextColor, textAlign: "center", fontWeight: "700" }}>
            Create Goal
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
