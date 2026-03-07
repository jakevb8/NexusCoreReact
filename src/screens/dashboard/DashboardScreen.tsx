import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLE,
} from "../../components/theme";
import AppHeader from "../../components/AppHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Dashboard">;

const NAV_ITEMS = [
  {
    title: "Assets",
    description: "Manage your organization's assets",
    screen: "Assets" as keyof RootStackParamList,
  },
  {
    title: "Team",
    description: "Manage members and invitations",
    screen: "Team" as keyof RootStackParamList,
  },
  {
    title: "Reports",
    description: "View utilization analytics",
    screen: "Reports" as keyof RootStackParamList,
  },
  {
    title: "Settings",
    description: "Backend and account settings",
    screen: "Settings" as keyof RootStackParamList,
  },
];

export default function DashboardScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <AppHeader title="Dashboard" />
      <ScrollView contentContainerStyle={styles.container}>
        {NAV_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.title}
            style={styles.card}
            onPress={() => navigation.navigate(item.screen as any)}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardDesc}>{item.description}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    padding: SPACING.lg,
    gap: SPACING.md,
  },
  card: {
    ...CARD_STYLE,
    paddingVertical: SPACING.xl,
  },
  cardTitle: {
    ...TYPOGRAPHY.titleMedium,
    fontSize: 18,
    marginBottom: SPACING.xs,
  },
  cardDesc: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
  },
});
