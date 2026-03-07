import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { AssetStatus } from "../models";
import { COLORS, SPACING } from "./theme";

const STATUS_COLORS: Record<AssetStatus, string> = {
  [AssetStatus.AVAILABLE]: COLORS.available,
  [AssetStatus.IN_USE]: COLORS.inUse,
  [AssetStatus.MAINTENANCE]: COLORS.maintenance,
  [AssetStatus.RETIRED]: COLORS.retired,
};

const STATUS_LABELS: Record<AssetStatus, string> = {
  [AssetStatus.AVAILABLE]: "AVAILABLE",
  [AssetStatus.IN_USE]: "IN USE",
  [AssetStatus.MAINTENANCE]: "MAINTENANCE",
  [AssetStatus.RETIRED]: "RETIRED",
};

interface StatusChipProps {
  status: AssetStatus;
}

export default function StatusChip({ status }: StatusChipProps) {
  const color = STATUS_COLORS[status];
  return (
    <View style={[styles.chip, { backgroundColor: color + "1F" }]}>
      <Text style={[styles.label, { color }]}>{STATUS_LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 6,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    alignSelf: "flex-start",
  },
  label: {
    fontSize: 11,
    fontWeight: "700",
  },
});
