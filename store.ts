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
                    title: "Demo Goal",
                    target: "200 lbs",
                    createdAt: Date.now(),
                    subGoals: [
                        {
                            id: makeId(),
                            title: "Take creatine",
                            frequency: "daily",
                            completions: ["2025-09-25", "2025-09-26", "2025-09-27"]
                        },
                        {
                            id: makeId(),
                            title: "Workout",
                            frequency: "weekly",
                            completions: ["2025-09-24", "2025-09-27"]
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
            name: "ontrack-store",
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
