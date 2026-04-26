import { getCustomFrequencyProgress, getSampleGoals } from './store';
import { Task } from './types';

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
