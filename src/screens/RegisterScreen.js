import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebaseConfig";
import { colors, shadowCard } from "../theme/colors";

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      setError("Palihug pun-a ang tanan nga fields.");
      return;
    }

    try {
      // 1. Buhaton ang Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // 2. I-save ang details sa Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: email,
        role: role,
        assignedStation: null,
        createdAt: serverTimestamp(),
      });

      Alert.alert("Success", "Nahuman ang registration! Pwede na ka mo-login.");
      navigation.navigate("Login");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Mang Takyu Management System</Text>

          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={setFullName}
          />

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Minimum 6 characters"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Text style={styles.label}>Pili og Role</Text>
          <View style={styles.roleContainer}>
            <TouchableOpacity
              style={[styles.roleButton, role === "staff" && styles.roleActive]}
              onPress={() => setRole("staff")}
            >
              <Text
                style={
                  role === "staff" ? styles.roleTextActive : styles.roleText
                }
              >
                Staff
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.roleButton,
                role === "manager" && styles.roleActive,
              ]}
              onPress={() => setRole("manager")}
            >
              <Text
                style={
                  role === "manager" ? styles.roleTextActive : styles.roleText
                }
              >
                Manager
              </Text>
            </TouchableOpacity>
          </View>

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleRegister}>
            <Text style={styles.buttonText}>REGISTER</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={styles.loginLink}>
              Naa na kay account? Balik sa Login
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.bg },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: colors.bgCard,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadowCard,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 24,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  label: { color: colors.textSecondary, marginBottom: 6, fontSize: 13 },
  input: {
    backgroundColor: colors.bgCardAlt,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.textPrimary,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  roleContainer: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: colors.bgCardAlt,
  },
  roleActive: {
    backgroundColor: colors.accentRed,
    borderColor: colors.accentRed,
  },
  roleText: { color: colors.textPrimary },
  roleTextActive: { color: "#fff", fontWeight: "700" },
  error: { color: colors.accentRed, marginBottom: 12, fontSize: 13 },
  button: {
    backgroundColor: colors.accentRed,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  buttonText: { color: "#fff", fontWeight: "700", letterSpacing: 0.5 },
  loginLink: {
    color: colors.accentOrange || "#FFA500",
    textAlign: "center",
    marginTop: 16,
    fontSize: 13,
    textDecorationLine: "underline",
  },
});