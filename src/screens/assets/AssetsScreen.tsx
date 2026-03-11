import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { RootStackParamList } from "../../navigation/AppNavigator";
import {
  getAssets,
  deleteAsset,
  importCsv,
  getMe,
  generateSampleCsv,
} from "../../api";
import {
  Asset,
  Role,
  CsvImportResult,
  PaginatedAssets,
  resolvedTotal,
} from "../../models";
import {
  COLORS,
  SPACING,
  TYPOGRAPHY,
  CARD_STYLE,
} from "../../components/theme";
import AppHeader from "../../components/AppHeader";
import StatusChip from "../../components/StatusChip";

type Props = NativeStackScreenProps<RootStackParamList, "Assets">;

const PAGE_SIZE = 20;

export default function AssetsScreen({ navigation }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [importResult, setImportResult] = useState<CsvImportResult | null>(
    null,
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [menuVisible, setMenuVisible] = useState(false);

  const load = useCallback(async (p: number, s: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const [result, me] = await Promise.all([
        getAssets(p, s || undefined),
        getMe(),
      ]);
      setAssets(result.data);
      setTotal(resolvedTotal(result));
      setIsManager(me.role === Role.ORG_MANAGER || me.role === Role.SUPERADMIN);
    } catch (err: any) {
      console.error("[Assets] load failed", err);
      setError(err?.response?.data?.message ?? "Failed to load assets");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () =>
      load(page, search),
    );
    return unsubscribe;
  }, [navigation, page, search, load]);

  const handleSearch = (text: string) => {
    setSearch(text);
    setPage(1);
    load(1, text);
  };

  const handleDelete = async (asset: Asset) => {
    try {
      await deleteAsset(asset.id);
      setSuccessMessage(`"${asset.name}" deleted`);
      load(page, search);
    } catch (err: any) {
      console.error("[Assets] deleteAsset failed", err);
      setError(err?.response?.data?.message ?? "Delete failed");
    }
  };

  const handleImportCsv = async () => {
    setMenuVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "text/csv",
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const file = result.assets[0];
      const formData = new FormData();
      formData.append("file", {
        uri: file.uri,
        name: file.name ?? "import.csv",
        type: "text/csv",
      } as any);
      const importRes = await importCsv(formData);
      setImportResult(importRes);
      load(1, search);
    } catch (err: any) {
      console.error("[Assets] importCsv failed", err);
      setError(err?.response?.data?.message ?? "Import failed");
    }
  };

  const handleDownloadSample = async () => {
    setMenuVisible(false);
    try {
      const csv = generateSampleCsv();
      const fileUri = FileSystem.documentDirectory + "nexuscore_sample.csv";
      await FileSystem.writeAsStringAsync(fileUri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(fileUri, { mimeType: "text/csv" });
    } catch (err: any) {
      console.error("[Assets] downloadSampleCsv failed", err);
      setError("Failed to generate sample CSV");
    }
  };

  const rightElement = isManager ? (
    <View style={styles.headerActions}>
      <TouchableOpacity
        onPress={() => setMenuVisible(true)}
        style={styles.iconBtn}
      >
        <Text style={styles.iconText}>⋮</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => navigation.navigate("AssetDetail", { assetId: "new" })}
        style={styles.iconBtn}
      >
        <Text style={styles.iconText}>＋</Text>
      </TouchableOpacity>
    </View>
  ) : undefined;

  return (
    <View style={styles.root}>
      <AppHeader title="Assets" showBack rightElement={rightElement} />

      {/* Overflow menu */}
      <Modal
        transparent
        visible={menuVisible}
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <View style={styles.menu}>
            <TouchableOpacity style={styles.menuItem} onPress={handleImportCsv}>
              <Text style={styles.menuItemText}>Import CSV</Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDownloadSample}
            >
              <Text style={styles.menuItemText}>Download Sample CSV</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>

      {/* Delete confirm dialog */}
      {deleteTarget && (
        <Modal transparent visible onRequestClose={() => setDeleteTarget(null)}>
          <View style={styles.overlay}>
            <View style={styles.dialog}>
              <Text style={styles.dialogTitle}>Delete asset?</Text>
              <Text style={styles.dialogBody}>
                This action cannot be undone.
              </Text>
              <View style={styles.dialogActions}>
                <TouchableOpacity
                  onPress={() => setDeleteTarget(null)}
                  style={styles.dialogBtn}
                >
                  <Text style={styles.dialogCancelText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleDelete(deleteTarget);
                    setDeleteTarget(null);
                  }}
                  style={styles.dialogBtn}
                >
                  <Text style={styles.dialogDeleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}

      <View style={styles.searchBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search assets..."
          placeholderTextColor={COLORS.textSecondary}
          value={search}
          onChangeText={handleSearch}
        />
      </View>

      {error && (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {importResult && (
        <View style={styles.importCard}>
          <Text style={styles.importText}>
            Import: {importResult.created} created, {importResult.skipped}{" "}
            skipped
            {importResult.limitReached ? " (limit reached)" : ""}
          </Text>
          <TouchableOpacity onPress={() => setImportResult(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
          </TouchableOpacity>
        </View>
      )}

      {successMessage && (
        <View style={styles.successCard}>
          <Text style={styles.successText}>{successMessage}</Text>
          <TouchableOpacity onPress={() => setSuccessMessage(null)}>
            <Text style={styles.dismissText}>Dismiss</Text>
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
          data={assets}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={styles.divider} />}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.assetName}>{item.name}</Text>
                <Text style={styles.assetSku}>{item.sku}</Text>
              </View>
              <StatusChip status={item.status} />
              {isManager && (
                <View style={styles.rowActions}>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() =>
                      navigation.navigate("AssetDetail", { assetId: item.id })
                    }
                  >
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => setDeleteTarget(item)}
                  >
                    <Text style={styles.deleteText}>Del</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No assets found</Text>
          }
        />
      )}

      {total > PAGE_SIZE && (
        <View style={styles.pagination}>
          <TouchableOpacity
            disabled={page === 1}
            onPress={() => {
              const p = page - 1;
              setPage(p);
              load(p, search);
            }}
          >
            <Text
              style={[styles.pageBtn, page === 1 && styles.pageBtnDisabled]}
            >
              Prev
            </Text>
          </TouchableOpacity>
          <Text style={styles.pageText}>Page {page}</Text>
          <TouchableOpacity
            disabled={page * PAGE_SIZE >= total}
            onPress={() => {
              const p = page + 1;
              setPage(p);
              load(p, search);
            }}
          >
            <Text
              style={[
                styles.pageBtn,
                page * PAGE_SIZE >= total && styles.pageBtnDisabled,
              ]}
            >
              Next
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  searchBar: { padding: SPACING.md },
  searchInput: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    backgroundColor: COLORS.surface,
    color: COLORS.onBackground,
  },
  loader: { marginTop: SPACING.xxl },
  list: { paddingHorizontal: SPACING.md },
  divider: { height: 1, backgroundColor: COLORS.divider },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  rowInfo: { flex: 1 },
  assetName: { ...TYPOGRAPHY.bodyLarge, fontWeight: "500" },
  assetSku: { ...TYPOGRAPHY.bodySmall },
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
  },
  errorText: { color: COLORS.error, fontSize: 14 },
  importCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  importText: { color: COLORS.secondary, fontSize: 14, flex: 1 },
  successCard: {
    margin: SPACING.md,
    padding: SPACING.md,
    backgroundColor: "#F0FDF4",
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  successText: { color: COLORS.available, fontSize: 14, flex: 1 },
  dismissText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginLeft: SPACING.sm,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  pageBtn: { color: COLORS.secondary, fontSize: 15, fontWeight: "600" },
  pageBtnDisabled: { opacity: 0.4 },
  pageText: { color: COLORS.onBackground, fontSize: 14 },
  headerActions: { flexDirection: "row", gap: SPACING.sm },
  iconBtn: { padding: SPACING.xs },
  iconText: { color: COLORS.onPrimary, fontSize: 20, fontWeight: "700" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  menu: {
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    marginTop: 60,
    marginRight: SPACING.lg,
    minWidth: 200,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  menuItem: { padding: SPACING.lg },
  menuItemText: { fontSize: 15, color: COLORS.onBackground },
  menuDivider: { height: 1, backgroundColor: COLORS.divider },
  dialog: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.xl,
    margin: SPACING.xxl,
    width: "80%",
    alignSelf: "center",
    marginTop: "auto",
    marginBottom: "auto",
  },
  dialogTitle: { ...TYPOGRAPHY.titleMedium, marginBottom: SPACING.sm },
  dialogBody: {
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  dialogActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: SPACING.lg,
  },
  dialogBtn: { padding: SPACING.sm },
  dialogCancelText: { color: COLORS.textSecondary, fontSize: 15 },
  dialogDeleteText: { color: COLORS.error, fontSize: 15, fontWeight: "600" },
});
