import React, { useMemo, useState } from "react";
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Modal,
} from "react-native";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

const SHIFT_COLORS = {
  Morning: colors.accentRed,
  Afternoon: colors.accentOrange,
  Evening: colors.accentGold,
};

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDate(key) {
  const d = new Date(key + "T00:00:00");
  return d.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function ManagerDashboardScreen({ navigation }) {
  const { logout, orders, attendance, stock } = useApp();
  const [viewingPhoto, setViewingPhoto] = useState(null);

  const salesByShift = useMemo(() => {
    const totals = { Morning: 0, Afternoon: 0, Evening: 0 };
    orders.forEach((o) => { totals[o.shift] = (totals[o.shift] || 0) + o.total; });
    return totals;
  }, [orders]);

  const maxSale = Math.max(1, ...Object.values(salesByShift));
  const today = new Date().toISOString().slice(0, 10);
  const todaysAttendance = attendance.filter((a) => a.date === today);
  const lateArrivals = todaysAttendance.filter((a) => a.status === "LATE");
  const recentAttendance = [...attendance].slice(0, 20);
  const lowStock = stock.filter((s) => s.quantity <= s.threshold);
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 18 }}>
      <Image source={require("../../assets/logo.png")} style={styles.headerLogo} resizeMode="contain" />
      <Text style={styles.title}>Branch Overview</Text>

      <TouchableOpacity
        style={styles.stationsBtn}
        onPress={() => navigation.navigate("ManagerStations")}
      >
        <Text style={styles.stationsBtnText}>⚙️  MANAGE STATIONS</Text>
      </TouchableOpacity>

      {/* Sales chart */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Sales by Shift · ₱{totalSales.toFixed(2)} total</Text>
        <View style={styles.chartRow}>
          {Object.entries(salesByShift).map(([shift, amount]) => (
            <View key={shift} style={styles.barWrap}>
              <View style={[styles.bar, { height: 8 + (amount / maxSale) * 100, backgroundColor: SHIFT_COLORS[shift] }]} />
              <Text style={styles.barValue}>₱{amount.toFixed(0)}</Text>
              <Text style={styles.barLabel}>{shift}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Summary cards */}
      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { borderColor: colors.accentRed }]}>
          <Text style={styles.summaryValue}>{lateArrivals.length}</Text>
          <Text style={styles.summaryLabel}>Late arrivals</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.accentGold }]}>
          <Text style={styles.summaryValue}>{lowStock.length}</Text>
          <Text style={styles.summaryLabel}>Low stock</Text>
        </View>
        <View style={[styles.summaryCard, { borderColor: colors.accentGreen }]}>
          <Text style={styles.summaryValue}>{orders.length}</Text>
          <Text style={styles.summaryLabel}>Orders today</Text>
        </View>
      </View>

      {/* 📸 Attendance with photos */}
      <Text style={styles.sectionTitle}>📸 Attendance Log with Photo Proof</Text>
      <View style={styles.listCard}>
        {recentAttendance.length === 0 && (
          <Text style={styles.emptyText}>No attendance records yet.</Text>
        )}
        {recentAttendance.map((a) => (
          <View key={a.id} style={styles.attRow}>
            {/* Photo thumbnail */}
            {a.photoBase64 ? (
              <TouchableOpacity onPress={() => setViewingPhoto(a)}>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${a.photoBase64}` }}
                  style={styles.attPhoto}
                />
              </TouchableOpacity>
            ) : (
              <View style={[styles.attPhoto, styles.attPhotoEmpty]}>
                <Text style={styles.noPhotoText}>No photo</Text>
              </View>
            )}

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.listName}>{a.name}</Text>
              <Text style={styles.attMeta}>
                {a.date === today ? "Today" : fmtDate(a.date)} · In: {fmtTime(a.checkIn)}
              </Text>
              <Text style={styles.attMeta}>
                Out: {a.checkOut ? fmtTime(a.checkOut) : "Still on shift"}
              </Text>
            </View>
            <Text style={[styles.listStatus, a.status === "LATE" ? styles.late : styles.onTime]}>
              {a.status}
            </Text>
          </View>
        ))}
      </View>

      {/* Stock alerts */}
      <Text style={styles.sectionTitle}>Stock Alerts</Text>
      <View style={styles.listCard}>
        {lowStock.length === 0 && <Text style={styles.emptyText}>All ingredients above safety threshold.</Text>}
        {lowStock.map((s) => (
          <View key={s.id} style={styles.listRow}>
            <Text style={styles.listName}>{s.name}</Text>
            <Text style={styles.lowValue}>{s.quantity} {s.unit} (min {s.threshold})</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.logout} onPress={logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {/* 📸 Photo modal */}
      <Modal visible={!!viewingPhoto} transparent animationType="fade" onRequestClose={() => setViewingPhoto(null)}>
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{viewingPhoto?.name}</Text>
            <Text style={styles.modalSub}>
              Check-in: {fmtTime(viewingPhoto?.checkIn)} · {viewingPhoto?.status}
            </Text>
            {viewingPhoto?.photoBase64 && (
              <Image
                source={{ uri: `data:image/jpeg;base64,${viewingPhoto.photoBase64}` }}
                style={styles.modalPhoto}
                resizeMode="cover"
              />
            )}
            <TouchableOpacity style={styles.modalClose} onPress={() => setViewingPhoto(null)}>
              <Text style={styles.modalCloseText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  headerLogo: { width: "100%", height: 70, marginBottom: 8 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: "800", marginBottom: 16 },
  stationsBtn: {
    backgroundColor: colors.accentRed,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 16,
  },
  stationsBtnText: { color: "#fff", fontWeight: "800", letterSpacing: 1 },
  chartCard: {
    backgroundColor: colors.bgCard, borderRadius: 16, padding: 18, marginBottom: 18,
    borderWidth: 1, borderColor: colors.border, ...shadowCard,
  },
  chartTitle: { color: colors.textSecondary, marginBottom: 16, fontSize: 13 },
  chartRow: { flexDirection: "row", justifyContent: "space-around", alignItems: "flex-end", height: 150 },
  barWrap: { alignItems: "center" },
  bar: { width: 34, borderRadius: 6, marginBottom: 8 },
  barValue: { color: colors.textPrimary, fontSize: 11, fontWeight: "700" },
  barLabel: { color: colors.textMuted, fontSize: 11, marginTop: 2 },
  summaryRow: { flexDirection: "row", gap: 10, marginBottom: 22 },
  summaryCard: {
    flex: 1, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14,
    borderWidth: 1.5, alignItems: "center", ...shadowCard,
  },
  summaryValue: { color: colors.textPrimary, fontSize: 24, fontWeight: "800" },
  summaryLabel: { color: colors.textSecondary, fontSize: 11, marginTop: 4, textAlign: "center" },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 10 },
  listCard: {
    backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 20,
    borderWidth: 1, borderColor: colors.border,
  },
  emptyText: { color: colors.textMuted, fontSize: 13 },
  attRow: {
    flexDirection: "row", alignItems: "center", paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  attPhoto: { width: 50, height: 50, borderRadius: 10, backgroundColor: colors.bgCardAlt },
  attPhotoEmpty: { justifyContent: "center", alignItems: "center" },
  noPhotoText: { color: colors.textMuted, fontSize: 9, textAlign: "center" },
  listName: { color: colors.textPrimary, fontWeight: "600" },
  attMeta: { color: colors.textSecondary, fontSize: 11, marginTop: 2 },
  listStatus: { fontWeight: "700", fontSize: 11 },
  late: { color: colors.accentRed },
  onTime: { color: colors.accentGreen },
  listRow: {
    flexDirection: "row", justifyContent: "space-between", paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: colors.border,
  },
  lowValue: { color: colors.accentGold, fontWeight: "600", fontSize: 12 },
  logout: { alignItems: "center", paddingVertical: 14, marginTop: 4 },
  logoutText: { color: colors.accentRed, fontWeight: "600" },
  modalBg: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.85)", justifyContent: "center", alignItems: "center", padding: 20,
  },
  modalCard: {
    backgroundColor: colors.bgCard, borderRadius: 18, padding: 20, width: "100%", maxWidth: 400,
    borderWidth: 1, borderColor: colors.border, ...shadowCard,
  },
  modalTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: "800" },
  modalSub: { color: colors.textSecondary, fontSize: 12, marginTop: 4, marginBottom: 14 },
  modalPhoto: { width: "100%", aspectRatio: 1, borderRadius: 12, backgroundColor: colors.bgCardAlt },
  modalClose: {
    marginTop: 16, backgroundColor: colors.accentRed, borderRadius: 10,
    paddingVertical: 12, alignItems: "center",
  },
  modalCloseText: { color: "#fff", fontWeight: "800" },
});