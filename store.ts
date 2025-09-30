import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { persist, createJSONStorage } from "zustand/middleware";
import { Goal, Frequency } from "./types";
import { format } from "date-fns";

// Simple ID generator for MVP
function makeId() {
    return Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
}

interface State {
    goals: Goal[];
    addGoal: (title: string, target?: string) => void;
    addSubGoal: (goalId: string, title: string, frequency: Frequency) => void;
    toggleTaskCompletion: (goalId: string, subId: string, date?: Date) => void;
    completionsByDate: () => Record<string, number>;
    deleteGoal: (goalId: string) => void;
}

export const useStore = create<State>()(
    persist(
        (set, get) => ({
            goals: [
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
                                "2025-07-01", "2025-07-03", "2025-07-05", "2025-07-08", "2025-07-10",
                                "2025-07-12", "2025-07-15", "2025-07-17", "2025-07-20", "2025-07-22",
                                "2025-08-01", "2025-08-03", "2025-08-06", "2025-08-08", "2025-08-11",
                                "2025-08-13", "2025-08-16", "2025-08-18", "2025-08-21", "2025-08-23",
                                "2025-09-02", "2025-09-04", "2025-09-07", "2025-09-09", "2025-09-12",
                                "2025-09-14", "2025-09-17", "2025-09-19", "2025-09-22", "2025-09-24",
                                "2025-09-30"
                            ]
                        },
                        {
                            id: makeId(),
                            title: "Drink protein shake",
                            frequency: "daily",
                            completions: [
                                "2025-07-02", "2025-07-04", "2025-07-06", "2025-07-09", "2025-07-11",
                                "2025-08-02", "2025-08-05", "2025-08-07", "2025-08-10", "2025-08-12",
                                "2025-08-15", "2025-08-17", "2025-08-20", "2025-08-22", "2025-08-25",
                                "2025-09-03", "2025-09-05", "2025-09-08", "2025-09-10", "2025-09-13"
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
                                "2025-07-15", "2025-07-16", "2025-07-17", "2025-07-18", "2025-07-19",
                                "2025-07-21", "2025-07-22", "2025-07-23", "2025-07-25", "2025-07-26",
                                "2025-08-01", "2025-08-02", "2025-08-03", "2025-08-05", "2025-08-06",
                                "2025-08-07", "2025-08-09", "2025-08-10", "2025-08-12", "2025-08-13",
                                "2025-09-01", "2025-09-02", "2025-09-04", "2025-09-05", "2025-09-07",
                                "2025-09-08", "2025-09-10", "2025-09-11", "2025-09-13", "2025-09-15",
                                "2025-09-30"
                            ]
                        },
                        {
                            id: makeId(),
                            title: "Watch Spanish Netflix",
                            frequency: "weekly",
                            completions: [
                                "2025-07-20", "2025-07-27", "2025-08-03", "2025-08-10", 
                                "2025-08-17", "2025-08-24", "2025-09-07", "2025-09-14", "2025-09-21"
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
                                "2025-08-01", "2025-08-02", "2025-08-04", "2025-08-05", "2025-08-07",
                                "2025-08-08", "2025-08-09", "2025-08-11", "2025-08-12", "2025-08-14",
                                "2025-08-15", "2025-08-16", "2025-08-18", "2025-08-19", "2025-08-21",
                                "2025-08-22", "2025-08-23", "2025-08-25", "2025-08-26", "2025-08-28",
                                "2025-09-01", "2025-09-03", "2025-09-04", "2025-09-06", "2025-09-07",
                                "2025-09-09", "2025-09-10", "2025-09-12", "2025-09-13", "2025-09-15",
                                "2025-09-30"
                            ]
                        },
                        {
                            id: makeId(),
                            title: "Meditate for 10 minutes",
                            frequency: "daily",
                            completions: [
                                "2025-08-03", "2025-08-06", "2025-08-08", "2025-08-10", "2025-08-13",
                                "2025-08-15", "2025-08-17", "2025-08-20", "2025-08-22", "2025-08-24",
                                "2025-09-02", "2025-09-05", "2025-09-08", "2025-09-11", "2025-09-14"
                            ]
                        },
                        {
                            id: makeId(),
                            title: "Take vitamins",
                            frequency: "daily",
                            completions: [
                                "2025-08-02", "2025-08-03", "2025-08-04", "2025-08-06", "2025-08-07",
                                "2025-08-08", "2025-08-10", "2025-08-11", "2025-08-12", "2025-08-14",
                                "2025-09-01", "2025-09-02", "2025-09-04", "2025-09-05", "2025-09-07",
                                "2025-09-08", "2025-09-09", "2025-09-11", "2025-09-12", "2025-09-14"
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
                                "2025-08-15", "2025-08-16", "2025-08-18", "2025-08-19", "2025-08-21",
                                "2025-08-22", "2025-08-24", "2025-08-25", "2025-08-27", "2025-08-28",
                                "2025-09-02", "2025-09-03", "2025-09-05", "2025-09-06", "2025-09-09",
                                "2025-09-10", "2025-09-12", "2025-09-13", "2025-09-16", "2025-09-17"
                            ]
                        },
                        {
                            id: makeId(),
                            title: "Write documentation",
                            frequency: "weekly",
                            completions: [
                                "2025-08-18", "2025-08-25", "2025-09-01", "2025-09-08", "2025-09-15", "2025-09-22"
                            ]
                        },
                        {
                            id: makeId(),
                            title: "Test on device",
                            frequency: "weekly",
                            completions: [
                                "2025-08-20", "2025-08-27", "2025-09-03", "2025-09-10", "2025-09-17"
                            ]
                        }
                    ]
                }
            ],

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
                    const d = format(date, "yyyy-MM-dd");
                    return {
                        goals: s.goals.map((g) => {
                            if (g.id !== goalId) return g;
                            return {
                                ...g,
                                subGoals: g.subGoals.map((t) => {
                                    if (t.id !== subId) return t;
                                    const has = t.completions.includes(d);
                                    return {
                                        ...t,
                                        completions: has
                                            ? t.completions.filter((x) => x !== d)
                                            : [...t.completions, d],
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
                        for (const d of t.completions) {
                            map[d] = (map[d] || 0) + 1;
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
            name: "ontrack-store-v3", // Fresh data with radar chart sample data
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
