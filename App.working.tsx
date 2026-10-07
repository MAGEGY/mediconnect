import React from "react";
import { StyleSheet, View, Text, Button, TextInput, Alert } from "react-native";
import { useState } from "react";

export default function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = () => {
    if (username === "doctor1" && password === "Doctor123!") {
      Alert.alert("Success", "Welcome Doctor!");
    } else if (username === "patient1" && password === "Patient123!") {
      Alert.alert("Success", "Welcome Patient!");
    } else if (username === "pharmacist1" && password === "Pharma123!") {
      Alert.alert("Success", "Welcome Pharmacist!");
    } else {
      Alert.alert("Error", "Invalid credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MediConnect v2.0</Text>
      <Text style={styles.subtitle}>Medical Management System</Text>
      
      <View style={styles.form}>
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
        <Button title="Login" onPress={handleLogin} />
      </View>

      <View style={styles.testInfo}>
        <Text style={styles.testTitle}>Test Users:</Text>
        <Text style={styles.testText}>Doctor: doctor1 / Doctor123!</Text>
        <Text style={styles.testText}>Patient: patient1 / Patient123!</Text>
        <Text style={styles.testText}>Pharmacist: pharmacist1 / Pharma123!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#0077B6",
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
  },
  form: {
    width: "100%",
    maxWidth: 300,
    gap: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  testInfo: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#e8f4f8",
    borderRadius: 8,
    width: "100%",
    maxWidth: 300,
  },
  testTitle: {
    fontWeight: "bold",
    marginBottom: 5,
    color: "#0077B6",
  },
  testText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
});
