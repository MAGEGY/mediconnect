import React, { useState } from "react";
import {
  View,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { UserRole } from "@/types";

const ROLES: { label: string; value: UserRole }[] = [
  { label: "Patient", value: "patient" },
  { label: "Doctor", value: "doctor" },
  { label: "Pharmacist", value: "pharmacist" },
  { label: "Lab Technician", value: "lab" },
  { label: "Physiotherapist", value: "physiotherapy" },
  { label: "Radiologist", value: "radiologist" },
];

export default function RegisterScreen({ navigation }: any) {
  const { theme } = useTheme();
  const { register } = useAuth();
  const [username, setUsername] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [nationalId, setNationalId] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole>("patient");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (
      !username ||
      !phoneNumber ||
      !nationalId ||
      !displayName ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await register(
        {
          username,
          phoneNumber,
          nationalId,
          displayName,
          role: selectedRole,
          avatarIndex: Math.floor(Math.random() * 3),
          biometricEnabled: false,
        },
        password,
      );

      Alert.alert(
        "Registration Submitted",
        "Your account is pending admin approval. You will be notified once approved.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      Alert.alert("Error", "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedView style={styles.container}>
        <ThemedText style={[styles.title, { color: theme.text }]}>
          Create Account
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Complete the form to register for MedRecord
        </ThemedText>

        <View style={styles.form}>
          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="Display Name"
            placeholderTextColor={theme.textSecondary}
            value={displayName}
            onChangeText={setDisplayName}
          />

          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="Username"
            placeholderTextColor={theme.textSecondary}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="Phone Number"
            placeholderTextColor={theme.textSecondary}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />

          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="National ID"
            placeholderTextColor={theme.textSecondary}
            value={nationalId}
            onChangeText={setNationalId}
          />

          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="Password"
            placeholderTextColor={theme.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TextInput
            style={[
              styles.input,
              { color: theme.text, backgroundColor: theme.surface },
            ]}
            placeholder="Confirm Password"
            placeholderTextColor={theme.textSecondary}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <ThemedText style={[styles.label, { color: theme.text }]}>
            Select Your Role
          </ThemedText>
          <View style={styles.roleContainer}>
            {ROLES.map((role) => (
              <Pressable
                key={role.value}
                style={[
                  styles.roleButton,
                  {
                    backgroundColor:
                      selectedRole === role.value
                        ? theme.primary
                        : theme.surface,
                    borderColor: theme.divider,
                  },
                ]}
                onPress={() => setSelectedRole(role.value)}
              >
                <ThemedText
                  style={{
                    color:
                      selectedRole === role.value
                        ? theme.buttonText
                        : theme.text,
                    fontSize: 14,
                  }}
                >
                  {role.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleRegister}
            disabled={loading}
          >
            <ThemedText
              style={[styles.buttonText, { color: theme.buttonText }]}
            >
              {loading ? "REGISTERING..." : "REGISTER"}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <ThemedText style={[styles.backText, { color: theme.link }]}>
              Already have an account? Log in
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginTop: Spacing["3xl"],
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: Spacing["2xl"],
  },
  form: {
    width: "100%",
  },
  input: {
    height: Spacing.inputHeight,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.sm,
    fontSize: 16,
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: Spacing.md,
  },
  roleContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  roleButton: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    borderWidth: 1,
  },
  button: {
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    justifyContent: "center",
    alignItems: "center",
    marginTop: Spacing.lg,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  backButton: {
    marginTop: Spacing["2xl"],
    alignItems: "center",
  },
  backText: {
    fontSize: 14,
  },
});
