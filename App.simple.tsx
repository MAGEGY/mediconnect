import React from "react";
import { StyleSheet, View, Text, Button, TextInput, Alert, ScrollView } from "react-native";
import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showLogin, setShowLogin] = useState(false);

  const handleLogin = () => {
    if (username === "doctor1" && password === "Doctor123!") {
      Alert.alert("Success", "Welcome Doctor!\nFeatures:\n• Patient Management\n• Prescriptions\n• Medical Records");
    } else if (username === "patient1" && password === "Patient123!") {
      Alert.alert("Success", "Welcome Patient!\nFeatures:\n• View Medical Records\n• Prescriptions\n• Book Appointments");
    } else if (username === "pharmacist1" && password === "Pharma123!") {
      Alert.alert("Success", "Welcome Pharmacist!\nFeatures:\n• Medicine Dispensing\n• Inventory Management\n• Prescription Processing");
    } else {
      Alert.alert("Error", "Invalid credentials");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏥 MediConnect v2.0</Text>
      <Text style={styles.subtitle}>Medical Management System</Text>
      
      <View style={styles.features}>
        <Text style={styles.featureTitle}>🌟 Features:</Text>
        <Text style={styles.featureText}>• Multi-role Authentication</Text>
        <Text style={styles.featureText}>• Patient Records Management</Text>
        <Text style={styles.featureText}>• Prescription System</Text>
        <Text style={styles.featureText}>• Medicine Database (6,500+ items)</Text>
        <Text style={styles.featureText}>• Multi-lingual Support (English/Arabic)</Text>
        <Text style={styles.featureText}>• Biometric Authentication</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.loginTitle}>Login</Text>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <Button title="Login" onPress={handleLogin} color="#0077B6" />
      </View>

      <View style={styles.testInfo}>
        <Text style={styles.testTitle}>📱 Test Users:</Text>
        <Text style={styles.testText}>Doctor: doctor1 / Doctor123!</Text>
        <Text style={styles.testText}>Patient: patient1 / Patient123!</Text>
        <Text style={styles.testText}>Pharmacist: pharmacist1 / Pharma123!</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0077B6",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
  },
  features: {
    backgroundColor: "#e8f4f8",
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    width: "100%",
    maxWidth: 350,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0077B6",
  },
  featureText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 5,
  },
  form: {
    width: "100%",
    maxWidth: 300,
    gap: 15,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#0077B6",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  testInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#fff3cd",
    borderRadius: 8,
    width: "100%",
    maxWidth: 350,
    borderLeftWidth: 4,
    borderLeftColor: "#ffc107",
  },
  testTitle: {
    fontWeight: "bold",
    marginBottom: 8,
    color: "#856404",
    fontSize: 16,
  },
  testText: {
    fontSize: 12,
    color: "#856404",
    marginBottom: 3,
  },
});
