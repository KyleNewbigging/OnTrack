# OnTrack — Project TODO

This file tracks features, fixes, and ideas for the OnTrack app.  
Use ✅ when done, keep lines short and actionable.

---

## MVP (Now)
- [x] Create goal (title + optional target)
- [x] View goal details (sub-goals list, frequency)
- [x] Add sub-goal/task (title + frequency: once/daily/weekly)
- [x] Toggle “done today” for tasks
- [x] Delete goal (red pill button + confirm dialog) ✅ in progress
- [x] Persist state with AsyncStorage
- [x] Input labels for clarity
- [x] Handle empty states (no goals, no sub-goals)
- [ ] Consistency heatmap (aggregate completions per day)

---

## Near-Term Improvements
- [ ] Undo option after deleting a goal (snackbar or banner)
- [ ] Reset data (dev-only) to clear storage and reseed demo
- [ ] Demo seed goals only if storage is empty
- [ ] Slight polish: spacing, typography

---

## Notifications (Later)
- [ ] Daily reminders per sub-goal (e.g., remind at 8:00 PM)
- [ ] Quiet hours (don’t ping after certain time)

---

## Haptics (Later)
- [ ] Light vibration on confirm delete
- [ ] Light vibration on toggle task
- *Note:*  
  - Install: `npm i expo-haptics`  
  - Import: `import * as Haptics from "expo-haptics";`  
  - Example:  
    ```ts
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    ```

---

## UX Ideas (Backlog)
- [ ] Weekly targets for tasks (e.g., workout 3×/week) + progress bar
- [ ] Assign tasks: Me / Roommate / Rotate weekly
- [ ] Home summary: streaks, completion rate, current week count

---

## Technical Cleanup
- [ ] Extract inline styles to StyleSheet or small helper functions
- [ ] Validate inputs (no empty titles, prevent duplicates)
- [ ] Add error boundaries / try-catch around storage writes

---

## Stretch Goals
- [ ] Sync via Supabase for shared accounts
- [ ] iOS widgets (streak counter / next action)
- [ ] Analytics: track most vs least completed goals
