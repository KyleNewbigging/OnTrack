export type Frequency = "once" | "daily" | "weekly"; // TODO: custom option

export interface SubGoal {
  id: string;
  title: string;
  frequency: Frequency;
  completions: Date[]; // Array of completion dates
}

export interface Goal {
  id: string;
  title: string;
  target?: string;
  subGoals: SubGoal[];
  createdAt: number;
}
