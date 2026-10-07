import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import * as LocalAuthentication from "expo-local-authentication";
import { User } from "@/types";
import { storage } from "@/utils/storage";
import { userService, createTestDataIfEmpty } from "@/utils/data";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    userData: Omit<User, "id" | "createdAt" | "approvalStatus">,
    password: string,
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  authenticateWithBiometric: () => Promise<boolean>;
  isBiometricEnabled: boolean;
  toggleBiometric: () => Promise<boolean>;
  canUseBiometric: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isBiometricEnabled, setIsBiometricEnabled] = useState(false);
  const [canUseBiometric, setCanUseBiometric] = useState(false);

  useEffect(() => {
    init();
  }, []);

  const init = async () => {
    try {
      await userService.createTestUsers();
      await createTestDataIfEmpty();
    } catch (error) {
      console.error("Error initializing test data:", error);
    }
    await checkBiometricCapability();
    await loadUser();
    await loadBiometricSettings();
  };

  const loadUser = async () => {
    try {
      const savedUser = await storage.getUser();
      setUser(savedUser);
    } catch (error) {
      console.error("Error loading user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    username: string,
    password: string,
  ): Promise<boolean> => {
    try {
      const authenticatedUser = await userService.authenticate(
        username,
        password,
      );

      if (!authenticatedUser) {
        return false;
      }

      if (authenticatedUser.approvalStatus !== "approved") {
        return false;
      }

      await storage.setUser(authenticatedUser);
      setUser(authenticatedUser);
      return true;
    } catch (error) {
      console.error("Login error:", error);
      return false;
    }
  };

  const register = async (
    userData: Omit<User, "id" | "createdAt" | "approvalStatus">,
    password: string,
  ): Promise<boolean> => {
    try {
      await userService.create(userData, password);
      return true;
    } catch (error) {
      console.error("Registration error:", error);
      return false;
    }
  };

  const logout = async () => {
    await storage.removeUser();
    setUser(null);
  };

  const checkBiometricCapability = async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      setCanUseBiometric(hasHardware && isEnrolled);
    } catch (error) {
      console.error("Error checking biometric capability:", error);
      setCanUseBiometric(false);
    }
  };

  const loadBiometricSettings = async () => {
    try {
      const savedUser = await storage.getUser();
      if (savedUser) {
        setIsBiometricEnabled(savedUser.biometricEnabled || false);
      }
    } catch (error) {
      console.error("Error loading biometric settings:", error);
      setIsBiometricEnabled(false);
    }
  };

  const toggleBiometric = async (): Promise<boolean> => {
    if (!canUseBiometric) {
      return false;
    }

    try {
      // First, authenticate to enable/disable biometric
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: isBiometricEnabled
          ? "Disable biometric authentication"
          : "Enable biometric authentication",
        fallbackLabel: "Use passcode",
      });

      if (!result.success) {
        return false;
      }

      // Toggle the setting
      const newValue = !isBiometricEnabled;
      setIsBiometricEnabled(newValue);

      // Update user in storage
      if (user) {
        const updatedUser = { ...user, biometricEnabled: newValue };
        await storage.setUser(updatedUser);
        setUser(updatedUser);
      }

      return true;
    } catch (error) {
      console.error("Error toggling biometric:", error);
      return false;
    }
  };

  const authenticateWithBiometric = async (): Promise<boolean> => {
    if (!canUseBiometric || !isBiometricEnabled) {
      return false;
    }

    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: "Authenticate to access MediConnect",
        fallbackLabel: "Use passcode",
        cancelLabel: "Cancel",
      });

      if (result.success && user) {
        // Re-authenticate the user if biometric succeeds
        await storage.setUser(user);
        setUser(user);
      }

      return result.success;
    } catch (error) {
      console.error("Biometric authentication error:", error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        authenticateWithBiometric,
        isBiometricEnabled,
        toggleBiometric,
        canUseBiometric,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
