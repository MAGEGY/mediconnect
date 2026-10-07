import React from 'react';
import { Text, View, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MediConnect v2.0</Text>
      <Text style={styles.text}>Medical Management System</Text>
      <Text style={styles.text}>✅ App is Working!</Text>
      <Text style={styles.text}>📱 Ready for APK Build</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#0077B6',
  },
  text: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
});
