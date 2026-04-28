import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import HomeScreen from "./components/HomeScreen";
import GoalScreen from "./components/GoalScreen";
import NewGoalScreen from "./components/NewGoalScreen";
import OverviewScreen from "./components/OverviewScreen";
import PrivacyScreen from "./components/PrivacyScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import type { RootStackParamList } from "./navigation/types";

const Stack = createNativeStackNavigator<RootStackParamList>();

function ThemedNavigation() {
  const { theme, isDark } = useTheme();
  
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.surface,
          },
          headerTintColor: theme.text,
          headerTitleStyle: {
            color: theme.text,
          },
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "OnTrack" }} />
        <Stack.Screen name="Goal" component={GoalScreen} options={{ title: "Goal" }} />
        <Stack.Screen name="NewGoal" component={NewGoalScreen} options={{ title: "New Goal" }} />
        <Stack.Screen name="Consistency" component={OverviewScreen} options={{ title: "Consistency" }} />
        <Stack.Screen name="Instructions" component={InstructionsScreen} options={{ title: "How It Works" }} />
        <Stack.Screen name="Privacy" component={PrivacyScreen} options={{ title: "Privacy & Data" }} />
      </Stack.Navigator>
      <StatusBar style={isDark ? "light" : "dark"} />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <ThemedNavigation />
      </SafeAreaProvider>
    </ThemeProvider>
  );
}
