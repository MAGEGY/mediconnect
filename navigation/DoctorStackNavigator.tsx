import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import DoctorTabNavigator from "./DoctorTabNavigator";
import PatientDetailScreen from "@/screens/doctor/PatientDetailScreen";
import CreatePrescriptionScreen from "@/screens/doctor/CreatePrescriptionScreen";
import AddPatientScreen from "@/screens/doctor/AddPatientScreen";
import MedicineScanScreen from "@/screens/shared/MedicineScanScreen";
import SettingsScreen from "@/screens/shared/SettingsScreen";
import { User } from "@/types";

export type DoctorStackParamList = {
  DoctorTabs: undefined;
  PatientDetail: { patientId: string };
  CreatePrescription: { patientId: string };
  AddPatient: undefined;
  MedicineScan: undefined;
  Settings: undefined;
};

const Stack = createNativeStackNavigator<DoctorStackParamList>();

export default function DoctorStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
      }}
    >
      <Stack.Screen
        name="DoctorTabs"
        component={DoctorTabNavigator}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PatientDetail"
        component={PatientDetailScreen}
        options={{
          title: "Patient Details",
        }}
      />
      <Stack.Screen
        name="CreatePrescription"
        component={CreatePrescriptionScreen}
        options={{
          title: "New Prescription",
        }}
      />
      <Stack.Screen
        name="AddPatient"
        component={AddPatientScreen}
        options={{
          title: "Add Patient",
        }}
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
