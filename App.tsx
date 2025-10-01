import React from "react";
import { NavigationContainer, DefaultTheme, DarkTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import HomeScreen from "./components/HomeScreen";
import GoalScreen from "./components/GoalScreen";
import NewGoalScreen from "./components/NewGoalScreen";
import OverviewScreen from "./components/OverviewScreen";
import { useStore } from "./store";
import { useThemeColors } from "./theme";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const themeName = useStore((s) => s.theme);
  const colors = useThemeColors();

  const navigationTheme = React.useMemo(() => {
    const base = themeName === "dark" ? DarkTheme : DefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        background: colors.background,
        card: colors.surface,
        text: colors.text,
        border: colors.border,
        primary: colors.accent,
      },
    };
  }, [themeName, colors]);

  const statusBarStyle = themeName === "dark" ? "light" : "dark";

  return (
    <SafeAreaProvider>
      <NavigationContainer theme={navigationTheme}>
        <Stack.Navigator>
          <Stack.Screen name="Home" component={HomeScreen} options={{ title: "OnTrack" }} />
          <Stack.Screen name="Goal" component={GoalScreen} options={{ title: "Goal" }} />
          <Stack.Screen name="NewGoal" component={NewGoalScreen} options={{ title: "New Goal" }} />
          <Stack.Screen name="Consistency" component={OverviewScreen} options={{ title: "Consistency" }} />
        </Stack.Navigator>
        <StatusBar style={statusBarStyle} />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
