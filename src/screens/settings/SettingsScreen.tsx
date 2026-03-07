import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { getMe } from "../../api";
import { getBackendChoice, setBackendChoice } from "../../store/backend";
import { AuthUser, BackendChoice, BACKEND_CONFIG } from "../../models";
import { resetApiClient } from "../../api";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLE,
} from "../../components/theme";
import AppHeader from "../../components/AppHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBackend, setSelectedBackend] = useState<BackendChoice>(
    BackendChoice.JS,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [meData, choice] = await Promise.all([getMe(), getBackendChoice()]);
      setMe(meData);
      setSelectedBackend(choice);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectBackend = async (choice: BackendChoice) => {
    setSelectedBackend(choice);
    await setBackendChoice(choice);
    resetApiClient();
  };

  const handleSignOut = async () => {
    resetApiClient();
    await auth().signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={styles.root}>
      <AppHeader title="Settings" showBack />
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.loader}
        />
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Account card */}
          <Text style={styles.sectionHeader}>Account</Text>
          <View style={styles.card}>
            <Text style={styles.accountName}>{me?.name ?? me?.email}</Text>
            <Text style={styles.accountEmail}>{me?.email}</Text>
            <Text style={styles.accountRole}>Role: {me?.role}</Text>
          </View>

          {/* Backend card */}
          <Text style={styles.sectionHeader}>Backend</Text>
          <View style={styles.card}>
            <Text style={styles.backendDesc}>
              Select which API backend to connect to. Takes effect on next
              restart.
            </Text>
            {(Object.values(BackendChoice) as BackendChoice[]).map((choice) => (
              <TouchableOpacity
                key={choice}
                style={styles.radioRow}
                onPress={() => handleSelectBackend(choice)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    selectedBackend === choice && styles.radioSelected,
                  ]}
                />
                <View style={styles.radioLabels}>
                  <Text style={styles.radioLabel}>
                    {BACKEND_CONFIG[choice].label}
                  </Text>
                  <Text style={styles.radioUrl}>
                    {BACKEND_CONFIG[choice].baseUrl}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.spacer} />

          <TouchableOpacity style={styles.signOutBtn} onPress={handleSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: SPACING.xxl },
  container: { padding: SPACING.lg, gap: SPACING.md },
  sectionHeader: {
    ...TYPOGRAPHY.labelSmall,
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: SPACING.sm,
    color: COLORS.primary,
  },
  card: { ...CARD_STYLE, gap: SPACING.xs },
  accountName: { ...TYPOGRAPHY.bodyLarge, fontWeight: "600" },
  accountEmail: { ...TYPOGRAPHY.bodySmall },
  accountRole: { ...TYPOGRAPHY.bodyMedium, marginTop: SPACING.xs },
  backendDesc: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  radioRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginTop: 2,
  },
  radioSelected: { backgroundColor: COLORS.primary },
  radioLabels: { flex: 1 },
  radioLabel: { ...TYPOGRAPHY.bodyMedium, fontWeight: "500" },
  radioUrl: { fontSize: 11, color: COLORS.textSecondary, marginTop: 2 },
  spacer: { height: SPACING.xl },
  signOutBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    marginBottom: SPACING.xl,
  },
  signOutText: { color: COLORS.primary, fontSize: 16, fontWeight: "600" },
  errorCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 8,
  },
  errorText: { color: COLORS.error, fontSize: 14 },
});
