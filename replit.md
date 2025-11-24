# MedRecord - Medical Records & Prescription Management App

## Project Overview
Comprehensive Android medical records and prescription management application with three role-based interfaces (Doctor, Patient, Pharmacist). Built using Expo (React Native) with Material Design 3 aesthetic and medical-themed color palette.

## Features Implemented

### Authentication System
- Multi-factor authentication with username, phone number, national ID, and password
- Biometric login support (fingerprint/face) 
- Role-based registration (Patient, Doctor, Pharmacist, Lab, Physiotherapy, Radiologist)
- Admin authorization workflow for new users (pending/approved/rejected status)
- Secure password hashing using custom hash function
- User database stored in AsyncStorage with separation of concerns (current user vs. users database)

### User Roles & Navigation
- **Doctors**: Patient management, prescription creation, vital signs recording, QR scanning
- **Patients**: Medicine tracking, lifestyle data, allergy management, prescription viewing
- **Pharmacists**: Prescription dispensing, inventory management, QR scanning

### Data Models
- Users with role-based access control
- Medicines database with interactions tracking
- Prescriptions with QR codes and web links
- Vital signs and lifestyle data tracking
- Patient allergies management
- Dispensing records with partial dispensing support

### Design System
- Primary color: Medical blue (#0077B6)
- Material Design 3 components
- iOS 26 liquid glass interface design
- Safe area insets handling
- Keyboard-aware scrolling for input fields
- Custom themed components (ThemedText, ThemedView, Card)

## Technology Stack
- **Framework**: Expo SDK 54
- **Language**: TypeScript
- **Storage**: AsyncStorage
- **Authentication**: expo-local-authentication for biometrics
- **Navigation**: React Navigation 7
- **UI**: React Native with Material Design 3

## File Structure
```
/
├── app/                    # Expo router (not used, using React Navigation)
├── components/             # Reusable UI components
│   ├── Card.tsx
│   ├── ErrorBoundary.tsx
│   ├── ScreenScrollView.tsx
│   ├── ScreenKeyboardAwareScrollView.tsx
│   ├── ThemedText.tsx
│   └── ThemedView.tsx
├── constants/              # Theme and constants
│   └── theme.ts
├── contexts/               # React contexts
│   └── AuthContext.tsx    # Authentication state management
├── hooks/                  # Custom React hooks
│   ├── useScreenInsets.ts
│   └── useTheme.ts
├── navigation/             # Navigation setup
│   ├── RootNavigator.tsx
│   ├── DoctorTabNavigator.tsx
│   ├── PatientTabNavigator.tsx
│   └── PharmacistTabNavigator.tsx
├── screens/                # Screen components
│   ├── auth/               # Authentication screens
│   ├── doctor/             # Doctor role screens
│   ├── patient/            # Patient role screens
│   ├── pharmacist/         # Pharmacist role screens
│   └── shared/             # Shared screens (Profile)
├── types/                  # TypeScript type definitions
│   └── index.ts
├── utils/                  # Utility functions
│   ├── data.ts            # Data services and mock data
│   └── storage.ts         # AsyncStorage wrapper
└── design_guidelines.md   # Design and implementation guidelines
```

## Data Services
All data services are in `utils/data.ts`:
- `userService`: User management and authentication
- `medicineService`: Medicine database management
- `patientService`: Patient data retrieval
- `prescriptionService`: Prescription CRUD operations
- `vitalSignsService`: Vital signs tracking
- `lifestyleService`: Lifestyle data (BP, steps, calories)
- `dispensingService`: Dispensing records
- `allergyService`: Patient allergy management

## Recent Changes
- Fixed useScreenInsets hook to support screens outside tab navigator context
- Implemented real user authentication with password hashing
- Added userService with create, authenticate, and user management methods
- Added allergyService for patient allergy tracking
- Updated AuthContext to validate credentials against user database
- Updated RegisterScreen with password fields and validation
- Changed storage keys to separate current user from users database

## Known Limitations
- All data is stored locally in AsyncStorage (no backend/cloud sync)
- Mock medicine data is used as fallback when database is empty
- SMS integration not yet implemented
- OCR functionality not yet implemented
- Drug interaction checking uses basic string matching
- No real-time notifications

## Next Steps
1. Implement patient QR code scanning with navigation to patient records
2. Build prescription creation workflow with drug interaction checking
3. Complete prescription dispensing flow with partial dispensing
4. Build medicine inventory management forms
5. Implement culturally-tailored medical advice
6. Add QR code generation for patient IDs and prescriptions
7. Integrate SMS functionality via Twilio
8. Add OCR for medicine boxes and prescriptions
9. Integrate real drug interaction API
10. Implement push notifications
11. Build analytics dashboard for doctors

## User Preferences
- Material Design 3 aesthetic for Android
- Medical-themed color palette (blue primary)
- Offline-first approach with local storage
- Multi-role support with proper access control
