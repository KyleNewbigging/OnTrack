import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import NewGoalScreen from '../components/NewGoalScreen';
import GoalScreen from '../components/GoalScreen';
import { ThemeProvider } from '../contexts/ThemeContext';
import { useStore } from '../store';

jest.mock('@expo/vector-icons', () => {
  const React = require('react');
  const { Text } = require('react-native');

  return {
    Ionicons: ({ name }: { name: string }) => React.createElement(Text, null, name),
  };
});

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  impactAsync: jest.fn(),
  notificationAsync: jest.fn(),
  ImpactFeedbackStyle: { Light: 'Light', Heavy: 'Heavy' },
  NotificationFeedbackType: { Success: 'Success', Warning: 'Warning', Error: 'Error' },
}));

jest.mock('react-native-draggable-flatlist', () => {
  const React = require('react');
  const { View } = require('react-native');

  const Mock = ({ children }: { children?: React.ReactNode }) => React.createElement(View, null, children);
  return {
    __esModule: true,
    default: Mock,
    ScaleDecorator: ({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children),
  };
});

const renderWithTheme = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('visible validation states', () => {
  afterEach(() => {
    useStore.setState({
      goals: [],
      selectedDate: new Date('2026-05-04T12:00:00.000Z'),
      account: null,
    });
  });

  it('shows a visible error when creating a blank goal', () => {
    const navigation = { goBack: jest.fn() } as any;

    const screen = renderWithTheme(<NewGoalScreen navigation={navigation} route={{} as any} />);

    fireEvent.press(screen.getByText('Create Goal'));

    expect(screen.getByText('Enter a goal title.')).toBeTruthy();
    expect(navigation.goBack).not.toHaveBeenCalled();
  });

  it('shows a visible error when saving a blank goal title edit', () => {
    useStore.setState({
      goals: [
        {
          id: 'goal-1',
          title: 'Fitness',
          target: 'Run a 5k',
          createdAt: Date.now(),
          tasks: [],
        },
      ],
      selectedDate: new Date('2026-05-04T12:00:00.000Z'),
      account: null,
    });

    const screen = renderWithTheme(
      <GoalScreen navigation={{ navigate: jest.fn() } as any} route={{ params: { goalId: 'goal-1' } } as any} />
    );

    fireEvent.press(screen.getByLabelText('Edit goal details'));
    fireEvent.changeText(screen.getByDisplayValue('Fitness'), '   ');
    fireEvent.press(screen.getByLabelText('Save goal details'));

    expect(screen.getByText('Enter a goal title.')).toBeTruthy();
  });

  it('shows a visible error when adding a blank task title', () => {
    useStore.setState({
      goals: [
        {
          id: 'goal-1',
          title: 'Fitness',
          target: 'Run a 5k',
          createdAt: Date.now(),
          tasks: [],
        },
      ],
      selectedDate: new Date('2026-05-04T12:00:00.000Z'),
      account: null,
    });

    const screen = renderWithTheme(
      <GoalScreen navigation={{ navigate: jest.fn() } as any} route={{ params: { goalId: 'goal-1' } } as any} />
    );

    fireEvent.press(screen.getByText('+ New Task'));
    fireEvent.press(screen.getByLabelText('Add task'));

    expect(screen.getByText('Enter a task title.')).toBeTruthy();
  });
});
