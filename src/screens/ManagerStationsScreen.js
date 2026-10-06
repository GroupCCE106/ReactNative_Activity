import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

export default function ManagerStationsScreen() {
  const { stations, assignStation } = useApp();
  const [staffList, setStaffList] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);

  // Kuhaon ang tanan staff gikan sa Firestore
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const staff = snap.docs
          .map((d) => ({ uid: d.id, ...d.data() }))
          .filter((u) => u.role === "staff");
        setStaffList(staff);
      } catch (e) {
        console.warn("Failed to fetch staff:", e);
      }
    })();
  }, []);

  const handleAssign = async () => {
    if (!selectedStation || !selectedStaff) {
      Alert.alert("Kulang", "Pilia og station ug staff una.");
      return;
    }
    const result = await assignStation(selectedStation.id, selectedStaff.uid, selectedStaff.fullName);
    if (result.ok) {
      Alert.alert("Success", `Na-assign si ${selectedStaff.fullName} sa ${selectedStation.name}!`);
      setSelectedStaff(null);
      setSelectedStation(null);
    } else {
      Alert.alert("Error", result.error);
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 18 }}>
      <Text style={styles.title}>Station Assignment</Text>
      <Text style={styles.subtitle}>I-assign ang mga staff sa ilang station</Text>

      <Text style={styles.sectionTitle}>1. Pili og Station</Text>
      {stations.map((s) => (
        <TouchableOpacity
          key={s.id}
          style={[styles.stationBtn, selectedStation?.id === s.id && styles.stationActive]}
          onPress={() => setSelectedStation(s)}
        >
          <Text style={styles.stationName}>{s.name}</Text>
          <Text style={styles.stationAssigned}>
            {s.assignedName ? `👤 ${s.assignedName}` : "— walay naka-assign"}
          </Text>
        </TouchableOpacity>
      ))}

      <Text style={styles.sectionTitle}>2. Pili og Staff</Text>
      {staffList.length === 0 && <Text style={styles.empty}>Walay staff nga na-register.</Text>}
      {staffList.map((staff) => (
        <TouchableOpacity
          key={staff.uid}
          style={[styles.staffBtn, selectedStaff?.uid === staff.uid && styles.staffActive]}
          onPress={() => setSelectedStaff(staff)}
        >
          <Text style={styles.staffName}>{staff.fullName}</Text>
          <Text style={styles.staffEmail}>{staff.email}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity style={styles.assignBtn} onPress={handleAssign}>
        <Text style={styles.assignBtnText}>I-ASSIGN</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  title: { color: colors.textPrimary, fontSize: 22, fontWeight: "800" },
  subtitle: { color: colors.textSecondary, marginBottom: 20, marginTop: 4 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginTop: 16, marginBottom: 10 },
  stationBtn: {
    backgroundColor: colors.bgCard, borderRadius: 12, padding: 16, marginBottom: 10,
    borderWidth: 1.5, borderColor: colors.border, ...shadowCard,
  },
  stationActive: { borderColor: colors.accentRed, backgroundColor: colors.bgCardAlt },
  stationName: { color: colors.textPrimary, fontSize: 15, fontWeight: "700" },
  stationAssigned: { color: colors.textMuted, fontSize: 12, marginTop: 4 },
  staffBtn: {
    backgroundColor: colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 8,
    borderWidth: 1.5, borderColor: colors.border,
  },
  staffActive: { borderColor: colors.accentGreen, backgroundColor: colors.bgCardAlt },
  staffName: { color: colors.textPrimary, fontWeight: "600" },
  staffEmail: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  empty: { color: colors.textMuted, fontStyle: "italic" },
  assignBtn: {
    backgroundColor: colors.accentRed, borderRadius: 12, paddingVertical: 16,
    alignItems: "center", marginTop: 20, marginBottom: 40,
  },
  assignBtnText: { color: "#fff", fontWeight: "800", letterSpacing: 1 },
});