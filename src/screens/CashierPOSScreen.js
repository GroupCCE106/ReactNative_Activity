import React, { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

export default function CashierPOSScreen() {
  const { menu, completeOrder } = useApp();
  const [cart, setCart] = useState({}); // { [menuId]: qty }

  const addItem = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeItem = (id) =>
    setCart((c) => {
      const next = { ...c };
      if (next[id] > 1) next[id] -= 1;
      else delete next[id];
      return next;
    });

  const cartItems = useMemo(
    () =>
      Object.entries(cart).map(([id, qty]) => {
        const item = menu.find((m) => m.id === id);
        return { ...item, qty };
      }),
    [cart, menu]
  );

  const total = cartItems.reduce((sum, ci) => sum + ci.price * ci.qty, 0);

  const handleCompleteOrder = () => {
    if (cartItems.length === 0) {
      Alert.alert("Empty order", "Add at least one item before completing the order.");
      return;
    }
    completeOrder(cartItems);
    Alert.alert("Order complete", `Total: ₱${total.toFixed(2)} — stock updated, timer started if needed.`);
    setCart({});
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 8 }}>
        {menu.map((item) => (
          <View key={item.id} style={styles.menuRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.menuName}>{item.name}</Text>
              <Text style={styles.menuPrice}>₱{item.price.toFixed(2)}</Text>
            </View>
            <View style={styles.qtyControls}>
              <TouchableOpacity style={styles.qtyBtn} onPress={() => removeItem(item.id)}>
                <Text style={styles.qtyBtnText}>–</Text>
              </TouchableOpacity>
              <Text style={styles.qtyValue}>{cart[item.id] || 0}</Text>
              <TouchableOpacity style={[styles.qtyBtn, { backgroundColor: colors.accentRed }]} onPress={() => addItem(item.id)}>
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.summary}>
        <View style={styles.summaryRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>₱{total.toFixed(2)}</Text>
        </View>
        <TouchableOpacity style={styles.completeBtn} onPress={handleCompleteOrder}>
          <Text style={styles.completeBtnText}>COMPLETE ORDER</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowCard,
  },
  menuName: { color: colors.textPrimary, fontSize: 15, fontWeight: "600" },
  menuPrice: { color: colors.textSecondary, marginTop: 2 },
  qtyControls: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: colors.bgCardAlt,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  qtyValue: { color: colors.textPrimary, fontWeight: "700", width: 20, textAlign: "center" },
  summary: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bgCard,
    padding: 16,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 12 },
  totalLabel: { color: colors.textSecondary, fontSize: 16 },
  totalValue: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  completeBtn: { backgroundColor: colors.accentGreen, borderRadius: 10, paddingVertical: 14, alignItems: "center" },
  completeBtnText: { color: "#062", fontWeight: "800", letterSpacing: 0.5 },
});
