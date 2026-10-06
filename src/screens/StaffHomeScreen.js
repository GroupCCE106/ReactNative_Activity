import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

export default function StaffHomeScreen({ navigation }) {
  const { user, logout, timers, orders, stock } = useApp();

  const activeTimers = timers.filter((t) => t.status === "active" || t.status === "ready").length;
  const todayOrders = orders.length;
  const lowStock = stock.filter((s) => s.quantity <= s.threshold).length;

  const Card = ({ title, value, color, onPress }) => (
    <TouchableOpacity style={[styles.metricCard, { borderColor: color }]} onPress={onPress}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{title}</Text>
    </TouchableOpacity>
  );

  const NavButton = ({ label, onPress, color }) => (
    <TouchableOpacity style={[styles.navButton, { borderColor: color }]} onPress={onPress}>
      <Text style={styles.navButtonText}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 20 }}>
      <Image source={require("../../assets/logo.png")} style={styles.headerLogo} resizeMode="contain" />
      <Text style={styles.greeting}>Good day, {user.name.split(" ")[0]}</Text>
      <Text style={styles.subtitle}>Today's Operations</Text>

      <View style={styles.metricsRow}>
        <Card title="Active Timers" value={activeTimers} color={colors.accentGold} onPress={() => navigation.navigate("KitchenTimer")} />
        <Card title="Orders" value={todayOrders} color={colors.accentOrange} onPress={() => navigation.navigate("CashierPOS")} />
        <Card title="Stock Alerts" value={lowStock} color={colors.accentGold} onPress={() => navigation.navigate("StockCount")} />
      </View>

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <NavButton label="Cashier POS" color={colors.accentRed} onPress={() => navigation.navigate("CashierPOS")} />
      <NavButton label="Kitchen Timer" color={colors.accentGold} onPress={() => navigation.navigate("KitchenTimer")} />
      <NavButton label="Stock Count" color={colors.accentGold} onPress={() => navigation.navigate("StockCount")} />
      <NavButton label="Attendance" color={colors.accentGreen} onPress={() => navigation.navigate("Attendance")} />

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  headerLogo: { width: "100%", height: 70, marginBottom: 12 },
  greeting: { color: colors.textPrimary, fontSize: 22, fontWeight: "700" },
  subtitle: { color: colors.textSecondary, marginBottom: 20 },
  metricsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  metricCard: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    alignItems: "center",
    ...shadowCard,
  },
  metricValue: { color: colors.textPrimary, fontSize: 26, fontWeight: "800" },
  metricLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 4, textAlign: "center" },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 12 },
  navButton: {
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 12,
    borderWidth: 1.5,
  },
  navButtonText: { color: colors.textPrimary, fontWeight: "600", fontSize: 15 },
  logout: { marginTop: 12, alignItems: "center", paddingVertical: 14 },
  logoutText: { color: colors.accentRed, fontWeight: "600" },
});
