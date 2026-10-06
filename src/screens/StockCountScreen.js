import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

export default function StockCountScreen() {
  const { stock, updateStockQuantity } = useApp();
  const [drafts, setDrafts] = useState({});

  const handleChange = (id, text) => {
    // Only allow numeric input
    if (text !== "" && !/^\d*\.?\d*$/.test(text)) return;
    setDrafts((d) => ({ ...d, [id]: text }));
  };

  const handleSave = (item) => {
    const raw = drafts[item.id];
    if (raw === undefined || raw === "") {
      Alert.alert("Missing value", "Type in a quantity before saving.");
      return;
    }
    const value = parseFloat(raw);
    if (isNaN(value) || value < 0) {
      Alert.alert("Invalid entry", "That doesn't look like a valid quantity — check for typing mistakes.");
      return;
    }
    updateStockQuantity(item.id, value);
    setDrafts((d) => ({ ...d, [item.id]: undefined }));
    if (value <= item.threshold) {
      Alert.alert("Low stock warning", `${item.name} is at or below the safety threshold (${item.threshold} ${item.unit}).`);
    } else {
      Alert.alert("Saved", `${item.name} updated to ${value} ${item.unit}.`);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.helper}>Type in leftover ingredient counts at the end of your shift. The app flags anything below the safety threshold automatically.</Text>

      {stock.map((item) => {
        const low = item.quantity <= item.threshold;
        return (
          <View key={item.id} style={[styles.card, low && styles.cardLow]}>
            <View style={styles.rowBetween}>
              <Text style={styles.itemName}>{item.name}</Text>
              {low && <Text style={styles.lowBadge}>LOW STOCK</Text>}
            </View>
            <Text style={styles.currentQty}>
              Current: {item.quantity} {item.unit} · Threshold: {item.threshold} {item.unit}
            </Text>
            <View style={styles.inputRow}>
              <TextInput
                style={styles.input}
                keyboardType="decimal-pad"
                placeholder={`New count (${item.unit})`}
                placeholderTextColor={colors.textMuted}
                value={drafts[item.id] ?? ""}
                onChangeText={(t) => handleChange(item.id, t)}
              />
              <TouchableOpacity style={styles.saveBtn} onPress={() => handleSave(item)}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  helper: { color: colors.textSecondary, marginBottom: 16, lineHeight: 20 },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowCard,
  },
  cardLow: { borderColor: colors.accentGold },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  itemName: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  lowBadge: {
    color: "#3a2a00",
    backgroundColor: colors.accentGold,
    fontSize: 10,
    fontWeight: "800",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    overflow: "hidden",
  },
  currentQty: { color: colors.textMuted, fontSize: 12, marginTop: 4, marginBottom: 10 },
  inputRow: { flexDirection: "row", gap: 10 },
  input: {
    flex: 1,
    backgroundColor: colors.bgCardAlt,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  saveBtn: { backgroundColor: colors.accentRed, borderRadius: 8, paddingHorizontal: 18, justifyContent: "center" },
  saveBtnText: { color: "#fff", fontWeight: "700" },
});
