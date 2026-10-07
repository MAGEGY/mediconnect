import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PatientTabNavigator from "./PatientTabNavigator";
import MedicineScanScreen from "@/screens/shared/MedicineScanScreen";
import SettingsScreen from "@/screens/shared/SettingsScreen";

export type PatientStackParamList = {
  PatientTabs: undefined;
  MedicineScan: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<PatientStackParamList>();

export default function PatientStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="PatientTabs"
        component={PatientTabNavigator}
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
