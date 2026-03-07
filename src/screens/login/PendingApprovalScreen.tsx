import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import auth from "@react-native-firebase/auth";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { COLORS, SPACING, TYPOGRAPHY } from "../../components/theme";
import { resetApiClient } from "../../api";

type Props = NativeStackScreenProps<RootStackParamList, "PendingApproval">;

export default function PendingApprovalScreen({ navigation }: Props) {
  const handleSignOut = async () => {
    resetApiClient();
    await auth().signOut();
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pending Approval</Text>
      <Text style={styles.description}>
        Your organization is pending approval. You'll be notified once an
        administrator reviews your request.
      </Text>
      <TouchableOpacity style={styles.button} onPress={handleSignOut}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    justifyContent: "center",
    padding: SPACING.xxl,
  },
  title: {
    ...TYPOGRAPHY.headlineMedium,
    marginBottom: SPACING.lg,
    textAlign: "center",
  },
  description: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: SPACING.xxl,
  },
  button: {
    width: "100%",
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: SPACING.lg,
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: "600",
  },
});
