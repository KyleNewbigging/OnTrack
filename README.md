# OnTrack

A beautiful habit tracking mobile application built with React Native and Expo. OnTrack helps users build and maintain consistent habits through visual progress tracking with interactive heatmaps.

## ✨ Features

### 📊 **Visual Progress Tracking**
- **Interactive Heatmaps**: GitHub-style heatmaps that visualize your consistency over time
- **Multiple Views**: Global overview and individual goal/task breakdowns
- **Historical Data**: Track progress over months with scrollable timeline
- **Today Highlighting**: Current date is prominently highlighted for context

### 🎯 **Goal Management**
- **Hierarchical Structure**: Organize tasks under specific goals
- **Flexible Frequency**: Support for daily, weekly, and one-time tasks
- **Custom Targets**: Set specific targets for each goal
- **Easy Navigation**: Intuitive navigation between goals and overviews

### 📱 **Mobile-First Design**
- **Native Performance**: Built with React Native for smooth mobile experience
- **Responsive UI**: Clean, modern interface optimized for mobile devices
- **Offline Support**: Data persists locally using AsyncStorage
- **Cross-Platform**: Supports iOS and Android

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **Expo CLI** (`npm install -g expo-cli`)
- **iOS Simulator** (for iOS development) or **Android Studio** (for Android)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KyleNewbigging/OnTrack.git
   cd OnTrack
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on your device**
   - **iOS**: Press `i` in the terminal or scan QR code with Camera app
   - **Android**: Press `a` in the terminal or scan QR code with Expo Go app
   - **Web**: Press `w` in the terminal

## 🛠️ Development

### Project Structure

```
OnTrack/
├── components/           # React Native components
│   ├── GoalScreen.tsx   # Individual goal management
│   ├── Heatmap.tsx      # Interactive heatmap visualization
│   ├── HomeScreen.tsx   # Main dashboard
│   ├── NewGoalScreen.tsx # Goal creation form
│   └── OverviewScreen.tsx # Goal progress overview
├── assets/              # Static assets (icons, images)
├── store.ts            # Zustand state management
├── types.ts            # TypeScript type definitions
├── App.tsx             # Main application component
├── app.json            # Expo configuration
└── package.json        # Dependencies and scripts
```

### Key Technologies

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type safety and better developer experience
- **Zustand**: Lightweight state management with persistence
- **React Navigation**: Screen navigation and routing
- **React Native SVG**: Custom heatmap visualizations
- **AsyncStorage**: Local data persistence
- **date-fns**: Date manipulation and formatting

### Development vs Production Data

OnTrack includes a simple toggle system for switching between sample data and clean data during development:

**To switch modes**, edit line ~222 in `store.ts`:
```typescript
// For development with rich sample data (4 goals, 90+ days of history)
const CURRENT_MODE = 'DEV' as 'DEV' | 'PROD';

// For production with clean empty state  
const CURRENT_MODE = 'PROD' as 'DEV' | 'PROD';
```

**Why this is useful:**
- **DEV mode**: Test features with realistic data (heatmaps, radar charts, goal lists)
- **PROD mode**: Test empty state flows (onboarding, first goal creation)
- **Quick switching**: Just change one line and save - app auto-reloads
- **Visual indicator**: Small badge shows current mode in top-right corner

### State Management

The app uses **Zustand** for state management with persistence:

```typescript
// store.ts - Main application state
interface State {
  goals: Goal[];                    // Array of user goals
  addGoal: (title, target?) => void;        // Create new goal
  addSubGoal: (goalId, title, frequency) => void; // Add task to goal
  toggleTaskCompletion: (goalId, subId, date?) => void; // Mark task complete/incomplete
  completionsByDate: () => Record<string, number>; // Aggregate completion data
  deleteGoal: (goalId) => void;            // Remove goal and all data
}
```

### Data Models

```typescript
// types.ts - Core data structures
export interface Goal {
  id: string;           // Unique identifier
  title: string;        // Goal name
  target?: string;      // Optional target description
  subGoals: SubGoal[];  // Array of tasks
  createdAt: number;    // Creation timestamp
}

export interface SubGoal {
  id: string;              // Unique identifier
  title: string;           // Task name
  frequency: Frequency;    // "daily" | "weekly" | "once"
  completions: string[];   // Array of ISO date strings (yyyy-MM-dd)
}
```

### Heatmap Implementation

The heatmap is a custom SVG component that:

1. **Calculates Date Range**: Shows configurable days of history (default 120 days)
2. **Processes Completion Data**: Aggregates task completions by date
3. **Renders Grid**: Creates a GitHub-style grid with color-coded intensity
4. **Adds Interactivity**: Supports horizontal scrolling and today highlighting
5. **Shows Month Labels**: Displays month indicators for navigation

```typescript
// Heatmap color scaling
const scale = (completionCount: number) => {
  if (completionCount <= 0) return "#e5e7eb";  // No activity
  if (completionCount === 1) return "#bbf7d0";  // Light activity
  if (completionCount === 2) return "#86efac";  // Medium activity
  if (completionCount === 3) return "#34d399";  // High activity
  return "#10b981";                             // Very high activity
};
```

## 📊 Features Deep Dive

### Heatmap Functionality

- **Auto-scroll**: Automatically scrolls to show recent dates
- **Month Navigation**: Month labels help users navigate timeline
- **Today Highlighting**: Blue border and center dot mark current date
- **Color Coding**: Intensity reflects number of completed tasks
- **Horizontal Scrolling**: Access full history without screen constraints

### Goal Management

- **Creation Flow**: Simple form to create goals with optional targets
- **Task Addition**: Add multiple tasks with different frequencies
- **Completion Tracking**: Toggle task completion with date tracking
- **Data Persistence**: All data automatically saved to device storage

### Navigation Structure

```
Home Screen (Dashboard)
├── Global Heatmap (all goals)
├── Goals List
│   └── Goal Screen (Individual Goal)
│       ├── Tasks List
│       ├── Edit Mode
│       └── Overview Screen
│           ├── Goal-Level Heatmap
│           └── Individual Task Heatmaps
└── New Goal Screen
```

## 🔧 Customization

### Adding New Frequencies

1. Update the `Frequency` type in `types.ts`:
```typescript
export type Frequency = "once" | "daily" | "weekly" | "monthly";
```

2. Update the frequency selector in `GoalScreen.tsx`:
```typescript
{["once", "daily", "weekly", "monthly"].map((f) => (
  // ... frequency button rendering
))}
```

### Modifying Heatmap Colors

Update the `scale` function in `Heatmap.tsx`:
```typescript
const scale = (n: number) => {
  if (n <= 0) return "#your-color-1";
  if (n === 1) return "#your-color-2";
  // ... add more color steps
};
```

### Changing Storage Key

To reset app data or use different storage:
```typescript
// In store.ts
{
  name: "your-custom-storage-key",
  storage: createJSONStorage(() => AsyncStorage),
}
```

## 🧪 Testing

### Sample Data

The app includes sample data for testing heatmap functionality:
- 4 pre-configured goals with different patterns
- 3+ months of historical completion data
- Various task frequencies and completion densities

To reset to sample data, change the storage key in `store.ts`.

### Manual Testing Checklist

- [ ] Create new goals with targets
- [ ] Add daily/weekly tasks to goals
- [ ] Mark tasks complete/incomplete
- [ ] Navigate to goal overview
- [ ] Scroll through heatmaps horizontally
- [ ] Verify today highlighting
- [ ] Test goal deletion
- [ ] Check data persistence after app restart

## 📦 Building for Production

### iOS Build
```bash
expo build:ios
```

### Android Build
```bash
expo build:android
```

### Expo Application Services (EAS)
```bash
# Install EAS CLI
npm install -g @expo/eas-cli

# Configure build
eas build:configure

# Build for both platforms
eas build --platform all
```

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines

- Use TypeScript for all new code
- Follow React Native best practices
- Maintain component modularity
- Add proper error handling
- Update documentation for new features

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **React Native** team for the excellent framework
- **Expo** team for simplifying mobile development  
- **GitHub** for heatmap inspiration
- **Zustand** for elegant state management

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/KyleNewbigging/OnTrack/issues)
- **Discussions**: [GitHub Discussions](https://github.com/KyleNewbigging/OnTrack/discussions)

---

**Built with ❤️ using React Native and Expo**
