import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  TextInput,
  Clipboard,
  Alert,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import {
  getTeam,
  inviteMember,
  removeMember,
  updateMemberRole,
  getMe,
} from "../../api";
import { TeamMember, Role } from "../../models";
import { COLORS, SPACING, TYPOGRAPHY } from "../../components/theme";
import AppHeader from "../../components/AppHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Team">;

const ASSIGNABLE_ROLES: Role[] = [
  Role.VIEWER,
  Role.ASSET_MANAGER,
  Role.ORG_MANAGER,
];

export default function TeamScreen(_props: Props) {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const [inviteVisible, setInviteVisible] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<Role>(Role.VIEWER);
  const [inviteLoading, setInviteLoading] = useState(false);

  const [roleTarget, setRoleTarget] = useState<TeamMember | null>(null);
  const [removeTarget, setRemoveTarget] = useState<TeamMember | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [teamData, me] = await Promise.all([getTeam(), getMe()]);
      setMembers(teamData);
      setCurrentUserId(me.id);
      setIsManager(me.role === Role.ORG_MANAGER || me.role === Role.SUPERADMIN);
    } catch (err: any) {
      console.error("[Team] loadTeam failed", err);
      setError(err?.response?.data?.message ?? "Failed to load team");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleInvite = async () => {
    if (!inviteEmail.includes("@")) return;
    setInviteLoading(true);
    try {
      const res = await inviteMember(inviteEmail, inviteRole);
      setInviteVisible(false);
      setInviteEmail("");
      setInviteRole(Role.VIEWER);
      if (res.inviteLink) {
        setInviteLink(res.inviteLink);
      } else {
        setSuccessMessage("Invite email sent");
      }
    } catch (err: any) {
      console.error("[Team] invite failed", err);
      setError(err?.response?.data?.message ?? "Invite failed");
      setInviteVisible(false);
    } finally {
      setInviteLoading(false);
    }
  };

  const handleRemove = async (member: TeamMember) => {
    try {
      await removeMember(member.id);
      setSuccessMessage(`${member.displayName ?? member.email} removed`);
      load();
    } catch (err: any) {
      console.error("[Team] removeMember failed", err);
      setError(err?.response?.data?.message ?? "Remove failed");
    }
  };

  const handleRoleChange = async (member: TeamMember, role: Role) => {
    setRoleTarget(null);
    try {
      await updateMemberRole(member.id, role);
      setSuccessMessage("Role updated");
      load();
    } catch (err: any) {
      console.error("[Team] updateRole failed", err);
      setError(err?.response?.data?.message ?? "Role update failed");
    }
  };

  const rightElement = isManager ? (
    <TouchableOpacity
      onPress={() => setInviteVisible(true)}
      style={{ padding: SPACING.xs }}
    >
      <Text style={{ color: COLORS.onPrimary, fontSize: 20 }}>＋</Text>
    </TouchableOpacity>
  ) : undefined;

  return (
    <View style={styles.root}>
      <AppHeader title="Team" showBack rightElement={rightElement} />

      {/* Invite dialog */}
      <Modal
        transparent
        visible={inviteVisible}
        onRequestClose={() => setInviteVisible(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.dialog}>
            <Text style={styles.dialogTitle}>Invite Member</Text>
            <TextInput
              style={styles.dialogInput}
              placeholder="Email address"
              placeholderTextColor={COLORS.textSecondary}
              value={inviteEmail}
              onChangeText={setInviteEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.roleLabel}>Role</Text>
            {ASSIGNABLE_ROLES.map((r) => (
              <TouchableOpacity
                key={r}
                style={styles.roleOption}
                onPress={() => setInviteRole(r)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    inviteRole === r && styles.radioSelected,
                  ]}
                />
                <Text style={styles.roleOptionText}>{r}</Text>
              </TouchableOpacity>
            ))}
            <View style={styles.dialogActions}>
              <TouchableOpacity
                onPress={() => {
                  setInviteVisible(false);
                  setInviteEmail("");
                  setInviteRole(Role.VIEWER);
                }}
                style={styles.dialogBtn}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
              {inviteLoading ? (
                <ActivityIndicator color={COLORS.primary} />
              ) : (
                <TouchableOpacity
                  onPress={handleInvite}
                  disabled={!inviteEmail.includes("@")}
                  style={styles.dialogBtn}
                >
                  <Text
                    style={[
                      styles.dialogConfirmText,
                      !inviteEmail.includes("@") && { opacity: 0.4 },
                    ]}
                  >
                    Send Invite
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Role dialog */}
      {roleTarget && (
        <Modal transparent visible onRequestClose={() => setRoleTarget(null)}>
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Change Role</Text>
              {ASSIGNABLE_ROLES.map((r) => (
                <TouchableOpacity
                  key={r}
                  style={styles.roleOption}
                  onPress={() => handleRoleChange(roleTarget, r)}
                >
                  <View
                    style={[
                      styles.radioCircle,
                      roleTarget.role === r && styles.radioSelected,
                    ]}
                  />
                  <Text style={styles.roleOptionText}>{r}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setRoleTarget(null)}
                style={styles.dialogBtn}
              >
                <Text style={styles.dialogCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {/* Remove confirm dialog */}
      {removeTarget && (
        <Modal transparent visible onRequestClose={() => setRemoveTarget(null)}>
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Remove member?</Text>
              <Text style={styles.dialogBody}>
                {removeTarget.displayName ?? removeTarget.email} will be removed from
                the organization.
              </Text>
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  onPress={() => setRemoveTarget(null)}
                  style={styles.dialogBtn}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleRemove(removeTarget);
                    setRemoveTarget(null);
                  }}
                  style={styles.dialogBtn}
                >
                  <Text style={styles.dialogDeleteText}>Remove</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => setError(null)}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {successMessage && (
        <View style={styles.successCard}>
          <Text style={styles.successText}>{successMessage}</Text>
          <TouchableOpacity onPress={() => setSuccessMessage(null)}>
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        </View>
      )}

      {inviteLink && (
        <View style={styles.linkCard}>
          <Text style={styles.linkText} numberOfLines={1}>
            Invite link ready
          </Text>
          <TouchableOpacity
            onPress={() => {
              Clipboard.setString(inviteLink);
              setSuccessMessage("Invite link copied!");
              setInviteLink(null);
            }}
          >
            <Text style={styles.copyText}>Copy Link</Text>
          </TouchableOpacity>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.loader}
        />
      ) : (
        <FlatList
          data={members}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }: { item: TeamMember }) => {
            const canEdit =
              isManager &&
              item.id !== currentUserId &&
              item.role !== Role.SUPERADMIN;
            return (
              <View style={styles.row}>
                <View style={styles.rowInfo}>
                  <Text style={styles.memberName}>
                    {item.displayName ?? item.email}
                  </Text>
                  {item.displayName && (
                    <Text style={styles.memberEmail}>{item.email}</Text>
                  )}
                  <Text style={styles.memberRole}>{item.role}</Text>
                </View>
                {canEdit && (
                  <View style={styles.rowActions}>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setRoleTarget(item)}
                    >
                      <Text style={styles.editText}>Role</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionBtn}
                      onPress={() => setRemoveTarget(item)}
                    >
                      <Text style={styles.deleteText}>Remove</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No team members found</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: SPACING.xxl },
  list: { paddingHorizontal: SPACING.md },
  divider: { height: 1, backgroundColor: COLORS.divider },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
    gap: SPACING.sm,
  },
  rowInfo: { flex: 1 },
  memberName: { ...TYPOGRAPHY.bodyLarge, fontWeight: "500" },
  memberEmail: { ...TYPOGRAPHY.bodySmall },
  memberRole: { ...TYPOGRAPHY.labelSmall, marginTop: 2 },
  rowActions: { flexDirection: "row", gap: SPACING.xs },
  actionBtn: { padding: SPACING.xs },
  editText: { color: COLORS.secondary, fontSize: 13, fontWeight: "600" },
  deleteText: { color: COLORS.error, fontSize: 13, fontWeight: "600" },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: SPACING.xxl,
  },
  errorCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: COLORS.errorContainer,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  errorText: { color: COLORS.error, fontSize: 14, flex: 1 },
  successCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  successText: { color: COLORS.available, fontSize: 14, flex: 1 },
  linkCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  linkText: { color: COLORS.secondary, fontSize: 14, flex: 1 },
  copyText: {
    color: COLORS.secondary,
    fontSize: 14,
    fontWeight: "700",
    marginLeft: SPACING.sm,
  },
  dismissText: { color: COLORS.textSecondary, fontSize: 16 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    width: "85%",
  },
  dialogTitle: { ...TYPOGRAPHY.titleMedium, marginBottom: SPACING.lg },
  dialogBody: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  dialogInput: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    color: COLORS.onBackground,
    marginBottom: SPACING.lg,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.lg,
  },
  dialogBtn: { padding: SPACING.sm },
  dialogCancelText: { color: COLORS.textSecondary, fontSize: 15 },
  dialogConfirmText: { color: COLORS.primary, fontSize: 15, fontWeight: "600" },
  dialogDeleteText: { color: COLORS.error, fontSize: 15, fontWeight: "600" },
  roleOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.md,
  },
  roleLabel: {
    ...TYPOGRAPHY.bodySmall,
    marginBottom: SPACING.xs,
    marginTop: SPACING.sm,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  radioSelected: { backgroundColor: COLORS.primary },
  roleOptionText: { ...TYPOGRAPHY.bodyMedium },
});
