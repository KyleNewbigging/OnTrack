import React from "react";
import { Text, View } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type InfoSectionProps = {
  title: string;
  body: string[];
};

const sectionStyle = {
  borderWidth: 1,
  borderRadius: 12,
  padding: 14,
  gap: 8,
} as const;

export default function InfoSection({ title, body }: InfoSectionProps) {
  const { theme } = useTheme();

  return (
    <View style={{ ...sectionStyle, borderColor: theme.border, backgroundColor: theme.surface }}>
      <Text style={{ fontSize: 16, fontWeight: "700", color: theme.text }}>{title}</Text>
      {body.map((paragraph) => (
        <Text key={paragraph} style={{ color: theme.textSecondary, lineHeight: 22 }}>
          {paragraph}
        </Text>
      ))}
    </View>
  );
}
