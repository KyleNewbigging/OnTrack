import React from "react";
import { Text, View, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../contexts/ThemeContext";
import InfoSection from "./InfoSection";

const sections = [
  {
    title: "1. Build a goal from tasks",
    body: [
      "A goal is the outcome you care about, like fitness, recovery, or learning. Tasks are the actions that support it.",
      "Example: a Fitness goal might include Daily water, Workout 3 times a week, and a 10k run once a month.",
    ],
  },
  {
    title: "2. Pick the date you want to view",
    body: [
      "The date card on the home screen controls the app’s current tracking day. Tap it to open the calendar, switch to a past day, and then mark tasks for that day.",
      "This is useful for backfilling missed check-ins or logging progress from before you installed the app.",
    ],
  },
  {
    title: "3. Understand task frequencies",
    body: [
      "Daily tasks can be completed once per day. Weekly tasks need one completion during the current Sunday-to-Saturday week. Custom tasks use calendar-based weekly or monthly targets, such as 3 times per week or once per month.",
      "One-off tasks are different: they are single completions, so they appear separately from recurring consistency habits.",
    ],
  },
  {
    title: "4. Read the heatmaps",
    body: [
      "Heatmaps show when completions happened over time. More highlighted days means you showed up more consistently.",
      "Open a goal and tap See Consistency to view task-level heatmaps. Recurring tasks each get their own heatmap, while one-off tasks are grouped into a single combined heatmap at the bottom of the page.",
    ],
  },
  {
    title: "5. Read the radar chart",
    body: [
      "The radar chart on the home screen gives a high-level comparison across goals. Bigger values mean that goal has been completed more consistently relative to its task expectations.",
      "It is useful for spotting which areas of your life are strong and which goals are falling behind.",
    ],
  },
  {
    title: "6. Example data and reset",
    body: [
      "New users may see example goals and tasks so the charts and consistency pages make sense immediately. They are there to teach the flow, not to stay forever.",
      "When you are ready to start with your own data, open Settings and use Reset App Data. That clears the examples and your local history on this device.",
    ],
  },
] as const;

export default function InstructionsScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={["bottom", "left", "right"]}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: 28 }}>
        <View style={{ gap: 8 }}>
          <Text style={{ fontSize: 24, fontWeight: "800", color: theme.text }}>How OnTrack Works</Text>
          <Text style={{ color: theme.textSecondary, lineHeight: 22 }}>
            OnTrack is built around goals and tasks. You create a goal, add tasks underneath it, and then track your progress over time with daily views, heatmaps, and radar summaries.
          </Text>
        </View>

        {sections.map((section) => (
          <InfoSection key={section.title} title={section.title} body={[...section.body]} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
