import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DoctorTabNavigator from './DoctorTabNavigator';
import { User } from '@/types';

export type DoctorStackParamList = {
  DoctorTabs: undefined;
  PatientDetail: { patientId: string };
  CreatePrescription: { patientId: string };
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
        component={require('@/screens/doctor/PatientDetailScreen').default}
        options={{
          title: 'Patient Details',
        }}
      />
      <Stack.Screen
        name="CreatePrescription"
        component={require('@/screens/doctor/CreatePrescriptionScreen').default}
        options={{
          title: 'New Prescription',
        }}
      />
    </Stack.Navigator>
  );
}
