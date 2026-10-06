import React, { useEffect, useState } from "react";
import { Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

export default function NotificationToast() {
  const { notifications, user, markNotificationRead } = useApp();
  const insets = useSafeAreaInsets();
  const [current, setCurrent] = useState(null);
  const [opacity] = useState(new Animated.Value(0));

  // Pangitaa ang pinaka-bag-o nga unread notification
  useEffect(() => {
    if (!user || notifications.length === 0) return;
    const unread = notifications.find(
      (n) => !(n.readBy || []).includes(user.uid)
    );
    if (unread && (!current || current.id !== unread.id)) {
      setCurrent(unread);
      Animated.timing(opacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }).start(() => setCurrent(null));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [notifications, user, current, opacity]);

  if (!current) return null;

  const handlePress = async () => {
    await markNotificationRead(current.id);
    Animated.timing(opacity, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => setCurrent(null));
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { top: insets.top + 8, opacity },
      ]}
    >
      <TouchableOpacity style={styles.toast} onPress={handlePress} activeOpacity={0.9}>
        <Text style={styles.title}>{current.title}</Text>
        <Text style={styles.message}>{current.message}</Text>
        <Text style={styles.from}>— {current.from}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 9999,
    elevation: 9999,
  },
  toast: {
    backgroundColor: colors.accentGold,
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    borderColor: "#B8860B",
    ...shadowCard,
  },
  title: { color: "#1a1a1a", fontWeight: "900", fontSize: 15 },
  message: { color: "#1a1a1a", marginTop: 4, fontSize: 13, lineHeight: 18 },
  from: { color: "#5a4000", marginTop: 8, fontSize: 11, fontStyle: "italic" },
});