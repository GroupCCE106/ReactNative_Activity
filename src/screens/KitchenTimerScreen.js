import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Platform } from "react-native";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

function formatRemaining(t) {
  const elapsed = (Date.now() - t.startedAt) / 1000;
  const remaining = Math.max(0, t.durationSec - elapsed);
  const m = Math.floor(remaining / 60);
  const s = Math.floor(remaining % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function KitchenTimerScreen() {
  const { timers, startTimer, dismissTimer, sendNotification, user } = useApp();

  const handleNotify = async (t) => {
    // 🔔 I-send ang notification sa tanan
    await sendNotification(
      "🍗 Chicken Batch Ready!",
      `${t.label} is ready to serve!`,
      "timer_ready"
    );
    // I-dismiss ang timer pagkahuman ma-notify
    await dismissTimer(t.id);
    // Confirmation alert (para sa nag-tap)
    Alert.alert("Team Notified", `"${t.label}" — gi-alert na ang tanan nga staff!`);
  };

  const handleStartTimer = async () => {
    await startTimer("Fresh Chicken Batch");
  };

  const handleCancel = (t) => {
    if (Platform.OS === "web") {
      // 🌐 Web: gamiton ang browser confirm dialog
      const confirmed = window.confirm(
        `Sigurado ka ba nga i-cancel ang "${t.label}"?`
      );
      if (confirmed) dismissTimer(t.id);
    } else {
      // 📱 Mobile: gamiton ang native Alert with buttons
      Alert.alert(
        "Cancel Batch",
        `Sigurado ka ba nga i-cancel ang "${t.label}"?`,
        [
          { text: "Dili", style: "cancel" },
          {
            text: "Oo, i-cancel",
            style: "destructive",
            onPress: () => dismissTimer(t.id),
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ padding: 16 }}>
      <TouchableOpacity style={styles.newBatchBtn} onPress={handleStartTimer}>
        <Text style={styles.newBatchText}>+ START NEW 12-MIN BATCH</Text>
      </TouchableOpacity>

      {timers.length === 0 && (
        <Text style={styles.empty}>
          No active batches. Start one above, or it will auto-start when a chicken item is ordered.
        </Text>
      )}

      {timers.map((t) => {
        const ready = t.status === "ready";
        return (
          <View
            key={t.id}
            style={[
              styles.card,
              { borderColor: ready ? colors.accentGreen : colors.accentGold },
            ]}
          >
            <Text style={styles.label}>{t.label}</Text>

            {/* Kinsa ang nag-start */}
            {t.startedBy && (
              <Text style={styles.startedBy}>Started by: {t.startedBy}</Text>
            )}

            <View style={styles.circleWrap}>
              <View
                style={[
                  styles.circle,
                  {
                    borderColor: ready ? colors.accentGreen : colors.accentGold,
                  },
                ]}
              >
                <Text style={styles.timerText}>
                  {ready ? "READY" : formatRemaining(t)}
                </Text>
              </View>
            </View>

            <Text style={styles.status}>
              {ready
                ? "Batch is ready to serve — i-notify ang team!"
                : "Frying in progress…"}
            </Text>

            {ready ? (
              <TouchableOpacity
                style={styles.notifyBtn}
                onPress={() => handleNotify(t)}
              >
                <Text style={styles.notifyBtnText}>📢 NOTIFY TEAM</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => handleCancel(t)}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  newBatchBtn: {
    backgroundColor: colors.accentRed,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginBottom: 20,
  },
  newBatchText: { color: "#fff", fontWeight: "700" },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    marginTop: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1.5,
    alignItems: "center",
    ...shadowCard,
  },
  label: {
    color: colors.textPrimary,
    fontWeight: "700",
    fontSize: 16,
    marginBottom: 4,
  },
  startedBy: {
    color: colors.textMuted,
    fontSize: 11,
    fontStyle: "italic",
    marginBottom: 12,
  },
  circleWrap: { marginBottom: 14 },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.bgCardAlt,
  },
  timerText: { color: colors.textPrimary, fontSize: 20, fontWeight: "800" },
  status: {
    color: colors.textSecondary,
    marginBottom: 14,
    textAlign: "center",
  },
  notifyBtn: {
    backgroundColor: colors.accentGreen,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  notifyBtnText: { color: "#052", fontWeight: "800" },
  cancelBtn: { paddingVertical: 8, paddingHorizontal: 16 },
  cancelBtnText: { color: colors.textMuted },
});