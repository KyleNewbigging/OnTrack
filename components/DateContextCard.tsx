import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";

interface DateContextCardProps {
  selectedDate: Date;
  onPress: () => void;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

export default function DateContextCard({ selectedDate, onPress, onPreviousDay, onNextDay }: DateContextCardProps) {
  const { theme } = useTheme();
  const viewingToday = isToday(selectedDate);

  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: theme.primary + "40",
        borderRadius: 14,
        padding: 14,
        backgroundColor: theme.surface,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 12, flex: 1 }}>
          <View
            style={{
              width: 38,
              height: 38,
              borderRadius: 19,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: theme.primary + "15",
            }}
          >
            <Ionicons name="calendar-outline" size={18} color={theme.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: "600", textTransform: "uppercase", letterSpacing: 0.6 }}>
              Tracking Date
            </Text>
            <Text style={{ color: theme.text, fontSize: 16, fontWeight: "700", marginTop: 2 }}>
              {format(selectedDate, "EEEE, MMM d, yyyy")}
            </Text>
            <Text style={{ color: theme.textSecondary, marginTop: 2 }}>
              {viewingToday ? "Tap to switch days" : "Viewing and editing this day"}
            </Text>
          </View>
        </View>
        <Pressable
          onPress={onPress}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
        </Pressable>
      </View>

      <View style={{ flexDirection: "row", gap: 10 }}>
        <Pressable
          onPress={onPreviousDay}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 10,
            paddingVertical: 10,
          }}
        >
          <Ionicons name="chevron-back" size={16} color={theme.text} />
          <Text style={{ color: theme.text, fontWeight: "700" }}>Previous</Text>
        </Pressable>

        <Pressable
          onPress={onNextDay}
          disabled={viewingToday}
          style={{
            flex: 1,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            backgroundColor: theme.background,
            borderWidth: 1,
            borderColor: theme.border,
            borderRadius: 10,
            paddingVertical: 10,
            opacity: viewingToday ? 0.45 : 1,
          }}
        >
          <Text style={{ color: theme.text, fontWeight: "700" }}>Next</Text>
          <Ionicons name="chevron-forward" size={16} color={theme.text} />
        </Pressable>
      </View>
    </View>
  );
}
