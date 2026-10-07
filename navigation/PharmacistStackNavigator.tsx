import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PharmacistTabNavigator from "./PharmacistTabNavigator";
import MedicineScanScreen from "@/screens/shared/MedicineScanScreen";
import SettingsScreen from "@/screens/shared/SettingsScreen";

export type PharmacistStackParamList = {
  PharmacistTabs: undefined;
  MedicineScan: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<PharmacistStackParamList>();

export default function PharmacistStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="PharmacistTabs"
        component={PharmacistTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="MedicineScan"
        component={MedicineScanScreen}
        options={{
          title: "Scan Medicine",
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: "Settings",
        }}
      />
    </Stack.Navigator>
  );
}
