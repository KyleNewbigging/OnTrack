import React from "react";
import { View, Text } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { Goal } from "../types";
import { format } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";

interface RadarChartProps {
  goals: Goal[];
  size?: number;
}

export default function RadarChart({ goals, size = 200 }: RadarChartProps) {
  const { theme, isDark } = useTheme();
  
  if (goals.length === 0) {
    return (
      <View style={{ 
        width: size, 
        height: size, 
        justifyContent: "center", 
        alignItems: "center",
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 10,
        backgroundColor: theme.surface
      }}>
        <Text style={{ color: theme.textSecondary, fontSize: 14 }}>No goals yet</Text>
        <Text style={{ color: theme.textSecondary, fontSize: 12 }}>Create goals to see radar chart</Text>
      </View>
    );
  }

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 20; // Reduced margin since no labels
  
  // Color palette for different goals
  const colors = [
    "#3b82f6", // Blue
    "#10b981", // Green  
    "#f59e0b", // Orange
    "#ef4444", // Red
    "#8b5cf6", // Purple
    "#06b6d4", // Cyan
    "#84cc16", // Lime
    "#f97316"  // Orange-red
  ];
  
  // Calculate historical completion percentage for each goal
  const goalData = goals.map((goal) => {
    if (goal.subGoals.length === 0) {
      return { title: goal.title, percentage: 0 };
    }
    
    // Calculate average completion rate across all tasks in this goal
    let totalCompletionRate = 0;
    
    goal.subGoals.forEach((subGoal) => {
      if (subGoal.completions.length === 0) {
        // No completions yet, 0% rate
        totalCompletionRate += 0;
      } else {
        // Calculate how many days this goal has existed
        const goalCreatedDate = new Date(goal.createdAt);
        const today = new Date();
        const daysSinceCreation = Math.max(1, Math.ceil((today.getTime() - goalCreatedDate.getTime()) / (1000 * 60 * 60 * 24)));
        
        // Calculate completion rate based on frequency
        let expectedCompletions;
        if (subGoal.frequency === 'daily') {
          expectedCompletions = daysSinceCreation;
        } else if (subGoal.frequency === 'weekly') {
          expectedCompletions = Math.ceil(daysSinceCreation / 7);
        } else { // 'once'
          expectedCompletions = 1;
        }
        
        // Calculate actual completion rate (cap at 100%)
        const completionRate = Math.min(1.0, subGoal.completions.length / expectedCompletions);
        totalCompletionRate += completionRate;
      }
    });
    
    const percentage = totalCompletionRate / goal.subGoals.length;
    return { title: goal.title, percentage };
  });

  const angleStep = (2 * Math.PI) / goalData.length;

  // Generate points for the data polygon
  const dataPoints = goalData.map((data, index) => {
    const angle = index * angleStep - Math.PI / 2; // Start from top
    const distance = data.percentage * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return { x, y, angle, distance, ...data };
  });

  // Generate grid circles (50%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const labeledLevels = [0.5, 1.0]; // Only show labels for 50% and 100%

  // Generate axis lines and labels
  const axisPoints = goalData.map((data, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const endX = centerX + Math.cos(angle) * radius;
    const endY = centerY + Math.sin(angle) * radius;
    
    // Calculate label position (slightly outside the circle)
    const labelRadius = radius + 15;
    const labelX = centerX + Math.cos(angle) * labelRadius;
    const labelY = centerY + Math.sin(angle) * labelRadius;
    
    return {
      endX,
      endY,
      labelX,
      labelY,
      angle,
      title: data.title
    };
  });

  // Create polygon path string
  const polygonPoints = dataPoints.map(point => `${point.x},${point.y}`).join(' ');

  return (
    <View style={{ 
      borderWidth: 1, 
      borderColor: theme.border, 
      borderRadius: 10, 
      padding: 16,
      backgroundColor: theme.surface,
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12, color: theme.text }}>
        Goal Consistency Overview
      </Text>
      
      <Svg width={size} height={size}>
        {/* Grid circles */}
        {gridLevels.map((level, index) => (
          <Circle
            key={index}
            cx={centerX}
            cy={centerY}
            r={radius * level}
            fill="transparent"
            stroke={theme.border}
            strokeWidth={1}
          />
        ))}

        {/* Axis lines */}
        {axisPoints.map((axis, index) => (
          <Line
            key={`axis-${index}`}
            x1={centerX}
            y1={centerY}
            x2={axis.endX}
            y2={axis.endY}
            stroke={theme.border}
            strokeWidth={1}
          />
        ))}

        {/* Data polygon */}
        {dataPoints.length >= 3 && (
          <Polygon
            points={polygonPoints}
            fill={isDark ? "rgba(59, 130, 246, 0.3)" : "rgba(59, 130, 246, 0.2)"}
            stroke={theme.primary}
            strokeWidth={2}
          />
        )}

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={colors[index % colors.length]}
            stroke={theme.surface}
            strokeWidth={2}
          />
        ))}



        {/* Percentage labels on grid - only 50% and 100% */}
        {labeledLevels.map((level, index) => (
          <SvgText
            key={`grid-label-${index}`}
            x={centerX + 5}
            y={centerY - (radius * level)}
            fontSize="10"
            fill={theme.textSecondary}
            textAnchor="start"
          >
            {Math.round(level * 100)}%
          </SvgText>
        ))}
      </Svg>

      {/* Legend */}
      <View style={{ marginTop: 12, flexDirection: "row", flexWrap: "wrap", justifyContent: "center" }}>
        {goalData.map((data, index) => (
          <View key={index} style={{ 
            flexDirection: "row", 
            alignItems: "center", 
            marginHorizontal: 6, 
            marginVertical: 2 
          }}>
            <View style={{
              width: 10,
              height: 10,
              backgroundColor: colors[index % colors.length],
              borderRadius: 5,
              borderWidth: 1,
              borderColor: theme.surface,
              marginRight: 4
            }} />
            <Text style={{ fontSize: 10, color: theme.textSecondary }}>
              {data.title}: {Math.round(data.percentage * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
