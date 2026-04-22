import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import HomeScreen from "./components/HomeScreen";
import GoalScreen from "./components/GoalScreen";
import NewGoalScreen from "./components/NewGoalScreen";
import OverviewScreen from "./components/OverviewScreen";
import PrivacyScreen from "./components/PrivacyScreen";
import InstructionsScreen from "./components/InstructionsScreen";
import IntroductionWizard from "./components/IntroductionWizard";
import { useStore } from "./store";

type RootStackParamList = {
  Home: undefined;
  Goal: { goalId: string };
  NewGoal: undefined;
  Consistency: { goalId: string };
  Privacy: undefined;
  Instructions: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const ONBOARDING_STORAGE_KEY = "ontrack-onboarding-complete";

function ThemedNavigation() {
  const { theme, isDark } = useTheme();
  const goals = useStore((s) => s.goals);
  const seedDemoData = useStore((s) => s.seedDemoData);
  const [showIntroduction, setShowIntroduction] = React.useState(false);
  const [hasCheckedIntroduction, setHasCheckedIntroduction] = React.useState(false);

  React.useEffect(() => {
    let isCancelled = false;

    const hydrateIntroductionState = async () => {
      await useStore.persist.rehydrate();

      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_STORAGE_KEY);
      const hasExistingGoals = useStore.getState().goals.length > 0;

      if (isCancelled) {
        return;
      }

      if (hasCompletedOnboarding || hasExistingGoals) {
        setShowIntroduction(false);
        setHasCheckedIntroduction(true);
        return;
      }

      seedDemoData();
      setShowIntroduction(true);
      setHasCheckedIntroduction(true);
    };

    void hydrateIntroductionState();

    return () => {
      isCancelled = true;
    };
  }, [seedDemoData]);

  const handleIntroductionDone = React.useCallback(async () => {
    await AsyncStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
    setShowIntroduction(false);
  }, []);

  if (!hasCheckedIntroduction) {
    return null;
  }

  if (showIntroduction && goals.length > 0) {
    return (
      <>
        <IntroductionWizard onDone={handleIntroductionDone} />
        <StatusBar style={isDark ? "light" : "dark"} />
      </>
    );
  }
  
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <ThemedNavigation />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
