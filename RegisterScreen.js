import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebaseConfig'; // Adjust path if needed

export default function RegisterScreen({ navigation }) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff'); // Default role

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Palihug pun-a ang tanan nga fields.');
      return;
    }

    try {
      // 1. Buhaton ang Firebase Auth account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. I-save ang details sa Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName: fullName,
        email: email,
        role: role, // "staff" o "manager"
        assignedStation: null,
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Nahuman ang registration!');
      navigation.navigate('Login'); // Adto sa Login screen
    } catch (error) {
      console.error(error);
      Alert.alert('Registration Failed', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>Pili og Role:</Text>
      <View style={styles.roleContainer}>
        <TouchableOpacity
          style={[styles.roleButton, role === 'staff' && styles.roleActive]}
          onPress={() => setRole('staff')}
        >
          <Text style={role === 'staff' ? styles.roleTextActive : styles.roleText}>Staff</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.roleButton, role === 'manager' && styles.roleActive]}
          onPress={() => setRole('manager')}
        >
          <Text style={role === 'manager' ? styles.roleTextActive : styles.roleText}>Manager</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>REGISTER</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8, marginBottom: 15 },
  label: { fontSize: 16, marginBottom: 10, fontWeight: '600' },
  roleContainer: { flexDirection: 'row', gap: 10, marginBottom: 20 },
  roleButton: { flex: 1, padding: 12, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, alignItems: 'center' },
  roleActive: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  roleText: { color: '#333' },
  roleTextActive: { color: '#fff', fontWeight: 'bold' },
  button: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});