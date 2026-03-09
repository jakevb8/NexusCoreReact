import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { getEvents } from "../../api";
import { KafkaEvent, PaginatedEvents, resolvedTotal } from "../../models";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLE,
} from "../../components/theme";
import AppHeader from "../../components/AppHeader";

type Props = NativeStackScreenProps<RootStackParamList, "Events">;

const PAGE_SIZE = 50;

function formatStatusChange(prev?: string, next?: string): string {
  const p = prev?.replace(/_/g, " ") ?? "?";
  const n = next?.replace(/_/g, " ") ?? "?";
  return `${p} → ${n}`;
}

function formatTimestamp(iso: string): string {
  return iso.slice(0, 19).replace("T", " ");
}

function statusColor(status?: string): string {
  switch (status) {
    case "AVAILABLE":
      return COLORS.available;
    case "IN_USE":
      return COLORS.inUse;
    case "MAINTENANCE":
      return COLORS.maintenance;
    case "RETIRED":
      return COLORS.retired;
    default:
      return COLORS.textSecondary;
  }
}

export default function EventsScreen(_props: Props) {
  const [events, setEvents] = useState<KafkaEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (p: number = 1) => {
    setIsLoading(true);
    setError(null);
    try {
      const result: PaginatedEvents = await getEvents(p);
      setEvents(result.data);
      setTotal(resolvedTotal(result));
      setPage(result.meta?.page ?? result.page ?? p);
    } catch (err: any) {
      console.error("[Events] load failed", err);
      setError(err?.response?.data?.message ?? "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Reload on screen focus
  useFocusEffect(
    useCallback(() => {
      load(1);
    }, [load]),
  );

  const renderItem = ({ item }: { item: KafkaEvent }) => {
    const color = statusColor(item.newStatus);
    return (
      <View style={styles.row}>
        <View style={styles.rowMain}>
          <Text style={styles.assetName}>
            {item.assetName ?? item.assetId ?? "Unknown asset"}
          </Text>
          <Text style={styles.statusChange}>
            {formatStatusChange(item.previousStatus, item.newStatus)}
          </Text>
          <Text style={styles.timestamp}>
            {formatTimestamp(item.occurredAt)}
          </Text>
        </View>
        {item.newStatus ? (
          <View style={[styles.badge, { backgroundColor: color + "20" }]}>
            <Text style={[styles.badgeText, { color }]}>
              {item.newStatus.replace(/_/g, " ")}
            </Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <View style={styles.root}>
      <AppHeader title="Events" showBack />
      {isLoading ? (
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.loader}
        />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : events.length === 0 ? (
        <Text style={styles.emptyText}>No events yet.</Text>
      ) : (
        <>
          <FlatList
            data={events}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            ItemSeparatorComponent={() => <View style={styles.divider} />}
            style={styles.list}
          />
          {total > PAGE_SIZE && (
            <View style={styles.pagination}>
              <TouchableOpacity
                onPress={() => load(page - 1)}
                disabled={page <= 1}
                style={[styles.pageBtn, page <= 1 && styles.pageBtnDisabled]}
              >
                <Text
                  style={[
                    styles.pageBtnText,
                    page <= 1 && styles.pageBtnTextDisabled,
                  ]}
                >
                  Prev
                </Text>
              </TouchableOpacity>
              <Text style={styles.pageLabel}>Page {page}</Text>
              <TouchableOpacity
                onPress={() => load(page + 1)}
                disabled={page * PAGE_SIZE >= total}
                style={[
                  styles.pageBtn,
                  page * PAGE_SIZE >= total && styles.pageBtnDisabled,
                ]}
              >
                <Text
                  style={[
                    styles.pageBtnText,
                    page * PAGE_SIZE >= total && styles.pageBtnTextDisabled,
                  ]}
                >
                  Next
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    fontSize: 15,
    marginTop: SPACING.xxl,
  },
  list: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    backgroundColor: COLORS.surface,
  },
  rowMain: { flex: 1, gap: 2 },
  assetName: {
    ...TYPOGRAPHY.bodyLarge,
    fontWeight: "600" as any,
  },
  statusChange: {
    ...TYPOGRAPHY.bodySmall,
  },
  timestamp: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: SPACING.sm,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600" as any,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
  },
  pagination: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: SPACING.sm,
    gap: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  pageBtn: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  pageBtnDisabled: { opacity: 0.4 },
  pageBtnText: {
    color: COLORS.primary,
    fontWeight: "600" as any,
    fontSize: 14,
  },
  pageBtnTextDisabled: { color: COLORS.textSecondary },
  pageLabel: { ...TYPOGRAPHY.bodyMedium },
});
