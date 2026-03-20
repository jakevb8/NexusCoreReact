import React, { useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Modal,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { useSettings } from "../../hooks/useSettings";
import { BackendChoice, BACKEND_CONFIG } from "../../models";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLE,
} from "../../components/theme";
import AppHeader from "../../components/AppHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Settings">;

export default function SettingsScreen({ navigation }: Props) {
  const {
    me,
    isLoading,
    selectedBackend,
    error,
    showDeleteConfirm,
    isDeletingAccount,
    load,
    handleSelectBackend,
    handleSignOut,
    handleDeleteAccount,
    setShowDeleteConfirm,
  } = useSettings();

  useEffect(() => {
    load();
  }, []);

  const onSignOut = async () => {
    await handleSignOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const onDeleteAccount = async () => {
    const success = await handleDeleteAccount();
    if (success) {
      navigation.reset({ index: 0, routes: [{ name: "Login" }] });
    }
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
            <Text style={styles.accountName}>
              {me?.displayName ?? me?.email}
            </Text>
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

          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          {/* Danger Zone */}
          <Text style={[styles.sectionHeader, styles.dangerHeader]}>
            Danger Zone
          </Text>
          <View style={[styles.card, styles.dangerCard]}>
            <Text style={styles.dangerDesc}>
              Permanently delete your account. If you are the last member of
              your organization, the organization and all its assets will also
              be deleted.
            </Text>
            <TouchableOpacity
              style={styles.deleteBtn}
              onPress={() => setShowDeleteConfirm(true)}
            >
              <Text style={styles.deleteBtnText}>Delete Account</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.spacer} />
        </ScrollView>
      )}

      {/* Delete confirmation modal */}
      <Modal
        visible={showDeleteConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDeleteConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Delete Account?</Text>
            <Text style={styles.modalBody}>This will permanently delete:</Text>
            <Text style={styles.modalBullet}>• Your profile and account</Text>
            <Text style={styles.modalBullet}>
              • Your organization and all its assets (if you are the last
              member)
            </Text>
            <Text style={styles.modalBullet}>• All pending invites</Text>
            <Text style={[styles.modalBody, styles.modalBodySpacing]}>
              This action cannot be undone.
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setShowDeleteConfirm(false)}
                disabled={isDeletingAccount}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.confirmDeleteBtn,
                  isDeletingAccount && styles.btnDisabled,
                ]}
                onPress={onDeleteAccount}
                disabled={isDeletingAccount}
              >
                <Text style={styles.confirmDeleteText}>
                  {isDeletingAccount ? "Deleting..." : "Delete"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  dangerHeader: { color: COLORS.error },
  card: { ...CARD_STYLE, gap: SPACING.xs },
  dangerCard: { borderColor: COLORS.error, borderWidth: 1 },
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
  dangerDesc: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  deleteBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: SPACING.md,
    alignItems: "center",
  },
  deleteBtnText: { color: COLORS.error, fontSize: 15, fontWeight: "600" },
  errorCard: {
    padding: SPACING.md,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 8,
  },
  errorText: { color: COLORS.error, fontSize: 14 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  modalBox: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    width: "100%",
    gap: SPACING.xs,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.onBackground,
    marginBottom: SPACING.sm,
  },
  modalBody: { ...TYPOGRAPHY.bodyMedium, color: COLORS.onBackground },
  modalBodySpacing: { marginTop: SPACING.sm },
  modalBullet: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    paddingLeft: SPACING.sm,
  },
  modalActions: {
    flexDirection: "row",
    gap: SPACING.md,
    marginTop: SPACING.lg,
    justifyContent: "flex-end",
  },
  cancelBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  cancelBtnText: { color: COLORS.primary, fontWeight: "600" },
  confirmDeleteBtn: {
    backgroundColor: COLORS.error,
    borderRadius: 8,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.lg,
  },
  confirmDeleteText: { color: "#fff", fontWeight: "600" },
  btnDisabled: { opacity: 0.5 },
});
