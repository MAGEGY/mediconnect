import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { useTheme } from "@/hooks/useTheme";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import DispenseScreen from "@/screens/pharmacist/DispenseScreen";
import InventoryScreen from "@/screens/pharmacist/InventoryScreen";
import HistoryScreen from "@/screens/pharmacist/HistoryScreen";
import ProfileScreen from "@/screens/shared/ProfileScreen";

export type PharmacistTabParamList = {
  Dispense: undefined;
  Inventory: undefined;
  History: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<PharmacistTabParamList>();

export default function PharmacistTabNavigator() {
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<any>>();

  return (
    <Tab.Navigator
      initialRouteName="Dispense"
      screenOptions={{
        tabBarActiveTintColor: theme.tabIconSelected,
        tabBarInactiveTintColor: theme.tabIconDefault,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: theme.backgroundRoot,
          }),
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint={isDark ? "dark" : "light"}
              style={StyleSheet.absoluteFill}
            />
          ) : null,
        headerShown: true,
        headerStyle: {
          backgroundColor: theme.backgroundRoot,
        },
        headerTintColor: theme.text,
      }}
    >
      <Tab.Screen
        name="Dispense"
        component={DispenseScreen}
        options={{
          title: "Dispense",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="qrcode-scan"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Inventory"
        component={InventoryScreen}
        options={{
          title: "Inventory",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="package-variant"
              size={size}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="History"
        component={HistoryScreen}
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            navigation.navigate("Settings");
          },
        }}
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
