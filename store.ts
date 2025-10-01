import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Goal, Frequency } from "./types";
import { format, startOfDay } from "date-fns";


// Delete one store
export async function deleteStoreByKey(key: string) {
  try {
    await AsyncStorage.removeItem(key);
    console.log(`✅ Deleted persisted store: ${key}`);
  } catch (err) {
    console.error(`❌ Failed to delete ${key}:`, err);
  }
  
}
  // Date utility functions
  const normalizeDate = (date: Date): Date => startOfDay(date);
const dateToKey = (date: Date): string => format(normalizeDate(date), "yyyy-MM-dd");
const isSameDay = (date1: Date, date2: Date): boolean => 
  dateToKey(date1) === dateToKey(date2);


// Debug function to inspect all stored data - console only for now
export const debugAsyncStorage = async () => {
    /* console.log("DEBUG PRESSED");
    await deleteStoreByKey("ontrack-store"); // Change id for specific store
    console.log(" DELETED store"); */


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
                        new Date(2025, 6, 1), new Date(2025, 6, 3), new Date(2025, 6, 5), new Date(2025, 6, 8), new Date(2025, 6, 10),
                        new Date(2025, 6, 12), new Date(2025, 6, 15), new Date(2025, 6, 17), new Date(2025, 6, 20), new Date(2025, 6, 22),
                        new Date(2025, 7, 1), new Date(2025, 7, 3), new Date(2025, 7, 6), new Date(2025, 7, 8), new Date(2025, 7, 11),
                        new Date(2025, 7, 13), new Date(2025, 7, 16), new Date(2025, 7, 18), new Date(2025, 7, 21), new Date(2025, 7, 23),
                        new Date(2025, 8, 2), new Date(2025, 8, 4), new Date(2025, 8, 7), new Date(2025, 8, 9), new Date(2025, 8, 12),
                        new Date(2025, 8, 14), new Date(2025, 8, 17), new Date(2025, 8, 19), new Date(2025, 8, 22), new Date(2025, 8, 24),
                        new Date(2025, 8, 30)
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
                        new Date("2025-07-20"), new Date("2025-07-27"), new Date("2025-08-03"), new Date("2025-08-10"), new Date("2025-08-17"), 
                        new Date("2025-08-24"), new Date("2025-08-31"), new Date("2025-09-07"), new Date("2025-09-14"), new Date("2025-09-21"), 
                        new Date("2025-09-28")
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
                        new Date("2025-08-15"), new Date("2025-08-16"), new Date("2025-08-18"), new Date("2025-08-19"), new Date("2025-08-21"),
                        new Date("2025-08-22"), new Date("2025-08-24"), new Date("2025-08-25"), new Date("2025-08-27"), new Date("2025-08-28"),
                        new Date("2025-09-02"), new Date("2025-09-03"), new Date("2025-09-05"), new Date("2025-09-06"), new Date("2025-09-09"),
                        new Date("2025-09-10"), new Date("2025-09-12"), new Date("2025-09-13"), new Date("2025-09-16"), new Date("2025-09-17")
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
    theme: 'light' | 'dark';
    addGoal: (title: string, target?: string) => void;
    addSubGoal: (goalId: string, title: string, frequency: Frequency) => void;
    toggleTaskCompletion: (goalId: string, subId: string, date?: Date) => void;
    completionsByDate: () => Record<string, number>;
    deleteSubGoal: (goalId: string, subId: string) => void;
    deleteGoal: (goalId: string) => void;
    toggleTheme: () => void;
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
            theme: 'light',

            addGoal: (title, target) =>
                set((s) => ({
                    goals: [
                        ...s.goals,
                        { id: makeId(), title, target, subGoals: [], createdAt: Date.now() },
                    ],
                })),
            addSubGoal: (goalId, title, frequency) =>
                set((s) => ({
                    goals: s.goals.map((g) =>
                        g.id === goalId
                            ? {
                                ...g,
                                subGoals: [
                                    ...g.subGoals,
                                    { id: makeId(), title, frequency, completions: [] },
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
                        for (const completionDate of t.completions) {
                            const dateKey = dateToKey(completionDate);
                            map[dateKey] = (map[dateKey] || 0) + 1;
                        }
                    }
                }
                return map;
            },
            deleteSubGoal: (goalId, subId) => {
                set((s) => ({
                    goals: s.goals.map((g) =>
                        g.id === goalId
                            ? {
                                ...g,
                                subGoals: g.subGoals.filter((t) => t.id !== subId),
                            }
                            : g
                    ),
                }));
            },
            deleteGoal: (goalId) => {
                set((s) => ({
                    goals: s.goals.filter((g) => g.id !== goalId),
                }));
            },
            toggleTheme: () => {
                set((s) => ({
                    theme: s.theme === 'dark' ? 'light' : 'dark',
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
                    if (state && !state.theme) {
                        state.theme = 'light';
                    }
                };
            },
        }
    )
);
