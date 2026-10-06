import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

function formatTime(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function AttendanceScreen() {
  const { user, checkIn, checkOut, getTodayAttendance } = useApp();
  const record = getTodayAttendance(user.id);
  const [photo, setPhoto] = useState(null); // base64
  const [busy, setBusy] = useState(false);

  // ❌ Camera function — gitangtang
  // const takePhoto = async () => { ... }

  // ✅ Gallery picker — i-keep
  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Kinahanglan ang photo library access.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.3,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      setPhoto(result.assets[0].base64);
    }
  };

  const handleCheckIn = async () => {
    if (!photo) {
      Alert.alert("Kulang", "Kinahanglan og picture as attendance proof.");
      return;
    }
    setBusy(true);
    const result = await checkIn(user, photo);
    setBusy(false);
    if (result.ok) {
      Alert.alert("Success", "Naka-check-in na ka!");
      setPhoto(null);
    } else {
      Alert.alert("Error", result.error || "Failed to check in.");
    }
  };

  const handleCheckOut = async () => {
    setBusy(true);
    const result = await checkOut(user);
    setBusy(false);
    if (result.ok) {
      Alert.alert("Success", "Naka-check-out na ka. Salamat!");
    } else {
      Alert.alert("Error", result.error || "Failed to check out.");
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 20 }}>
      <View style={styles.card}>
        <Text style={styles.title}>Today's Shift</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Shift</Text>
          <Text style={styles.value}>{user.shiftStart} – {user.shiftEnd}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Check-in</Text>
          <Text style={styles.value}>{record ? formatTime(record.checkIn) : "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Check-out</Text>
          <Text style={styles.value}>{record?.checkOut ? formatTime(record.checkOut) : "—"}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Status</Text>
          <Text
            style={[
              styles.statusBadge,
              record?.status === "LATE" ? styles.statusLate : styles.statusOk,
            ]}
          >
            {record ? record.status : "NOT CHECKED IN"}
          </Text>
        </View>
      </View>

      {/* Kung naka-check-in na, ipakita ang photo evidence */}
      {record?.photoBase64 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📸 Attendance Proof</Text>
          <Image
            source={{ uri: `data:image/jpeg;base64,${record.photoBase64}` }}
            style={styles.photoPreview}
            resizeMode="cover"
          />
          <Text style={styles.photoMeta}>
            Sent to manager at {formatTime(record.checkIn)}
          </Text>
        </View>
      )}

      {/* Kung wala pa naka-check-in, i-pakita ang photo picker (Gallery lang) */}
      {!record && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>📸 Attendance Photo (Required)</Text>
          <Text style={styles.helper}>
            Pili og picture gikan sa gallery as proof sa imong check-in. Makita ni sa manager.
          </Text>

          {photo ? (
            <>
              <Image
                source={{ uri: `data:image/jpeg;base64,${photo}` }}
                style={styles.photoPreview}
                resizeMode="cover"
              />
              <View style={styles.photoActions}>
                <TouchableOpacity
                  style={[styles.photoActionBtn, { borderColor: colors.accentOrange }]}
                  onPress={pickPhoto}
                >
                  <Text style={[styles.photoActionText, { color: colors.accentOrange }]}>
                    🔄 Change Photo
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.photoActionBtn, { borderColor: colors.accentRed }]}
                  onPress={() => setPhoto(null)}
                >
                  <Text style={[styles.photoActionText, { color: colors.accentRed }]}>
                    ❌ Remove Photo
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <TouchableOpacity style={styles.photoBtn} onPress={pickPhoto}>
              <Text style={styles.photoBtnText}>🖼️Gallery</Text>
            </TouchableOpacity>
)}
        </View>
      )}

      {/* Action buttons */}
      {!record ? (
        <TouchableOpacity
          style={[styles.checkInBtn, (!photo || busy) && styles.btnDisabled]}
          onPress={handleCheckIn}
          disabled={busy || !photo}
        >
          {busy ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.checkInText}>
              {photo ? "✓ CHECK IN" : "PILI OG PICTURE UNA"}
            </Text>
          )}
        </TouchableOpacity>
      ) : !record.checkOut ? (
        <TouchableOpacity
          style={[styles.checkOutBtn, busy && styles.btnDisabled]}
          onPress={handleCheckOut}
          disabled={busy}
        >
          {busy ? (
            <ActivityIndicator color="#052" />
          ) : (
            <Text style={styles.checkOutText}>CHECK OUT</Text>
          )}
        </TouchableOpacity>
      ) : (
        <Text style={styles.done}>Shift complete for today. See you tomorrow!</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 18,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
    ...shadowCard,
  },
  title: { color: colors.textPrimary, fontSize: 18, fontWeight: "700", marginBottom: 18 },
  sectionTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: "700", marginBottom: 10 },
  helper: { color: colors.textSecondary, fontSize: 12, marginBottom: 14, lineHeight: 18 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: { color: colors.textSecondary },
  value: { color: colors.textPrimary, fontWeight: "600" },
  statusBadge: {
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: "hidden",
  },
  statusOk: { color: "#04321a", backgroundColor: colors.accentGreen },
  statusLate: { color: "#3a0000", backgroundColor: colors.accentRed },
  photoBtn: {
    backgroundColor: colors.bgCardAlt,
    borderRadius: 10,
    paddingVertical: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  photoBtnText: { color: colors.textPrimary, fontWeight: "600" },
  photoPreview: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.bgCardAlt,
  },
photoActions: {
  flexDirection: "row",
  gap: 10,
},
    photoActionBtn: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      alignItems: "center",
      borderWidth: 1.5,
      backgroundColor: colors.bgCardAlt,
    },
    photoActionText: { fontWeight: "700", fontSize: 13 },
  photoMeta: { color: colors.textMuted, fontSize: 11, textAlign: "center" },
  checkInBtn: {
    backgroundColor: colors.accentRed,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  btnDisabled: { opacity: 0.5 },
  checkInText: { color: "#fff", fontWeight: "800", letterSpacing: 0.5 },
  checkOutBtn: {
    backgroundColor: colors.accentGreen,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 4,
  },
  checkOutText: { color: "#052", fontWeight: "800", letterSpacing: 0.5 },
  done: { color: colors.textMuted, textAlign: "center", marginTop: 12 },
  footnote: { color: colors.textMuted, fontSize: 11, textAlign: "center", marginTop: 16, marginBottom: 40 },
});