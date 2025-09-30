import React from "react";
import { View, Text } from "react-native";
import Svg, { Polygon, Line, Circle, Text as SvgText } from "react-native-svg";
import { Goal } from "../types";
import { format } from "date-fns";

interface RadarChartProps {
  goals: Goal[];
  size?: number;
}

export default function RadarChart({ goals, size = 200 }: RadarChartProps) {
  if (goals.length === 0) {
    return (
      <View style={{ 
        width: size, 
        height: size, 
        justifyContent: "center", 
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 10,
        backgroundColor: "#f9fafb"
      }}>
        <Text style={{ color: "#6b7280", fontSize: 14 }}>No goals yet</Text>
        <Text style={{ color: "#9ca3af", fontSize: 12 }}>Create goals to see radar chart</Text>
      </View>
    );
  }

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = (size / 2) - 40; // Leave margin for labels
  const today = format(new Date(), "yyyy-MM-dd");

  // Calculate completion percentage for each goal today
  const goalData = goals.map((goal) => {
    if (goal.subGoals.length === 0) {
      return { title: goal.title, percentage: 0 };
    }
    
    const completedToday = goal.subGoals.filter(subGoal => 
      subGoal.completions.includes(today)
    ).length;
    
    const percentage = completedToday / goal.subGoals.length;
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

  // Generate grid circles (25%, 50%, 75%, 100%)
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

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
      borderColor: "#e5e7eb", 
      borderRadius: 10, 
      padding: 16,
      backgroundColor: "white",
      alignItems: "center"
    }}>
      <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 12 }}>
        Today's Goal Progress
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
            stroke="#f3f4f6"
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
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        ))}

        {/* Data polygon */}
        {dataPoints.length >= 3 && (
          <Polygon
            points={polygonPoints}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth={2}
          />
        )}

        {/* Data points */}
        {dataPoints.map((point, index) => (
          <Circle
            key={`point-${index}`}
            cx={point.x}
            cy={point.y}
            r={4}
            fill="#3b82f6"
          />
        ))}

        {/* Goal labels */}
        {axisPoints.map((axis, index) => {
          // Truncate long goal names
          const displayTitle = axis.title.length > 8 
            ? axis.title.substring(0, 8) + '...' 
            : axis.title;
          
          return (
            <SvgText
              key={`label-${index}`}
              x={axis.labelX}
              y={axis.labelY}
              fontSize="12"
              fill="#374151"
              textAnchor="middle"
              alignmentBaseline="central"
            >
              {displayTitle}
            </SvgText>
          );
        })}

        {/* Percentage labels on grid */}
        {gridLevels.map((level, index) => (
          <SvgText
            key={`grid-label-${index}`}
            x={centerX + 5}
            y={centerY - (radius * level)}
            fontSize="10"
            fill="#9ca3af"
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
              width: 8,
              height: 8,
              backgroundColor: "#3b82f6",
              borderRadius: 4,
              marginRight: 4
            }} />
            <Text style={{ fontSize: 10, color: "#6b7280" }}>
              {data.title}: {Math.round(data.percentage * 100)}%
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
