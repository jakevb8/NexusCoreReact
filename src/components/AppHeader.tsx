import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SPACING } from "./theme";

interface AppHeaderProps {
  title: string;
  showBack?: boolean;
  rightElement?: React.ReactNode;
}

export default function AppHeader({
  title,
  showBack = false,
  rightElement,
}: AppHeaderProps) {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Text style={styles.backArrow}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backBtn} />
        )}
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        <View style={styles.rightSlot}>{rightElement ?? null}</View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    paddingTop:
      Platform.OS === "android" ? (StatusBar.currentHeight ?? 24) : 50,
    paddingBottom: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 36,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  backArrow: {
    color: COLORS.onPrimary,
    fontSize: 22,
    fontWeight: "600",
  },
  title: {
    flex: 1,
    color: COLORS.onPrimary,
    fontSize: 18,
    fontWeight: "700",
    textAlign: "center",
  },
  rightSlot: {
    width: 80,
    alignItems: "flex-end",
  },
});
