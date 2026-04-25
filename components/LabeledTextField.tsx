import React from "react";
import { Text, TextInput } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

type LabeledTextFieldProps = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
};

export default function LabeledTextField({
  label,
  placeholder,
  value,
  onChangeText,
}: LabeledTextFieldProps) {
  const { theme } = useTheme();

  return (
    <>
      <Text style={{ fontWeight: "700", fontSize: 16, color: theme.text }}>{label}</Text>
      <TextInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        style={{
          borderWidth: 1,
          borderColor: theme.border,
          borderRadius: 8,
          padding: 10,
          backgroundColor: theme.surface,
          color: theme.text,
        }}
        placeholderTextColor={theme.textSecondary}
      />
    </>
  );
}
