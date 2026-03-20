import { useState, useCallback } from "react";
import { Clipboard } from "react-native";
import { getTeam, inviteMember, removeMember, updateMemberRole, getMe } from "../api";
import { TeamMember, Role, InviteResponse } from "../models";

export interface TeamState {
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  isManager: boolean;
  currentUserId: string | null;
  inviteLink: string | null;
  inviteVisible: boolean;
  inviteEmail: string;
  inviteRole: Role;
  inviteLoading: boolean;
  roleTarget: TeamMember | null;
  removeTarget: TeamMember | null;
}

export interface TeamActions {
  load: () => Promise<void>;
  handleInvite: () => Promise<void>;
  handleRemove: (member: TeamMember) => Promise<void>;
  handleRoleChange: (member: TeamMember, role: Role) => Promise<void>;
  copyInviteLink: () => void;
  setInviteVisible: (v: boolean) => void;
  setInviteEmail: (v: string) => void;
  setInviteRole: (v: Role) => void;
  setRoleTarget: (m: TeamMember | null) => void;
  setRemoveTarget: (m: TeamMember | null) => void;
  setError: (msg: string | null) => void;
  setSuccessMessage: (msg: string | null) => void;
  setInviteLink: (link: string | null) => void;
}

export function useTeam(): TeamState & TeamActions {
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
      setError(err?.response?.data?.message ?? "Failed to load team");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInvite = async () => {
    if (!inviteEmail.includes("@")) return;
    setInviteLoading(true);
    try {
      const res: InviteResponse = await inviteMember(inviteEmail, inviteRole);
      setInviteVisible(false);
      setInviteEmail("");
      setInviteRole(Role.VIEWER);
      if (res.inviteLink) {
        setInviteLink(res.inviteLink);
      } else {
        setSuccessMessage("Invite email sent");
      }
    } catch (err: any) {
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
      setError(err?.response?.data?.message ?? "Role update failed");
    }
  };

  const copyInviteLink = () => {
    if (!inviteLink) return;
    Clipboard.setString(inviteLink);
    setSuccessMessage("Invite link copied!");
    setInviteLink(null);
  };

  return {
    members,
    isLoading,
    error,
    successMessage,
    isManager,
    currentUserId,
    inviteLink,
    inviteVisible,
    inviteEmail,
    inviteRole,
    inviteLoading,
    roleTarget,
    removeTarget,
    load,
    handleInvite,
    handleRemove,
    handleRoleChange,
    copyInviteLink,
    setInviteVisible,
    setInviteEmail,
    setInviteRole,
    setRoleTarget,
    setRemoveTarget,
    setError,
    setSuccessMessage,
    setInviteLink,
  };
}
