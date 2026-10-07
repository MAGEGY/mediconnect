import React, { useState, useEffect } from "react";
import { View, StyleSheet, TextInput, Pressable, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "@/contexts/AuthContext";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ScreenKeyboardAwareScrollView } from "@/components/ScreenKeyboardAwareScrollView";
import { useTheme } from "@/hooks/useTheme";
import { storage } from "@/utils/storage";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function LoginScreen({ navigation }: any) {
  const { theme } = useTheme();
  const {
    login,
    authenticateWithBiometric,
    isBiometricEnabled,
    canUseBiometric,
  } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showBiometricOption, setShowBiometricOption] = useState(false);

  useEffect(() => {
    // Check if user has saved credentials and biometric is enabled
    const checkBiometricAvailability = async () => {
      try {
        const savedUser = await storage.getUser();
        setShowBiometricOption(
          canUseBiometric &&
            isBiometricEnabled &&
            savedUser &&
            savedUser.biometricEnabled,
        );
      } catch (error) {
        setShowBiometricOption(false);
      }
    };

    checkBiometricAvailability();
  }, [canUseBiometric, isBiometricEnabled]);

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Error", "Please enter username and password");
      return;
    }

    setLoading(true);
    try {
      const success = await login(username, password);
      if (!success) {
        Alert.alert(
          "Login Failed",
          "Invalid credentials or account not approved",
        );
      }
    } catch (error) {
      Alert.alert("Error", "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setLoading(true);
    try {
      const success = await authenticateWithBiometric();
      if (!success) {
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication was not successful.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Biometric authentication failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricScreen = () => {
    navigation.navigate("BiometricLogin");
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText style={[styles.title, { color: theme.primary }]}>
            MediConnect
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Medical Records & OCR Medicine Scanning
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Feather
              name="user"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
            />
            <TextInput
              style={[
                styles.input,
                { color: theme.text, backgroundColor: theme.surface },
              ]}
              placeholder="Username or Phone Number"
              placeholderTextColor={theme.textSecondary}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Feather
              name="lock"
              size={20}
              color={theme.textSecondary}
              style={styles.inputIcon}
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
            />
          </View>

          <Pressable
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleLogin}
            disabled={loading}
          >
            <ThemedText
              style={[styles.buttonText, { color: theme.buttonText }]}
            >
              {loading ? "LOGGING IN..." : "LOG IN"}
            </ThemedText>
          </Pressable>

          {showBiometricOption && (
            <Pressable
              style={styles.biometricButton}
              onPress={handleBiometricScreen}
              disabled={loading}
            >
              <MaterialCommunityIcons
                name="fingerprint"
                size={32}
                color={theme.primary}
              />
              <ThemedText
                style={[styles.biometricText, { color: theme.primary }]}
              >
                Use Biometric
              </ThemedText>
            </Pressable>
          )}

          <Pressable onPress={() => navigation.navigate("Register")}>
            <ThemedText style={[styles.registerText, { color: theme.link }]}>
              Don't have an account? Register
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
  header: {
    alignItems: "center",
    marginTop: Spacing["5xl"],
    marginBottom: Spacing["4xl"],
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: Spacing.sm,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.lg,
    position: "relative",
  },
  inputIcon: {
    position: "absolute",
    left: Spacing.lg,
    zIndex: 1,
  },
  input: {
    flex: 1,
    height: Spacing.inputHeight,
    paddingLeft: Spacing["4xl"],
    paddingRight: Spacing.lg,
    borderRadius: BorderRadius.sm,
    fontSize: 15,
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
  biometricButton: {
    alignItems: "center",
    marginTop: Spacing["3xl"],
  },
  biometricText: {
    marginTop: Spacing.sm,
    fontSize: 14,
  },
  registerText: {
    textAlign: "center",
    marginTop: Spacing["3xl"],
    fontSize: 14,
  },
});
