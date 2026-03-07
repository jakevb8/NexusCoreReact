import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { getReports } from "../../api";
import { ReportsData, AssetStatus } from "../../models";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLE,
} from "../../components/theme";
import AppHeader from "../../components/AppHeader";
import StatusChip from "../../components/StatusChip";

type Props = NativeStackScreenProps<RootStackParamList, "Reports">;

export default function ReportsScreen(_props: Props) {
  const [data, setData] = useState<ReportsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getReports();
      setData(result);
    } catch (err: any) {
      setError(err?.response?.data?.message ?? "Failed to load reports");
    } finally {
      setIsLoading(false);
    }
  };

  const maxCount = data ? Math.max(...data.byStatus.map((s) => s.count), 1) : 1;

  return (
    <View style={styles.root}>
      <AppHeader title="Reports" showBack />
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.loader}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : data ? (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.statRow}>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Total Assets</Text>
              <Text style={styles.statValue}>{data.totalAssets}</Text>
            </View>
            <View style={[styles.statCard, { flex: 1 }]}>
              <Text style={styles.statLabel}>Utilization</Text>
              <Text style={styles.statValue}>
                {Math.round(data.utilizationRate * 100)}%
              </Text>
            </View>
          </View>

          <Text style={styles.sectionHeader}>Assets by Status</Text>

          {data.byStatus.map((item) => (
            <View key={item.status} style={styles.statusRow}>
              <View style={styles.statusTop}>
                <StatusChip status={item.status as AssetStatus} />
                <Text style={styles.statusCount}>{item.count}</Text>
              </View>
              <View style={styles.progressTrack}>
                <View
                  style={[
                    styles.progressFill,
                    { width: `${(item.count / maxCount) * 100}%` },
                  ]}
                />
              </View>
            </View>
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: SPACING.xxl },
  errorText: {
    textAlign: "center",
    color: COLORS.error,
    fontSize: 15,
    marginTop: SPACING.xxl,
    padding: SPACING.lg,
  },
  container: { padding: SPACING.lg, gap: SPACING.lg },
  statRow: { flexDirection: "row", gap: SPACING.md },
  statCard: {
    ...CARD_STYLE,
    alignItems: "center",
  },
  statLabel: { ...TYPOGRAPHY.bodySmall, marginBottom: SPACING.xs },
  statValue: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.primary,
  },
  sectionHeader: { ...TYPOGRAPHY.titleMedium, marginTop: SPACING.sm },
  statusRow: {
    ...CARD_STYLE,
    padding: SPACING.md,
    gap: SPACING.sm,
  },
  statusTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statusCount: { ...TYPOGRAPHY.bodyLarge, fontWeight: "600" },
  progressTrack: {
    height: 8,
    backgroundColor: COLORS.divider,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
});
