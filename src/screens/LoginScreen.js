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
  Image,
} from "react-native";
import { useApp } from "../context/AppContext";
import { colors, shadowCard } from "../theme/colors";

export default function LoginScreen({ navigation }) {
  const { login } = useApp();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignIn = async () => {
    if (!id || !password) {
      setError("Please enter both Email and Password.");
      return;
    }
    const result = await login(id, password);
    if (!result.ok) setError(result.error);
    else setError("");
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Image
            source={require("../../assets/logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.subtitle}>Staff Operations</Text>

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            keyboardType="email-address"
            value={id}
            onChangeText={setId}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          {!!error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity style={styles.button} onPress={handleSignIn}>
            <Text style={styles.buttonText}>SIGN IN</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate("Register")}>
            <Text style={styles.registerLink}>
              Wala pa kay account? Mag-register dinhi
            </Text>
          </TouchableOpacity>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo accounts</Text>
            <Text style={styles.demoText}>Staff: Staff@Mangtakyu.com / staff123</Text>
            <Text style={styles.demoText}>Staff: Ken@Mangtakyu.com / 123123</Text>
            <Text style={styles.demoText}>Manager: manager@Mangtakyu.com / manager123</Text>
          </View>
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
  logo: {
    width: "100%",
    height: 140,
    alignSelf: "center",
  },
  subtitle: {
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 28,
    letterSpacing: 0.5,
    textTransform: "uppercase",
    fontSize: 12,
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
  error: { color: colors.accentRed, marginBottom: 12, fontSize: 13 },
  button: {
    backgroundColor: colors.accentRed,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 4,
  },
  demoBox: {
    marginTop: 24,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
  },
  demoTitle: { color: colors.textMuted, fontSize: 12, marginBottom: 4 },
  demoText: { color: colors.textMuted, fontSize: 12 },

  registerLink: {
  color: colors.accentOrange || "#FFA500",
  textAlign: "center",
  marginTop: 16,
  fontSize: 13,
  textDecorationLine: "underline",
},
});