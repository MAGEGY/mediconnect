import React, { useState } from 'react';
import { View, StyleSheet, TextInput, Pressable, Alert } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { Card } from '@/components/Card';
import { ScreenKeyboardAwareScrollView } from '@/components/ScreenKeyboardAwareScrollView';
import { useTheme } from '@/hooks/useTheme';
import { Spacing, BorderRadius, IconSize } from '@/constants/theme';
import { userService } from '@/utils/data';

export default function AddPatientScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    nationalId: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    displayName: '',
    phoneNumber: '',
    nationalId: '',
    username: '',
    password: '',
    confirmPassword: '',
  });

  const validateForm = () => {
    const newErrors = {
      displayName: '',
      phoneNumber: '',
      nationalId: '',
      username: '',
      password: '',
      confirmPassword: '',
    };
    
    let isValid = true;

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Full name is required';
      isValid = false;
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
      isValid = false;
    } else if (!/^\+?[\d\s-]+$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Invalid phone number format';
      isValid = false;
    }

    if (!formData.nationalId.trim()) {
      newErrors.nationalId = 'National ID is required';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
      isValid = false;
    } else if (formData.username.length < 4) {
      newErrors.username = 'Username must be at least 4 characters';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
      isValid = false;
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      const newPatient = await userService.create({
        username: formData.username,
        phoneNumber: formData.phoneNumber,
        nationalId: formData.nationalId,
        displayName: formData.displayName,
        role: 'patient',
        avatarIndex: Math.floor(Math.random() * 3),
        biometricEnabled: false,
      }, formData.password);

      Alert.alert(
        'Success',
        `Patient ${formData.displayName} has been registered successfully.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to register patient');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScreenKeyboardAwareScrollView>
      <View style={styles.container}>
        <Card>
          <ThemedText style={styles.sectionTitle}>Patient Information</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Full Name *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  color: theme.text,
                  borderColor: errors.displayName ? theme.error : 'transparent'
                }
              ]}
              placeholder="Enter patient's full name"
              placeholderTextColor={theme.textSecondary}
              value={formData.displayName}
              onChangeText={(text) => {
                setFormData({ ...formData, displayName: text });
                if (errors.displayName) {
                  setErrors({ ...errors, displayName: '' });
                }
              }}
            />
            {errors.displayName ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {errors.displayName}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Phone Number *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  color: theme.text,
                  borderColor: errors.phoneNumber ? theme.error : 'transparent' 
                }
              ]}
              placeholder="+20 123 456 7890"
              placeholderTextColor={theme.textSecondary}
              value={formData.phoneNumber}
              onChangeText={(text) => {
                setFormData({ ...formData, phoneNumber: text });
                if (errors.phoneNumber) {
                  setErrors({ ...errors, phoneNumber: '' });
                }
              }}
              keyboardType="phone-pad"
            />
            {errors.phoneNumber ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {errors.phoneNumber}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              National ID *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  color: theme.text,
                  borderColor: errors.nationalId ? theme.error : 'transparent' 
                }
              ]}
              placeholder="Enter national ID number"
              placeholderTextColor={theme.textSecondary}
              value={formData.nationalId}
              onChangeText={(text) => {
                setFormData({ ...formData, nationalId: text });
                if (errors.nationalId) {
                  setErrors({ ...errors, nationalId: '' });
                }
              }}
            />
            {errors.nationalId ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {errors.nationalId}
              </ThemedText>
            ) : null}
          </View>
        </Card>

        <Card style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Account Credentials</ThemedText>
          
          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Username *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  color: theme.text,
                  borderColor: errors.username ? theme.error : 'transparent' 
                }
              ]}
              placeholder="Choose a unique username"
              placeholderTextColor={theme.textSecondary}
              value={formData.username}
              onChangeText={(text) => {
                setFormData({ ...formData, username: text.toLowerCase() });
                if (errors.username) {
                  setErrors({ ...errors, username: '' });
                }
              }}
              autoCapitalize="none"
            />
            {errors.username ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {errors.username}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Password *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  color: theme.text,
                  borderColor: errors.password ? theme.error : 'transparent' 
                }
              ]}
              placeholder="Minimum 8 characters"
              placeholderTextColor={theme.textSecondary}
              value={formData.password}
              onChangeText={(text) => {
                setFormData({ ...formData, password: text });
                if (errors.password) {
                  setErrors({ ...errors, password: '' });
                }
              }}
              secureTextEntry
            />
            {errors.password ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {errors.password}
              </ThemedText>
            ) : null}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: theme.textSecondary }]}>
              Confirm Password *
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                { 
                  backgroundColor: theme.backgroundDefault, 
                  color: theme.text,
                  borderColor: errors.confirmPassword ? theme.error : 'transparent' 
                }
              ]}
              placeholder="Re-enter password"
              placeholderTextColor={theme.textSecondary}
              value={formData.confirmPassword}
              onChangeText={(text) => {
                setFormData({ ...formData, confirmPassword: text });
                if (errors.confirmPassword) {
                  setErrors({ ...errors, confirmPassword: '' });
                }
              }}
              secureTextEntry
            />
            {errors.confirmPassword ? (
              <ThemedText style={[styles.errorText, { color: theme.error }]}>
                {errors.confirmPassword}
              </ThemedText>
            ) : null}
          </View>
        </Card>

        <Pressable
          style={[
            styles.submitButton,
            { backgroundColor: loading ? theme.textSecondary : theme.primary }
          ]}
          onPress={handleSubmit}
          disabled={loading}
          android_ripple={{ color: theme.buttonText + '40' }}
        >
          <MaterialCommunityIcons 
            name={loading ? "loading" : "account-plus"} 
            size={IconSize.sm} 
            color={theme.buttonText} 
          />
          <ThemedText style={[styles.submitButtonText, { color: theme.buttonText }]}>
            {loading ? 'Registering...' : 'Register Patient'}
          </ThemedText>
        </Pressable>
      </View>
    </ScreenKeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
  },
  section: {
    marginTop: Spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: Spacing.sm,
  },
  input: {
    height: Spacing.inputHeight,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.lg,
    fontSize: 16,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: Spacing.xs,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: Spacing.buttonHeight,
    borderRadius: BorderRadius.sm,
    marginTop: Spacing.xl,
    gap: Spacing.sm,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
