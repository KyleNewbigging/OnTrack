import { createBackupPayload, getCustomFrequencyProgress } from './store';
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

describe('createBackupPayload', () => {
  it('serializes dates and includes export metadata', () => {
    const payload = createBackupPayload(
      [
        {
          id: 'goal-1',
          title: 'Fitness',
          target: 'Stay consistent',
          createdAt: 1710000000000,
          tasks: [
            {
              id: 'task-1',
              title: 'Workout',
              frequency: 'daily',
              completions: [new Date('2026-04-22T12:00:00.000Z')],
            },
          ],
        },
      ],
      new Date('2026-04-21T12:00:00.000Z'),
      new Date('2026-04-22T15:30:00.000Z')
    );

    expect(payload.exportedAt).toBe('2026-04-22T15:30:00.000Z');
    expect(payload.mode).toBe('PROD');
    expect(payload.storageKey).toBe('ontrack-store-prod');
    expect(payload.selectedDate).toBe('2026-04-21T04:00:00.000Z');
    expect(payload.goals[0].tasks[0].completions).toEqual(['2026-04-22T12:00:00.000Z']);
  });
});
