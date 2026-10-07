import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Animated,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAppTranslation } from "@/hooks/useTranslation";
import { useAuth } from "@/contexts/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

type BiometricLoginScreenProps = {
  navigation: NativeStackNavigationProp<any>;
};

export default function BiometricLoginScreen({
  navigation,
}: BiometricLoginScreenProps) {
  const { theme } = useTheme();
  const { t } = useAppTranslation();
  const {
    user,
    authenticateWithBiometric,
    isBiometricEnabled,
    canUseBiometric,
  } = useAuth();
  const insets = useSafeAreaInsets();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Check if biometric is available and enabled
    if (!canUseBiometric || !isBiometricEnabled || !user) {
      Alert.alert(
        "Biometric Login",
        "Biometric authentication is not available or enabled. Please enable it in settings.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
      return;
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ]),
      ),
    ]).start();

    // Auto-trigger biometric after a short delay
    const timer = setTimeout(() => {
      handleBiometricAuth();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;

    setIsAuthenticating(true);
    try {
      const success = await authenticateWithBiometric();

      if (success) {
        // Navigate to main app - the RootNavigator will handle this automatically
        // since the user state will be updated
        Alert.alert("Success", "Biometric authentication successful!", [
          { text: "OK" },
        ]);
      } else {
        Alert.alert(
          "Authentication Failed",
          "Biometric authentication failed. Please try again.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "An error occurred during biometric authentication.",
        [{ text: "OK" }],
      );
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleManualLogin = () => {
    navigation.navigate("Login");
  };

  if (!canUseBiometric || !isBiometricEnabled || !user) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.centerContent}>
          <MaterialCommunityIcons
            name="fingerprint-off"
            size={64}
            color={theme.error}
          />
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Biometric Login Unavailable
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Please enable biometric authentication in settings
          </ThemedText>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.primary }]}
            onPress={handleManualLogin}
          >
            <ThemedText style={styles.buttonText}>Go to Login</ThemedText>
          </TouchableOpacity>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.content}>
        <Animated.View style={[styles.iconContainer, { opacity: fadeAnim }]}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <MaterialCommunityIcons
              name="fingerprint"
              size={120}
              color={theme.primary}
            />
          </Animated.View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, { opacity: fadeAnim }]}>
          <ThemedText style={[styles.title, { color: theme.text }]}>
            Welcome back, {user.displayName}!
          </ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Use your biometric to sign in
          </ThemedText>
        </Animated.View>

        <TouchableOpacity
          style={[styles.biometricButton, { backgroundColor: theme.surface }]}
          onPress={handleBiometricAuth}
          disabled={isAuthenticating}
        >
          {isAuthenticating ? (
            <ActivityIndicator size="large" color={theme.primary} />
          ) : (
            <MaterialCommunityIcons
              name="fingerprint"
              size={60}
              color={theme.primary}
            />
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.manualButton}
          onPress={handleManualLogin}
        >
          <ThemedText
            style={[styles.manualButtonText, { color: theme.textSecondary }]}
          >
            Use password instead
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  iconContainer: {
    marginBottom: 40,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  biometricButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 40,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  manualButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  manualButtonText: {
    fontSize: 16,
    textDecorationLine: "underline",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginTop: 24,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
