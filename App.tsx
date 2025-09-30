import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import HomeScreen from "./components/HomeScreen";
import GoalScreen from "./components/GoalScreen";
import NewGoalScreen from "./components/NewGoalScreen";
import OverviewScreen from "./components/OverviewScreen";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Overview: { goalId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();


export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: "OnTrack" }} />
        <Stack.Screen name="Goal" component={GoalScreen} options={{ title: "Goal" }} />
        <Stack.Screen name="NewGoal" component={NewGoalScreen} options={{ title: "New Goal" }} />
        <Stack.Screen name="Overview" component={OverviewScreen} options={{ title: "Overview" }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}