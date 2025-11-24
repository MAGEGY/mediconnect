import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import LoginScreen from '@/screens/auth/LoginScreen';
import RegisterScreen from '@/screens/auth/RegisterScreen';
import DoctorTabNavigator from './DoctorTabNavigator';
import PatientTabNavigator from './PatientTabNavigator';
import PharmacistTabNavigator from './PharmacistTabNavigator';
import { ActivityIndicator, View } from 'react-native';

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  DoctorMain: undefined;
  PatientMain: undefined;
  PharmacistMain: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user || user.approvalStatus !== 'approved') {
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
      </Stack.Navigator>
    );
  }

  const getMainNavigator = () => {
    switch (user.role) {
      case 'doctor':
      case 'lab':
      case 'physiotherapy':
      case 'radiologist':
        return <Stack.Screen name="DoctorMain" component={DoctorTabNavigator} />;
      case 'patient':
        return <Stack.Screen name="PatientMain" component={PatientTabNavigator} />;
      case 'pharmacist':
        return <Stack.Screen name="PharmacistMain" component={PharmacistTabNavigator} />;
      default:
        return <Stack.Screen name="PatientMain" component={PatientTabNavigator} />;
    }
  };

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {getMainNavigator()}
    </Stack.Navigator>
  );
}
