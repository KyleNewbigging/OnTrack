import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { format, isToday } from "date-fns";
import { useTheme } from "../contexts/ThemeContext";

interface DateContextCardProps {
  selectedDate: Date;
  onPress: () => void;
}

export default function DateContextCard({ selectedDate, onPress }: DateContextCardProps) {
  const { theme } = useTheme();
  const viewingToday = isToday(selectedDate);

  return (
    <Pressable
      onPress={onPress}
      style={{
        borderWidth: 1,
        borderColor: theme.primary + "40",
        borderRadius: 14,
        padding: 14,
        backgroundColor: theme.surface,
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
        <Ionicons name="chevron-forward" size={18} color={theme.textSecondary} />
      </View>
    </Pressable>
  );
}
