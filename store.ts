import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Goal, Frequency, CustomFrequency, SubGoal } from "./types";
import { format, startOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, isWithinInterval } from "date-fns";

// Date utility functions
const normalizeDate = (date: Date): Date => startOfDay(date);
const dateToKey = (date: Date): string => format(normalizeDate(date), "yyyy-MM-dd");
const isSameDay = (date1: Date, date2: Date): boolean => 
  dateToKey(date1) === dateToKey(date2);

// Helper functions for custom frequency calculations
export const getCustomFrequencyProgress = (task: SubGoal, referenceDate: Date = new Date()) => {
  if (task.frequency !== "custom" || !task.customFrequency) {
    return { completed: 0, target: 0, achieved: false };
  }

  const { type, target } = task.customFrequency;
  
  let periodStart: Date;
  let periodEnd: Date;
  
  if (type === "weekly") {
    periodStart = startOfWeek(referenceDate, { weekStartsOn: 0 }); // Sunday start
    periodEnd = endOfWeek(referenceDate, { weekStartsOn: 0 }); // Saturday end
  } else { // monthly
    periodStart = startOfMonth(referenceDate);
    periodEnd = endOfMonth(referenceDate);
  }
  
  const completionsInPeriod = task.completions.filter(date =>
    isWithinInterval(date, { start: periodStart, end: periodEnd })
  );
  
  const completed = completionsInPeriod.length;
  const achieved = completed >= target;
  
  return { completed, target, achieved, periodStart, periodEnd };
};

export const shouldShowCustomTask = (task: SubGoal, referenceDate: Date = new Date()): boolean => {
  if (task.frequency !== "custom") return true;
  
  const { achieved } = getCustomFrequencyProgress(task, referenceDate);
  return !achieved; // Show task if target not yet achieved this period
};

// Helper to calculate streak for any goal type
export const getGoalStreak = (task: SubGoal): number => {
  let streak = 0;
  let currentDate = new Date();
  
  if (task.frequency === "custom" && task.customFrequency) {
    // For custom frequencies, check period achievements
    const { type } = task.customFrequency;
    
    // First check if current period is achieved
    let currentProgress = getCustomFrequencyProgress(task, currentDate);
    
    // If current period is achieved, start counting from it
    if (currentProgress.achieved) {
      streak++;
      // Move to previous period
      if (type === "weekly") {
        currentDate.setDate(currentDate.getDate() - 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
      }
    } else {
      // If current period is not achieved, start from previous period
      if (type === "weekly") {
        currentDate.setDate(currentDate.getDate() - 7);
      } else {
        currentDate.setMonth(currentDate.getMonth() - 1);
      }
    }
    
    // Now count consecutive achieved periods going backwards
    while (true) {
      const progress = getCustomFrequencyProgress(task, currentDate);
      
      if (progress.achieved) {
        streak++;
        // Move to previous period
        if (type === "weekly") {
          currentDate.setDate(currentDate.getDate() - 7);
        } else {
          currentDate.setMonth(currentDate.getMonth() - 1);
        }
      } else {
        break; // Streak broken
      }
      
      // Safety check - don't go back more than 2 years
      if (streak > 104) break;
    }
  } else if (task.frequency === "daily") {
    // For daily tasks, check consecutive days
    while (true) {
      const dateStr = format(currentDate, "yyyy-MM-dd");
      const hasCompletion = task.completions.some(date => 
        format(date, "yyyy-MM-dd") === dateStr
      );
      
      if (hasCompletion) {
        streak++;
        // Move to previous day
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break; // Streak broken
      }
      
      // Safety check - don't go back more than 365 days
      if (streak > 365) break;
    }
  } else if (task.frequency === "weekly") {
    // For weekly tasks, check consecutive weeks
    while (true) {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 }); // Sunday
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 }); // Saturday
      
      const hasCompletionThisWeek = task.completions.some(date => 
        isWithinInterval(date, { start: weekStart, end: weekEnd })
      );
      
      if (hasCompletionThisWeek) {
        streak++;
        // Move to previous week
        currentDate.setDate(currentDate.getDate() - 7);
      } else {
        break; // Streak broken
      }
      
      // Safety check - don't go back more than 104 weeks (2 years)
      if (streak > 104) break;
    }
  }
  
  return streak;
};

// Helper to get all achieved goal periods for heatmap indicators
export const getAchievedGoalPeriods = (task: SubGoal): Array<{ start: Date; end: Date; type: "weekly" | "monthly" }> => {
  if (task.frequency !== "custom" || !task.customFrequency) return [];
  
  const achievements: Array<{ start: Date; end: Date; type: "weekly" | "monthly" }> = [];
  const { type, target } = task.customFrequency;
  
  // Get date range to check (last 6 months for performance)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - 6);
  
  // Check each period in the range
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const progress = getCustomFrequencyProgress(task, currentDate);
    
    if (progress.achieved && progress.periodStart && progress.periodEnd) {
      // Check if we already added this period
      const alreadyAdded = achievements.some(a => 
        a.start.getTime() === progress.periodStart!.getTime()
      );
      
      if (!alreadyAdded) {
        achievements.push({
          start: progress.periodStart,
          end: progress.periodEnd,
          type
        });
      }
    }
    
    // Move to next period
    if (type === "weekly") {
      currentDate.setDate(currentDate.getDate() + 7);
    } else {
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
  }
  
  return achievements;
};


// Debug function to inspect all stored data - console only for now
export const debugAsyncStorage = async () => {
    try {
        const timestamp = new Date().toISOString();
        
        console.log("=== AsyncStorage Debug ===");
        console.log(`Timestamp: ${timestamp}`);
        
        // Show current store mode
        console.log(`🏪 Current Mode: ${CURRENT_MODE}`);
        console.log(`🗄️  Active Storage: ${ACTIVE_STORAGE_KEY}`);
        console.log(`📝 Available Stores: DEV=${STORAGE_KEYS.DEV}, PROD=${STORAGE_KEYS.PROD}`);
        
        // Get all keys
        const allKeys = await AsyncStorage.getAllKeys();
        console.log("All AsyncStorage keys:", allKeys);
        
        // Get all OnTrack related keys
        const onTrackKeys = allKeys.filter(key => key.startsWith('ontrack'));
        console.log("OnTrack keys found:", onTrackKeys);
        
        // Get data for each OnTrack key
        for (const key of onTrackKeys) {
            try {
                const data = await AsyncStorage.getItem(key);
                console.log(`\n--- ${key} ---`);
                if (data) {
                    const parsed = JSON.parse(data);
                    console.log(`Goals count: ${parsed.goals?.length || 0}`);
                    console.log(`Data size: ${data.length} characters`);
                    console.log(`Created: ${new Date(parsed.goals?.[0]?.createdAt || Date.now()).toISOString()}`);
                    
                    // Show sample of each goal
                    parsed.goals?.forEach((goal: any, index: number) => {
                        console.log(`  Goal ${index + 1}: ${goal.title} (${goal.subGoals?.length || 0} tasks)`);
                    });
                } else {
                    console.log("No data found");
                }
            } catch (error) {
                console.log(`Error reading ${key}:`, error);
            }
        }
        
        console.log("=== End Debug ===");
        console.log("💡 To save to file, we'd need to fix FileSystem import issues");
        
    } catch (error) {
        console.log("Debug failed:", error);
    }
};



// Simple ID generator for MVP
function makeId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

// Sample data for development/testing
function getSampleGoals(): Goal[] {
    return [
        {
            id: makeId(),
            title: "Fitness Journey",
            target: "Get in shape",
            createdAt: Date.now() - (90 * 24 * 60 * 60 * 1000), // 90 days ago
            subGoals: [
                {
                    id: makeId(),
                    title: "Morning workout",
                    frequency: "daily",
                    completions: [
                        // 7-day streak ending today (Sept 26-Oct 2, 2025)
                        new Date(2025, 8, 26), new Date(2025, 8, 27), new Date(2025, 8, 28), 
                        new Date(2025, 8, 29), new Date(2025, 8, 30), new Date(2025, 9, 1), new Date(2025, 9, 2),
                        // Some earlier scattered completions
                        new Date(2025, 8, 20), new Date(2025, 8, 22), new Date(2025, 8, 24),
                        new Date(2025, 8, 15), new Date(2025, 8, 17), new Date(2025, 8, 19),
                        new Date(2025, 8, 10), new Date(2025, 8, 12), new Date(2025, 8, 14)
                    ]
                },
                {
                    id: makeId(),
                    title: "Drink protein shake",
                    frequency: "daily",
                    completions: [
                        new Date(2025, 6, 2), new Date(2025, 6, 4), new Date(2025, 6, 6), new Date(2025, 6, 9), new Date(2025, 6, 11),
                        new Date(2025, 7, 2), new Date(2025, 7, 5), new Date(2025, 7, 7), new Date(2025, 7, 10), new Date(2025, 7, 12),
                        new Date(2025, 7, 15), new Date(2025, 7, 17), new Date(2025, 7, 20), new Date(2025, 7, 22), new Date(2025, 7, 25),
                        new Date(2025, 8, 3), new Date(2025, 8, 5), new Date(2025, 8, 8), new Date(2025, 8, 10), new Date(2025, 8, 13)
                    ]
                },
                {
                    id: makeId(),
                    title: "Go to gym",
                    frequency: "custom",
                    customFrequency: { type: "weekly", target: 3 },
                    completions: [
                        // Current week (Sept 30-Oct 6): 2/3 so far
                        new Date(2025, 8, 30), new Date(2025, 9, 2),
                        // Week 4 (Sept 23-29): 3/3 ✓
                        new Date(2025, 8, 23), new Date(2025, 8, 25), new Date(2025, 8, 27),
                        // Week 3 (Sept 16-22): 3/3 ✓
                        new Date(2025, 8, 16), new Date(2025, 8, 18), new Date(2025, 8, 20),
                        // Week 2 (Sept 9-15): 3/3 ✓
                        new Date(2025, 8, 9), new Date(2025, 8, 11), new Date(2025, 8, 13),
                        // Week 1 (Sept 2-8): 3/3 ✓ - This creates a 4-week streak!
                        new Date(2025, 8, 2), new Date(2025, 8, 4), new Date(2025, 8, 6)
                    ]
                },
                {
                    id: makeId(),
                    title: "Meal prep",
                    frequency: "custom",
                    customFrequency: { type: "weekly", target: 2 },
                    completions: [
                        // Current week: 1/2 so far
                        new Date(2025, 9, 1),
                        // 3-week streak of hitting 2/week
                        new Date(2025, 8, 23), new Date(2025, 8, 26),
                        new Date(2025, 8, 16), new Date(2025, 8, 19),
                        new Date(2025, 8, 9), new Date(2025, 8, 12)
                    ]
                },
                {
                    id: makeId(),
                    title: "Clean house thoroughly",
                    frequency: "weekly",
                    completions: [
                        // 7-week streak! Each completion is one per week
                        new Date(2025, 8, 28),  // Current week (Sept 28-Oct 4) - Sunday
                        new Date(2025, 8, 21),  // Week of Sept 21-27
                        new Date(2025, 8, 14),  // Week of Sept 14-20
                        new Date(2025, 8, 7),   // Week of Sept 7-13
                        new Date(2025, 7, 31),  // Week of Aug 31-Sep 6
                        new Date(2025, 7, 24),  // Week of Aug 24-30
                        new Date(2025, 7, 17),  // Week of Aug 17-23
                    ]
                }
            ]
        },
        {
            id: makeId(),
            title: "Learning Spanish",
            target: "Conversational fluency",
            createdAt: Date.now() - (75 * 24 * 60 * 60 * 1000), // 75 days ago
            subGoals: [
                {
                    id: makeId(),
                    title: "Duolingo practice",
                    frequency: "daily",
                    completions: [
                        new Date(2025, 6, 15), new Date(2025, 6, 16), new Date(2025, 6, 17), new Date(2025, 6, 18), new Date(2025, 6, 19),
                        new Date(2025, 6, 20), new Date(2025, 6, 21), new Date(2025, 6, 22), new Date(2025, 6, 23), new Date(2025, 6, 24),
                        new Date(2025, 6, 25), new Date(2025, 6, 26), new Date(2025, 6, 27), new Date(2025, 6, 28), new Date(2025, 6, 29),
                        new Date(2025, 6, 30), new Date(2025, 6, 31), new Date(2025, 7, 1), new Date(2025, 7, 2), new Date(2025, 7, 3),
                        new Date(2025, 7, 4), new Date(2025, 7, 5), new Date(2025, 7, 6), new Date(2025, 7, 7), new Date(2025, 7, 8),
                        new Date(2025, 7, 9), new Date(2025, 7, 10), new Date(2025, 7, 11), new Date(2025, 7, 12), new Date(2025, 7, 13),
                        new Date(2025, 7, 14), new Date(2025, 7, 15), new Date(2025, 7, 16), new Date(2025, 7, 17), new Date(2025, 7, 18),
                        new Date(2025, 7, 19), new Date(2025, 7, 20), new Date(2025, 7, 21), new Date(2025, 7, 22), new Date(2025, 7, 23),
                        new Date(2025, 7, 24), new Date(2025, 7, 25), new Date(2025, 7, 26), new Date(2025, 7, 27), new Date(2025, 7, 28),
                        new Date(2025, 7, 29), new Date(2025, 7, 30), new Date(2025, 7, 31), new Date(2025, 8, 1), new Date(2025, 8, 2),
                        new Date(2025, 8, 3), new Date(2025, 8, 4), new Date(2025, 8, 5), new Date(2025, 8, 6), new Date(2025, 8, 7),
                        new Date(2025, 8, 8), new Date(2025, 8, 9), new Date(2025, 8, 10), new Date(2025, 8, 11), new Date(2025, 8, 12),
                        new Date(2025, 8, 13), new Date(2025, 8, 14), new Date(2025, 8, 15), new Date(2025, 8, 16), new Date(2025, 8, 17),
                        new Date(2025, 8, 18), new Date(2025, 8, 19), new Date(2025, 8, 20), new Date(2025, 8, 21), new Date(2025, 8, 22),
                        new Date(2025, 8, 23), new Date(2025, 8, 24), new Date(2025, 8, 25), new Date(2025, 8, 26), new Date(2025, 8, 27),
                        new Date(2025, 8, 28), new Date(2025, 8, 29), new Date(2025, 8, 30)
                    ]
                },
                {
                    id: makeId(),
                    title: "Watch Spanish Netflix",
                    frequency: "weekly",
                    completions: [
                        // 12-week streak! (July to current)
                        new Date("2025-07-13"), new Date("2025-07-20"), new Date("2025-07-27"), 
                        new Date("2025-08-03"), new Date("2025-08-10"), new Date("2025-08-17"), 
                        new Date("2025-08-24"), new Date("2025-08-31"), new Date("2025-09-07"), 
                        new Date("2025-09-14"), new Date("2025-09-21"), new Date("2025-09-28")
                    ]
                }
            ]
        },
        {
            id: makeId(),
            title: "Healthy Habits",
            target: "Better lifestyle",
            createdAt: Date.now() - (60 * 24 * 60 * 60 * 1000), // 60 days ago
            subGoals: [
                {
                    id: makeId(),
                    title: "Drink 8 glasses of water",
                    frequency: "daily",
                    completions: [
                        new Date("2025-08-02"), new Date("2025-08-15"), new Date("2025-09-01"), new Date("2025-09-20")
                    ]
                },
                {
                    id: makeId(),
                    title: "Meditate for 10 minutes",
                    frequency: "daily",
                    completions: [
                        new Date("2025-08-10"), new Date("2025-09-05")
                    ]
                },
                {
                    id: makeId(),
                    title: "Take vitamins",
                    frequency: "daily",
                    completions: [
                        new Date("2025-08-05"), new Date("2025-08-20"), new Date("2025-09-03")
                    ]
                }
            ]
        },
        {
            id: makeId(),
            title: "Side Project",
            target: "Launch mobile app",
            createdAt: Date.now() - (45 * 24 * 60 * 60 * 1000), // 45 days ago
            subGoals: [
                {
                    id: makeId(),
                    title: "Code for 2 hours",
                    frequency: "daily",
                    completions: [
                        // 3-day streak ending today
                        new Date(2025, 8, 30), new Date(2025, 9, 1), new Date(2025, 9, 2),
                        // Some scattered earlier dates
                        new Date("2025-09-25"), new Date("2025-09-26"), new Date("2025-09-28"),
                        new Date("2025-09-20"), new Date("2025-09-22"),
                        new Date("2025-09-15"), new Date("2025-09-17")
                    ]
                },
                {
                    id: makeId(),
                    title: "Write documentation",
                    frequency: "weekly",
                    completions: [
                        new Date("2025-08-18"), new Date("2025-08-25"), new Date("2025-09-01"), new Date("2025-09-08"), new Date("2025-09-15"), new Date("2025-09-22")
                    ]
                },
                {
                    id: makeId(),
                    title: "Test on device",
                    frequency: "weekly",
                    completions: [
                        new Date("2025-08-20"), new Date("2025-08-27"), new Date("2025-09-03"), new Date("2025-09-10"), new Date("2025-09-17")
                    ]
                }
            ]
        }
    ];
}

// Storage key configuration
const STORAGE_KEYS = {
    DEV: "ontrack-store-dev",
    PROD: "ontrack-store-prod"
} as const;

// Configuration: Change this to switch between dev and prod modes
const CURRENT_MODE = 'DEV' as 'DEV' | 'PROD'; // Change to 'DEV' for sample data
const ACTIVE_STORAGE_KEY = CURRENT_MODE === 'DEV' ? STORAGE_KEYS.DEV : STORAGE_KEYS.PROD;

// Export current mode for UI indicator
export const getCurrentMode = () => CURRENT_MODE;




interface State {
    goals: Goal[];
    addGoal: (title: string, target?: string) => void;
    addSubGoal: (goalId: string, title: string, frequency: Frequency, customFrequency?: CustomFrequency) => void;
    toggleTaskCompletion: (goalId: string, subId: string, date?: Date) => void;
    completionsByDate: () => Record<string, number>;
    deleteGoal: (goalId: string) => void;
}

// Get initial goals based on store mode
const getInitialGoals = (): Goal[] => {
    // If using dev mode, return sample data, otherwise empty
    return CURRENT_MODE === 'DEV' ? getSampleGoals() : [];
};

export const useStore = create<State>()(
    persist(
        (set, get) => ({
            goals: getInitialGoals(), // Dynamic initialization based on store mode

            addGoal: (title, target) =>
                set((s) => ({
                    goals: [
                        ...s.goals,
                        { id: makeId(), title, target, subGoals: [], createdAt: Date.now() },
                    ],
                })),
            addSubGoal: (goalId, title, frequency, customFrequency) =>
                set((s) => ({
                    goals: s.goals.map((g) =>
                        g.id === goalId
                            ? {
                                ...g,
                                subGoals: [
                                    ...g.subGoals,
                                    { 
                                        id: makeId(), 
                                        title, 
                                        frequency, 
                                        customFrequency: frequency === "custom" ? customFrequency : undefined,
                                        completions: [] 
                                    },
                                ],
                            }
                            : g
                    ),
                })),
            toggleTaskCompletion: (goalId, subId, date = new Date()) =>
                set((s) => {
                    const normalizedDate = normalizeDate(date);
                    return {
                        goals: s.goals.map((g) => {
                            if (g.id !== goalId) return g;
                            return {
                                ...g,
                                subGoals: g.subGoals.map((t) => {
                                    if (t.id !== subId) return t;
                                    const hasCompletion = t.completions.some(completionDate => 
                                        isSameDay(completionDate, normalizedDate)
                                    );
                                    return {
                                        ...t,
                                        completions: hasCompletion
                                            ? t.completions.filter((x) => !isSameDay(x, normalizedDate))
                                            : [...t.completions, normalizedDate],
                                    };
                                }),
                            };
                        }),
                    };
                }),
            completionsByDate: () => {
                const map: Record<string, number> = {};
                for (const g of get().goals) {
                    for (const t of g.subGoals) {
                        // Skip "once" frequency tasks - they shouldn't appear in heatmaps
                        if (t.frequency === "once") continue;
                        
                        for (const completionDate of t.completions) {
                            const dateKey = dateToKey(completionDate);
                            map[dateKey] = (map[dateKey] || 0) + 1;
                        }
                    }
                }
                return map;
            },
            deleteGoal: (goalId) => {
                set((s) => ({
                    goals: s.goals.filter((g) => g.id !== goalId),
                }));
            },
        }),
        {
            name: ACTIVE_STORAGE_KEY, // Dynamic storage key based on CURRENT_MODE
            storage: createJSONStorage(() => AsyncStorage),
            // Custom onRehydrateStorage to convert ISO strings back to Date objects
            onRehydrateStorage: () => {
                return (state) => {
                    if (state?.goals) {
                        state.goals = state.goals.map(goal => ({
                            ...goal,
                            subGoals: goal.subGoals?.map(subGoal => ({
                                ...subGoal,
                                completions: subGoal.completions?.map(completion => 
                                    typeof completion === 'string' ? new Date(completion) : completion
                                ) || []
                            })) || []
                        }));
                    }
                };
            },
        }
    )
);
