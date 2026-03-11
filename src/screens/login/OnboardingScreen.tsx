import React, { useState, useEffect } from "react";
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
import { RootStackParamList } from "../../navigation/AppNavigator";
import { register, getMe } from "../../api";
import { COLORS, SPACING, TYPOGRAPHY } from "../../components/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Onboarding">;

function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function OnboardingScreen({ navigation }: Props) {
  const [displayName, setDisplayName] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slugEdited) {
      setOrgSlug(slugify(orgName));
    }
  }, [orgName, slugEdited]);

  const slugValid =
    orgSlug.length >= 3 && /^[a-z0-9-]+$/.test(orgSlug);
  const canSubmit =
    displayName.trim().length > 0 &&
    orgName.trim().length > 0 &&
    slugValid;

  const handleRegister = async () => {
    if (!canSubmit) return;
    setIsLoading(true);
    setError(null);
    try {
      await register({
        organizationName: orgName.trim(),
        organizationSlug: orgSlug.trim(),
        displayName: displayName.trim() || undefined,
      });
      // Fetch /auth/me to get the actual org status (register response is flat)
      try {
        const me = await getMe();
        const orgStatus = me.organization?.status ?? "ACTIVE";
        if (orgStatus === "PENDING") {
          navigation.reset({ index: 0, routes: [{ name: "PendingApproval" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
        }
      } catch {
        // Default to Dashboard — orgs are auto-approved
        navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
      }
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
          value={displayName}
          onChangeText={setDisplayName}
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

        <TextInput
          style={[styles.input, !slugValid && orgSlug.length > 0 && styles.inputError]}
          placeholder="Organization slug"
          placeholderTextColor={COLORS.textSecondary}
          value={orgSlug}
          onChangeText={(v) => {
            setOrgSlug(v.toLowerCase().replace(/[^a-z0-9-]/g, ""));
            setSlugEdited(true);
          }}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Lowercase letters, numbers, hyphens only (min 3 chars)
        </Text>

        {isLoading ? (
          <ActivityIndicator
            color={COLORS.primary}
            size="large"
            style={styles.button}
          />
        ) : (
          <TouchableOpacity
            style={[styles.button, !canSubmit && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={!canSubmit}
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
    marginBottom: SPACING.xs,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  hint: {
    width: "100%",
    fontSize: 11,
    color: COLORS.textSecondary,
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
