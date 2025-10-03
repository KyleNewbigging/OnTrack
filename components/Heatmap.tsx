import React, { useRef, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { addDays, format, subDays, startOfMonth, isSameMonth } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";

interface HMProps {
  startOffsetDays?: number;            // how many days back to show
  values: Record<string, number>;      // yyyy-MM-dd -> count
}

export default function Heatmap({ startOffsetDays = 120, values }: HMProps) {
  const scrollViewRef = useRef<ScrollView>(null);
  const { theme, isDark } = useTheme();
  const today = new Date();
  const start = subDays(today, startOffsetDays);

  // Auto-scroll to the right (most recent days) when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100); // Small delay to ensure the component is fully rendered

    return () => clearTimeout(timer);
  }, []);

  const days: string[] = [];
  for (let d = new Date(start); d <= today; d = addDays(d, 1)) {
    days.push(format(d, "yyyy-MM-dd"));
  }

  const cols = Math.ceil(days.length / 7);
  const cell = 14;
  const gap = 2;
  const width = cols * (cell + gap) + gap;
  const height = 7 * (cell + gap) + gap;
  const monthLabelHeight = 20;

  // Calculate month boundaries
  const monthPositions: Array<{ month: string; x: number }> = [];
  let currentMonth = '';
  
  days.forEach((d, i) => {
    const date = new Date(d);
    const monthYear = format(date, "MMM");
    const col = Math.floor(i / 7);
    
    if (monthYear !== currentMonth) {
      currentMonth = monthYear;
      const x = gap + col * (cell + gap);
      monthPositions.push({ month: monthYear, x });
    }
  });

  const scale = (n: number) => {
    if (n <= 0) return theme.border;

    return "#2aed72ff";
  };

  return (
    <View style={{ borderWidth: 1, borderColor: theme.border, borderRadius: 10, padding: 8 }}>
      <ScrollView 
        ref={scrollViewRef}
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "flex-start" }}
      >
        <View>
          {/* Month labels */}
          <View style={{ height: monthLabelHeight, position: "relative", marginBottom: 4 }}>
            {monthPositions.map((pos, index) => (
              <Text
                key={`${pos.month}-${index}`}
                style={{
                  position: "absolute",
                  left: pos.x,
                  fontSize: 10,
                  color: theme.textSecondary,
                  fontWeight: "500",
                }}
              >
                {pos.month}
              </Text>
            ))}
          </View>
          
          {/* Heatmap grid */}
          <Svg width={width} height={height}>
            {days.map((d, i) => {
              const col = Math.floor(i / 7);
              const row = i % 7;
              const x = gap + col * (cell + gap);
              const y = gap + row * (cell + gap);
              const n = values[d] || 0;
              const isToday = d === format(today, "yyyy-MM-dd");
              
              return (
                <React.Fragment key={d}>
                  <Rect 
                    x={x} 
                    y={y} 
                    width={cell} 
                    height={cell} 
                    rx={3} 
                    fill={scale(n)}
                    stroke={isToday ? theme.primary : "transparent"}
                    strokeWidth={isToday ? 2 : 0}
                  />
                  {isToday && (
                    <Circle
                      cx={x + cell/2}
                      cy={y + cell/2}
                      r={2}
                      fill={theme.primary}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </Svg>
        </View>
      </ScrollView>
    </View>
  );
}
