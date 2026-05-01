import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import LabeledTextField from "./LabeledTextField";
import { buildDefaultUsername, getAccountDraftErrors, isValidAccountDraft, sanitizeUsernameInput } from "../account";

type AccountSetupScreenProps = {
  onSubmit: (input: {
    displayName: string;
    username: string;
    email: string;
    password: string;
  }) => void;
  hasExistingData: boolean;
};

export default function AccountSetupScreen({ onSubmit, hasExistingData }: AccountSetupScreenProps) {
  const { theme } = useTheme();
  const [displayName, setDisplayName] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = React.useState(false);

  const errors = getAccountDraftErrors(displayName, username, email, password, confirmPassword);
  const isValid = isValidAccountDraft(displayName, username, email, password, confirmPassword);
  const passwordFieldTextContentType = Platform.OS === "ios" && showPassword ? "oneTimeCode" : "newPassword";
  const confirmPasswordTextContentType = Platform.OS === "ios" && showConfirmPassword ? "oneTimeCode" : "password";

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, padding: 24, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          <View style={{ gap: 18 }}>
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 44,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.border,
                alignSelf: "center",
              }}
            >
              <Ionicons name="person-circle-outline" size={42} color={theme.primary} />
            </View>

            <View style={{ gap: 10 }}>
              <Text style={{ color: theme.text, fontSize: 28, fontWeight: "800", textAlign: "center" }}>
                Welcome! Let&apos;s set up an account.
              </Text>
              <Text style={{ color: theme.textSecondary, fontSize: 15, lineHeight: 22, textAlign: "center" }}>
                {hasExistingData
                  ? "Your current goals and history will stay on this device and be linked to this profile."
                  : "Create your profile now so your goals are linked to you from the start."}
              </Text>
            </View>

            <View style={{ gap: 14 }}>
              <LabeledTextField
                label="Display name"
                value={displayName}
                onChangeText={(text) => {
                  setDisplayName(text);
                  if (!username.trim()) {
                    setUsername(buildDefaultUsername(text));
                  }
                }}
                placeholder="Adam"
                autoCapitalize="words"
                textContentType="name"
                returnKeyType="next"
                errorText={attemptedSubmit ? errors.displayName : undefined}
              />
              <LabeledTextField
                label="Username"
                value={username}
                onChangeText={(text) => setUsername(sanitizeUsernameInput(text))}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="adam"
                textContentType="username"
                autoComplete="username"
                returnKeyType="next"
                helpText="3-32 characters. Letters, numbers, periods, underscores, and hyphens are allowed."
                errorText={attemptedSubmit ? errors.username : undefined}
              />
              <LabeledTextField
                label="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="adam@example.com"
                textContentType="emailAddress"
                autoComplete="email"
                keyboardType="email-address"
                returnKeyType="next"
                errorText={attemptedSubmit ? errors.email : undefined}
              />
              <LabeledTextField
                label="Password"
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Choose a password"
                textContentType={passwordFieldTextContentType}
                autoComplete="new-password"
                passwordRules="minlength: 10; required: lower; required: upper; required: digit;"
                secureTextEntry={!showPassword}
                returnKeyType="next"
                selectTextOnFocus={Platform.OS === "ios"}
                contextMenuHidden={false}
                helpText="Use at least 10 characters with at least one letter and one number."
                errorText={attemptedSubmit ? errors.password : undefined}
                accessoryLabel={showPassword ? "Hide password" : "Show password"}
                onAccessoryPress={() => setShowPassword((current) => !current)}
              />
              <LabeledTextField
                label="Confirm password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                placeholder="Re-enter your password"
                textContentType={confirmPasswordTextContentType}
                autoComplete="off"
                secureTextEntry={!showConfirmPassword}
                returnKeyType="done"
                selectTextOnFocus={Platform.OS === "ios"}
                contextMenuHidden={false}
                errorText={attemptedSubmit ? errors.confirmPassword : undefined}
                accessoryLabel={showConfirmPassword ? "Hide password" : "Show password"}
                onAccessoryPress={() => setShowConfirmPassword((current) => !current)}
              />
            </View>

            <Pressable
              onPress={() => {
                setAttemptedSubmit(true);
                if (!isValid) {
                  return;
                }

                onSubmit({ displayName, username, email, password });
              }}
              style={{
                backgroundColor: isValid ? theme.primary : theme.border,
                borderRadius: 999,
                paddingHorizontal: 18,
                paddingVertical: 14,
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <Text style={{ color: theme.background, fontWeight: "700", fontSize: 16 }}>Continue</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
