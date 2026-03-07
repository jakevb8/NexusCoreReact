import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { register } from "../../api";
import { COLORS, SPACING, TYPOGRAPHY } from "../../components/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

export default function OnboardingScreen({ navigation }: Props) {
  const [name, setName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !orgName.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const user = auth().currentUser;
      if (!user) throw new Error("Not signed in");
      const firebaseToken = await user.getIdToken(false);
      await register({
        firebaseToken,
        orgName: orgName.trim(),
        name: name.trim(),
        email: user.email ?? "",
      });
      navigation.reset({ index: 0, routes: [{ name: "PendingApproval" }] });
    } catch (err: any) {
      console.error("[Onboarding] register failed", err);
      setError(
        err?.response?.data?.message ?? err?.message ?? "Registration failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Create your organization</Text>

        <TextInput
          style={styles.input}
          placeholder="Your name"
          placeholderTextColor={COLORS.textSecondary}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        <TextInput
          style={styles.input}
          placeholder="Organization name"
          placeholderTextColor={COLORS.textSecondary}
          value={orgName}
          onChangeText={setOrgName}
          autoCapitalize="words"
          autoCorrect={false}
        />

        {isLoading ? (
          <ActivityIndicator
            color={COLORS.primary}
            size="large"
            style={styles.button}
          />
        ) : (
          <TouchableOpacity
            style={[
              styles.button,
              (!name.trim() || !orgName.trim()) && styles.buttonDisabled,
            ]}
            onPress={handleRegister}
            disabled={!name.trim() || !orgName.trim()}
          >
            <Text style={styles.buttonText}>Create Organization</Text>
          </TouchableOpacity>
        )}

        {error && <Text style={styles.error}>{error}</Text>}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.headlineMedium,
    marginBottom: SPACING.xl,
    textAlign: "center",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: 16,
    backgroundColor: COLORS.surface,
    color: COLORS.onBackground,
    marginBottom: SPACING.md,
  },
  button: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.onPrimary,
    fontSize: 16,
    fontWeight: "600",
  },
  error: {
    color: COLORS.error,
    fontSize: 14,
    marginTop: SPACING.md,
    textAlign: "center",
  },
});
