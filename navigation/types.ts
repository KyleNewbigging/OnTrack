import type { NativeStackScreenProps } from "@react-navigation/native-stack";

export type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
  Privacy: undefined;
  Instructions: undefined;
};

export type RootStackScreenProps<Screen extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, Screen>;
