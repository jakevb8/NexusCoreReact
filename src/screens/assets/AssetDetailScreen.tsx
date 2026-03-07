import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/AppNavigator";
import { getAssets, createAsset, updateAsset } from "../../api";
import { Asset, AssetStatus, CreateAssetRequest } from "../../models";
import { COLORS, SPACING, TYPOGRAPHY } from "../../components/theme";
import AppHeader from "../../components/AppHeader";

type Props = NativeStackScreenProps<RootStackParamList, "AssetDetail">;

const STATUS_OPTIONS = Object.values(AssetStatus);

export default function AssetDetailScreen({ route, navigation }: Props) {
  const { assetId } = route.params;
  const isNew = assetId === "new";

  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");
  const [status, setStatus] = useState<AssetStatus>(AssetStatus.AVAILABLE);
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isNew) {
      loadAsset();
    }
  }, [assetId]);

  const loadAsset = async () => {
    setIsLoading(true);
    try {
      const result = await getAssets(1, undefined);
      const found = result.data.find((a: Asset) => a.id === assetId);
      if (found) {
        setName(found.name);
        setSku(found.sku);
        setDescription(found.description ?? "");
        setAssignedTo(found.assignedTo ?? "");
        setStatus(found.status);
      }
    } catch (err: any) {
      console.error("[AssetDetail] loadAsset failed", err);
      setError("Failed to load asset");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !sku.trim()) return;
    setIsSaving(true);
    setError(null);
    try {
      const payload: CreateAssetRequest = {
        name: name.trim(),
        sku: sku.trim(),
        description: description.trim() || undefined,
        assignedTo: assignedTo.trim() || undefined,
        status,
      };
      if (isNew) {
        await createAsset(payload);
      } else {
        await updateAsset(assetId, payload);
      }
      navigation.goBack();
    } catch (err: any) {
      console.error("[AssetDetail] save failed", err);
      setError(err?.response?.data?.message ?? "Save failed");
    } finally {
      setIsSaving(false);
    }
  };

  const saveButton = (
    <TouchableOpacity
      onPress={handleSave}
      disabled={isSaving || !name.trim() || !sku.trim()}
    >
      <Text
        style={[
          styles.saveText,
          (isSaving || !name.trim() || !sku.trim()) && styles.saveTextDisabled,
        ]}
      >
        Save
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.root}>
        <AppHeader title={isNew ? "New Asset" : "Edit Asset"} showBack />
        <ActivityIndicator
          color={COLORS.primary}
          size="large"
          style={styles.loader}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.root}>
        <AppHeader
          title={isNew ? "New Asset" : "Edit Asset"}
          showBack
          rightElement={saveButton}
        />
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          {error && <Text style={styles.error}>{error}</Text>}

          <Text style={styles.label}>Name *</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Asset name"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>SKU *</Text>
          <TextInput
            style={styles.input}
            value={sku}
            onChangeText={setSku}
            placeholder="SKU"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Optional description"
            placeholderTextColor={COLORS.textSecondary}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Assigned To</Text>
          <TextInput
            style={styles.input}
            value={assignedTo}
            onChangeText={setAssignedTo}
            placeholder="Optional assignee"
            placeholderTextColor={COLORS.textSecondary}
          />

          <Text style={styles.label}>Status</Text>
          <View style={styles.chipRow}>
            {STATUS_OPTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.chip, status === s && styles.chipSelected]}
                onPress={() => setStatus(s)}
              >
                <Text
                  style={[
                    styles.chipText,
                    status === s && styles.chipTextSelected,
                  ]}
                >
                  {s.replace("_", " ")}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {isSaving && (
            <ActivityIndicator
              color={COLORS.primary}
              style={styles.savingIndicator}
            />
          )}
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  loader: { marginTop: SPACING.xxl },
  container: { padding: SPACING.lg, gap: SPACING.sm },
  label: { ...TYPOGRAPHY.bodyMedium, fontWeight: "600", marginTop: SPACING.sm },
  input: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: 15,
    backgroundColor: COLORS.surface,
    color: COLORS.onBackground,
  },
  multiline: { height: 80, textAlignVertical: "top" },
  error: { color: COLORS.error, fontSize: 14, marginBottom: SPACING.sm },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
    marginTop: SPACING.xs,
  },
  chip: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  chipSelected: { backgroundColor: COLORS.primary },
  chipText: { color: COLORS.primary, fontSize: 13, fontWeight: "500" },
  chipTextSelected: { color: COLORS.onPrimary },
  saveText: {
    color: COLORS.onPrimary,
    fontSize: 15,
    fontWeight: "700",
  },
  saveTextDisabled: { opacity: 0.5 },
  savingIndicator: { marginTop: SPACING.md },
});
