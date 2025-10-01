import React from "react";
import { View, Text } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { Goal } from "../types";
import { useThemeColors } from "../theme";

interface RadarChartProps {
  goals: Goal[];
  size?: number;
}

const GOAL_COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#84cc16",
  "#f97316",
];

export default function RadarChart({ goals, size = 200 }: RadarChartProps) {
  const colors = useThemeColors();

  if (goals.length === 0) {
    return (
      <View
        style={{
          width: size,
          height: size,
          justifyContent: "center",
          alignItems: "center",
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 12,
          backgroundColor: colors.surface,
          gap: 4,
        }}
      >
        <Text style={{ color: colors.textMuted, fontSize: 14 }}>No goals yet</Text>
        <Text style={{ color: colors.textMuted, fontSize: 12 }}>
          Create goals to see radar insights
        </Text>
      </View>
    );
  }

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 20;

  const goalData = goals.map((goal) => {
    if (goal.subGoals.length === 0) {
      return { title: goal.title, percentage: 0 };
    }

    let totalCompletionRate = 0;
    const today = new Date();

    goal.subGoals.forEach((subGoal) => {
      if (subGoal.completions.length === 0) {
        totalCompletionRate += 0;
        return;
      }

      const goalCreatedDate = new Date(goal.createdAt);
      const daysSinceCreation = Math.max(
        1,
        Math.ceil((today.getTime() - goalCreatedDate.getTime()) / (1000 * 60 * 60 * 24))
      );

      let expectedCompletions;
      if (subGoal.frequency === "daily") {
        expectedCompletions = daysSinceCreation;
      } else if (subGoal.frequency === "weekly") {
        expectedCompletions = Math.ceil(daysSinceCreation / 7);
      } else {
        expectedCompletions = 1;
      }

      const completionRate = Math.min(1, subGoal.completions.length / expectedCompletions);
      totalCompletionRate += completionRate;
    });

    const percentage = totalCompletionRate / goal.subGoals.length;
    return { title: goal.title, percentage };
  });

  const angleStep = (2 * Math.PI) / goalData.length;

  const dataPoints = goalData.map((data, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const distance = data.percentage * radius;
    const x = centerX + Math.cos(angle) * distance;
    const y = centerY + Math.sin(angle) * distance;
    return { x, y };
  });

  const gridLevels = [0.25, 0.5, 0.75, 1.0];
  const labeledLevels = [0.5, 1.0];

  const axisPoints = goalData.map((data, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const endX = centerX + Math.cos(angle) * radius;
    const endY = centerY + Math.sin(angle) * radius;

    const labelRadius = radius + 15;
    const labelX = centerX + Math.cos(angle) * labelRadius;
    const labelY = centerY + Math.sin(angle) * labelRadius;

    return {
      endX,
      endY,
      labelX,
      labelY,
      title: data.title,
    };
  });

  const polygonPoints = dataPoints.map((point) => `${point.x},${point.y}`).join(" ");

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 16,
        backgroundColor: colors.surface,
        alignItems: "center",
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "700", color: colors.text }}>
        Goal Consistency Overview
      </Text>

      <Svg width={size} height={size}>
        {gridLevels.map((level, index) => (
          <Circle
            key={`grid-${index}`}
            cx={centerX}
            cy={centerY}
            r={radius * level}
            fill="transparent"
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}

        {axisPoints.map((axis, index) => (
          <Line
            key={`axis-${index}`}
            x1={centerX}
            y1={centerY}
            x2={axis.endX}
            y2={axis.endY}
            stroke={colors.border}
            strokeWidth={1}
          />
        ))}

        {dataPoints.length >= 3 && (
          <Polygon
            points={polygonPoints}
            fill="rgba(56, 189, 248, 0.2)"
            stroke={colors.accent}
            strokeWidth={2}
          />
        )}

        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={5}
            fill={GOAL_COLORS[index % GOAL_COLORS.length]}
            stroke={colors.surface}
            strokeWidth={2}
          />
        ))}

        {labeledLevels.map((level, index) => (
          <SvgText
            key={`grid-label-${index}`}
            x={centerX + 5}
            y={centerY - radius * level}
            fontSize="10"
            fill={colors.textMuted}
            textAnchor="start"
          >
            {Math.round(level * 100)}%
          </SvgText>
        ))}
      </Svg>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: 8,
        }}
      >
        {goalData.map((data, index) => (
          <View
            key={data.title}
            style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
          >
            <View
              style={{
                width: 10,
                height: 10,
                backgroundColor: GOAL_COLORS[index % GOAL_COLORS.length],
                borderRadius: 5,
                borderWidth: 1,
                borderColor: colors.surface,
              }}
            />
            <Text style={{ fontSize: 10, color: colors.textMuted }}>
              {data.title}: {Math.round(data.percentage * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
