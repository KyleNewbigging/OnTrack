import { getCustomFrequencyProgress, getSampleGoals, isOnceTaskCompletedOnDate, useStore } from '../store';
import { Task } from '../types';

describe('getCustomFrequencyProgress', () => {
  it('counts weekly custom completions inside the active week', () => {
    const task: Task = {
      id: 'task-1',
      title: 'Workout',
      frequency: 'custom',
      customFrequency: { type: 'weekly', target: 3 },
      completions: [
        new Date('2026-04-19T12:00:00.000Z'),
        new Date('2026-04-20T12:00:00.000Z'),
        new Date('2026-04-21T12:00:00.000Z'),
        new Date('2026-04-10T12:00:00.000Z'),
      ],
    };

    const progress = getCustomFrequencyProgress(task, new Date('2026-04-22T12:00:00.000Z'));

    expect(progress.completed).toBe(3);
    expect(progress.target).toBe(3);
    expect(progress.achieved).toBe(true);
  });

  it('does not count completions from outside the active month for monthly custom tasks', () => {
    const task: Task = {
      id: 'task-2',
      title: 'Read',
      frequency: 'custom',
      customFrequency: { type: 'monthly', target: 5 },
      completions: [
        new Date('2026-04-01T12:00:00.000Z'),
        new Date('2026-04-07T12:00:00.000Z'),
        new Date('2026-04-15T12:00:00.000Z'),
        new Date('2026-04-20T12:00:00.000Z'),
        new Date('2026-03-30T12:00:00.000Z'),
      ],
    };

    const progress = getCustomFrequencyProgress(task, new Date('2026-04-21T12:00:00.000Z'));

    expect(progress.completed).toBe(4);
    expect(progress.target).toBe(5);
    expect(progress.achieved).toBe(false);
  });
});

describe('getSampleGoals', () => {
  it('includes some demo completions for today so first-launch progress is visible', () => {
    const todayKey = new Date().toDateString();
    const goals = getSampleGoals();

    const todayCompletionCount = goals
      .flatMap((goal) => goal.tasks)
      .flatMap((task) => task.completions)
      .filter((completion) => completion.toDateString() === todayKey).length;

    expect(todayCompletionCount).toBeGreaterThan(0);
  });
});

describe('isOnceTaskCompletedOnDate', () => {
  it('returns true when a once task was completed on the selected day', () => {
    const task: Task = {
      id: 'task-3',
      title: 'Book dentist appointment',
      frequency: 'once',
      completions: [new Date('2026-04-21T12:00:00.000Z')],
    };

    expect(isOnceTaskCompletedOnDate(task, new Date('2026-04-21T18:00:00.000Z'))).toBe(true);
  });

  it('returns false on later days even if the once task was completed in the past', () => {
    const task: Task = {
      id: 'task-4',
      title: 'Replace passport photo',
      frequency: 'once',
      completions: [new Date('2026-04-20T12:00:00.000Z')],
    };

    expect(isOnceTaskCompletedOnDate(task, new Date('2026-04-21T12:00:00.000Z'))).toBe(false);
  });
});

describe('updateGoal', () => {
  const originalState = useStore.getState();

  afterEach(() => {
    useStore.setState(originalState, true);
  });

  it('updates a goal target without affecting its tasks', () => {
    useStore.setState({
      ...originalState,
      goals: [
        {
          id: 'goal-1',
          title: 'Fitness',
          target: 'Run a 5k',
          createdAt: Date.now(),
          tasks: [
            {
              id: 'task-1',
              title: 'Run',
              frequency: 'daily',
              completions: [new Date('2026-04-20T12:00:00.000Z')],
            },
          ],
        },
      ],
    });

    useStore.getState().updateGoal('goal-1', { target: 'Run a 10k' });

    const updatedGoal = useStore.getState().goals[0];
    expect(updatedGoal.target).toBe('Run a 10k');
    expect(updatedGoal.tasks).toHaveLength(1);
    expect(updatedGoal.tasks[0].title).toBe('Run');
    expect(updatedGoal.tasks[0].completions).toHaveLength(1);
  });

  it('clears a goal target when null is provided', () => {
    useStore.setState({
      ...originalState,
      goals: [
        {
          id: 'goal-2',
          title: 'Nutrition',
          target: '2000 calories',
          createdAt: Date.now(),
          tasks: [],
        },
      ],
    });

    useStore.getState().updateGoal('goal-2', { target: null });

    expect(useStore.getState().goals[0].target).toBeUndefined();
  });
});
