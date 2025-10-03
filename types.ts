export type Frequency = "once" | "daily" | "weekly" | "custom";

export interface CustomFrequency {
  type: "weekly" | "monthly";
  target: number; // e.g., 3 times per week, 5 times per month
}

export interface SubGoal {
  id: string;
  title: string;
  frequency: Frequency;
  customFrequency?: CustomFrequency; // Only used when frequency is "custom"
  completions: Date[]; // Array of completion dates
}

export interface Goal {
  id: string;
  title: string;
  target?: string;
  subGoals: SubGoal[];
  createdAt: number;
}
