import React, { useRef, useEffect } from "react";
import { View, ScrollView, Text } from "react-native";
import Svg, { Rect, Circle } from "react-native-svg";
import { addDays, format, subDays } from "date-fns";
import { useThemeColors } from "../theme";

interface HMProps {
  startOffsetDays?: number;
  values: Record<string, number>;
}

export default function Heatmap({ startOffsetDays = 120, values }: HMProps) {
  const colors = useThemeColors();
  const scrollViewRef = useRef<ScrollView>(null);
  const today = new Date();
  const start = subDays(today, startOffsetDays);

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: false });
    }, 100);

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

  const monthPositions: Array<{ month: string; x: number }> = [];
  let currentMonth = "";

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
    if (n <= 0) return colors.surfaceMuted;
    if (n === 1) return colors.accentMuted;
    if (n === 2) return colors.accent;
    return colors.success;
  };

  const todayKey = format(today, "yyyy-MM-dd");

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        padding: 8,
        backgroundColor: colors.surface,
      }}
    >
      <ScrollView
        ref={scrollViewRef}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ alignItems: "flex-start" }}
      >
        <View>
          <View style={{ height: monthLabelHeight, position: "relative", marginBottom: 4 }}>
            {monthPositions.map((pos, index) => (
              <Text
                key={`${pos.month}-${index}`}
                style={{
                  position: "absolute",
                  left: pos.x,
                  fontSize: 10,
                  color: colors.textMuted,
                  fontWeight: "600",
                }}
              >
                {pos.month}
              </Text>
            ))}
          </View>

          <Svg width={width} height={height}>
            {days.map((d, i) => {
              const col = Math.floor(i / 7);
              const row = i % 7;
              const x = gap + col * (cell + gap);
              const y = gap + row * (cell + gap);
              const count = values[d] || 0;
              const isToday = d === todayKey;

              return (
                <React.Fragment key={d}>
                  <Rect
                    x={x}
                    y={y}
                    width={cell}
                    height={cell}
                    rx={3}
                    fill={scale(count)}
                    stroke={isToday ? colors.accent : "transparent"}
                    strokeWidth={isToday ? 2 : 0}
                  />
                  {isToday && (
                    <Circle
                      cx={x + cell / 2}
                      cy={y + cell / 2}
                      r={2}
                      fill={colors.accent}
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
