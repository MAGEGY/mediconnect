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
│   ├── theme.ts
│   └── medicinesDatabase.ts  # 6,522-medicine comprehensive database
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
│   ├── storage.ts         # AsyncStorage wrapper
│   └── medicineNormalization.ts  # Trade name normalization
├── scripts/                # Build and data processing scripts
│   └── convert_excel_to_db.py  # Excel to TypeScript converter
├── assets/                 # Static assets
│   ├── medicines_full_database.csv  # Medicine database backup
│   └── medicines_tradenames.csv     # Trade name mappings
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

## Recent Changes (November 24, 2025)
- **MAJOR: Comprehensive Medicine Database**: Upgraded from 56-medicine sample to **6,522 real medicines** extracted from tarshouby.xlsx Excel file
- **Python Conversion Script**: Created automated script (scripts/convert_excel_to_db.py) to extract medicine data into TypeScript constants
- **Medicine Database Structure**: Each medicine now has id, name, genericName, tradeName, strength, dosageForm, fullProductName, manufacturer
- **Database Backup**: CSV backup created at assets/medicines_full_database.csv for reference
- **Mock Data Fixes**: Fixed outdated prescription and vital signs mock data to match current interfaces (medicines array, bloodPressureSystolic/Diastolic)
- **Drug Interaction System**: Integrated OpenFDA Drug API for real-time drug interaction checking
- **Medicine Normalization**: Built service to map trade names to generic names using local CSV database
- **Doctor Override System**: Implemented cross-platform override workflow with mandatory justification (10+ chars)
- **TextInputModal Component**: Created Android-compatible alternative to iOS-only Alert.prompt
- **Navigation Fixes**: Fixed patient card navigation to PatientDetailScreen
- **Card Component**: Fixed to properly render children instead of placeholder text
- **Type Fixes**: Corrected VitalSign bloodPressure field reference in PatientDetailScreen (bloodPressureSystolic/Diastolic)
- **No Emojis**: All emoji usage removed from UI, replaced with text-based severity labels
- Fixed useScreenInsets hook to support screens outside tab navigator context
- Implemented real user authentication with SHA-256 password hashing with per-user salts
- Added userService with create, authenticate, and user management methods
- Added allergyService for patient allergy tracking
- Updated AuthContext to validate credentials against user database
- Changed storage keys to separate current user from users database

## Known Limitations
- All data is stored locally in AsyncStorage (no backend/cloud sync)
- SMS integration not yet implemented  
- OCR functionality not yet implemented
- No real-time notifications
- All workflows need comprehensive testing on physical Android device via Expo Go

## Next Steps
1. Complete prescription dispensing flow in PharmacistTabNavigator with partial dispensing
2. Build medicine inventory management forms for pharmacists
3. Implement culturally-tailored medical advice system
4. Add QR code generation for patient IDs and prescriptions
5. Integrate SMS functionality via Twilio for prescription sharing
6. Add OCR for medicine boxes and prescriptions using expo-image-manipulator
7. Implement push notifications for prescription alerts
8. Build analytics dashboard for doctors
9. Test all workflows on physical Android device via Expo Go
10. Optional: Expand medicine database with additional trade name mappings if needed

## User Preferences
- Material Design 3 aesthetic for Android
- Medical-themed color palette (blue primary)
- Offline-first approach with local storage
- Multi-role support with proper access control
