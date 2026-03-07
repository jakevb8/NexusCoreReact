import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { getMe } from "../../api";
import { getBackendChoice, setBackendChoice } from "../../store/backend";
import { BackendChoice, BACKEND_CONFIG, OrgStatus } from "../../models";
import { COLORS, SPACING, TYPOGRAPHY } from "../../components/theme";

type Props = NativeStackScreenProps<RootStackParamList, "Login">;

GoogleSignin.configure({
  webClientId: "797114794124-PLACEHOLDER.apps.googleusercontent.com",
});

export default function LoginScreen({ navigation }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBackend, setSelectedBackend] = useState<BackendChoice>(
    BackendChoice.JS,
  );

  useEffect(() => {
    getBackendChoice().then(setSelectedBackend);
  }, []);

  const handleSelectBackend = async (choice: BackendChoice) => {
    setSelectedBackend(choice);
    await setBackendChoice(choice);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await GoogleSignin.hasPlayServices();
      const signInResult = await GoogleSignin.signIn();
      const idToken = signInResult.data?.idToken;
      if (!idToken) throw new Error("No ID token returned");
      const credential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(credential);

      // Check user in DB
      try {
        const me = await getMe();
        if (me.orgStatus === OrgStatus.PENDING) {
          navigation.reset({ index: 0, routes: [{ name: "PendingApproval" }] });
        } else {
          navigation.reset({ index: 0, routes: [{ name: "Dashboard" }] });
        }
      } catch (apiErr: any) {
        if (apiErr?.response?.status === 404) {
          navigation.reset({ index: 0, routes: [{ name: "Onboarding" }] });
        } else {
          throw apiErr;
        }
      }
    } catch (err: any) {
      setError(err?.message ?? "Sign-in failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>NexusCore</Text>
      <Text style={styles.subtitle}>Resource Management</Text>

      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Backend</Text>
        <View style={styles.chipRow}>
          {(Object.values(BackendChoice) as BackendChoice[]).map((choice) => (
            <TouchableOpacity
              key={choice}
              style={[
                styles.chip,
                selectedBackend === choice && styles.chipSelected,
              ]}
              onPress={() => handleSelectBackend(choice)}
            >
              <Text
                style={[
                  styles.chipText,
                  selectedBackend === choice && styles.chipTextSelected,
                ]}
              >
                {BACKEND_CONFIG[choice].label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.button}
        />
      ) : (
        <TouchableOpacity style={styles.button} onPress={handleGoogleSignIn}>
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>
      )}

      {error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
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
    fontSize: 32,
    fontWeight: "700",
    color: COLORS.primary,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xxl,
  },
  section: {
    width: "100%",
    marginBottom: SPACING.xxl,
  },
  sectionLabel: {
    ...TYPOGRAPHY.titleMedium,
    marginBottom: SPACING.sm,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextSelected: {
    color: COLORS.onPrimary,
  },
  button: {
    width: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.lg,
    alignItems: "center",
    marginTop: SPACING.md,
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
