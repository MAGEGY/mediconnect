# Medical Records & Prescription Management App - Design Guidelines

## Platform & Design Language
This is an **Android application** adhering to **Material Design 3** guidelines with a modern, medical-themed aesthetic featuring stylish colors and contemporary UI patterns.

## Authentication Architecture

### Required Authentication
This app requires robust multi-factor authentication due to:
- Sensitive medical data (HIPAA compliance considerations)
- Multiple user roles (patient, doctor, pharmacist, lab, physiotherapy, radiologist)
- Cross-role data sharing (prescriptions, patient records)
- Admin authorization workflow for new accounts

### Authentication Implementation
**Login Methods** (all collected at first login):
- Username
- Phone number (required for SMS prescription delivery)
- National ID
- Biometric authentication (fingerprint/face)
- User role selection (patient, doctor, pharmacist, other medical team)

**Flow**:
1. **First-time users**: Complete registration → Submit for admin authorization → "Pending Approval" state
2. **Approved users**: Biometric quick login with phone/username fallback
3. **Account Screen** includes:
   - Profile photo (generate 3 medical-themed avatars: stethoscope badge, medical cross, heartbeat icon)
   - Display name, role badge, national ID (masked), phone number
   - App preferences (theme, notifications, language/culture settings)
   - Privacy policy & terms (placeholder URLs)
   - Nested Settings > Account > Delete Account (double confirmation)
   - Log out (confirmation alert)

## Navigation Architecture

### Role-Based Tab Navigation
Each role has a custom tab bar with 4-5 tabs. Use a **floating action button (FAB)** for primary actions on 4-tab layouts, center position for 5-tab layouts.

**Doctor Interface (5 tabs)**:
1. **Patients** - Patient list/search
2. **Scan** (center) - QR/web link scanner for patient ID
3. **Prescriptions** - Active prescriptions
4. **Database** - Medicine database search
5. **Profile** - Account & settings

**Patient Interface (4 tabs + FAB)**:
1. **Home** - Dashboard with health summary
2. **Medications** - Medicine history & management
3. **Lifestyle** - BP, steps, calories tracking
4. **Profile** - Account & settings
- **FAB**: Add new medication (OCR or search)

**Pharmacist Interface (4 tabs + FAB)**:
1. **Dispense** - Scan/enter prescription
2. **Inventory** - Medicine stock management
3. **History** - Dispensing records
4. **Profile** - Account & settings
- **FAB**: Add medicine to database

## Screen Specifications

### Doctor Screens

#### 1. Patient List Screen
- **Purpose**: Browse/search patients, view recent interactions
- **Layout**:
  - Header: Transparent with search bar, filter icon (right)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Main: Scrollable list of patient cards
- **Components**: Search bar, patient cards (photo, name, ID, last visit date), empty state for no patients

#### 2. Patient Detail Screen (Modal Stack)
- **Purpose**: View patient history, vitals, prescriptions, allergies
- **Layout**:
  - Header: Default navigation (back button left, "Send Prescription" right)
  - Top inset: Spacing.xl
  - Bottom inset: insets.bottom + Spacing.xl
  - Main: Scrollable tabs (Overview, Vitals, Prescriptions, Notes)
- **Components**: Tab navigation, vital signs cards, prescription history list, allergy badges, interaction warnings

#### 3. Create Prescription Screen (Modal)
- **Purpose**: Write new prescription, check interactions
- **Layout**:
  - Header: Default navigation ("Cancel" left, "Send" right - disabled until valid)
  - Form sections: Patient info, Medicine search, Dosage, Duration, Notes
  - Submit/Cancel in header
  - Top inset: Spacing.xl
  - Bottom inset: keyboard-aware
- **Components**: Medicine autocomplete, dosage input, interaction alert cards, QR code preview, "Send via SMS" toggle

### Patient Screens

#### 4. Home Dashboard Screen
- **Purpose**: Health summary, upcoming medications, advice
- **Layout**:
  - Header: Transparent, greeting text ("Good morning, [Name]"), notification icon (right)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Main: Scrollable content (health widgets, advice cards)
- **Components**: Health metric cards, medication reminders, culturally-tailored advice cards, floating action button for adding meds

#### 5. Medications Screen
- **Purpose**: View/manage medication history, add new
- **Layout**:
  - Header: Transparent with search bar, filter icon (right)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Main: Grouped list (Current, Past, Allergies)
- **Components**: Medication cards with dosage/frequency, allergy warnings, OCR scan modal, database search

#### 6. Lifestyle Tracking Screen
- **Purpose**: Log BP, steps, calories, view trends
- **Layout**:
  - Header: Transparent, date selector (center), export icon (right)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Main: Scrollable with quick-add buttons at top, chart/graph section, history list
- **Components**: Line charts, quick-add vital buttons, data entry modals, trend indicators

### Pharmacist Screens

#### 7. Dispense Screen
- **Purpose**: Scan prescription, dispense medications
- **Layout**:
  - Header: Transparent, "Manual Entry" button (right)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Main: QR scanner view with "Enter Patient ID" button overlay
- **Components**: QR camera view, manual ID input modal, prescription review sheet (bottom sheet), partial dispensing controls

#### 8. Inventory Management Screen
- **Purpose**: Browse/search medicine database, update stock
- **Layout**:
  - Header: Transparent with search bar, filter icon (right)
  - Top inset: headerHeight + Spacing.xl
  - Bottom inset: tabBarHeight + Spacing.xl
  - Main: Scrollable list of medicine items
- **Components**: Medicine cards (name, stock level, expiry), low stock badges, floating action button for adding medicine

## Design System

### Color Palette (Medical Theme)
- **Primary**: #0077B6 (Medical blue - trust, professionalism)
- **Primary Variant**: #005A8C
- **Secondary**: #00B4D8 (Lighter blue - vitality)
- **Accent**: #48CAE4 (Bright cyan - actions, highlights)
- **Error**: #D32F2F (Allergies, interactions, critical warnings)
- **Warning**: #F57C00 (Moderate warnings)
- **Success**: #388E3C (Successful actions, healthy metrics)
- **Background**: #F5F5F5 (Light gray)
- **Surface**: #FFFFFF
- **Text Primary**: #212121
- **Text Secondary**: #757575
- **Divider**: #E0E0E0

### Typography
- **Headings**: Roboto Medium (16sp - 24sp)
- **Body**: Roboto Regular (14sp - 16sp)
- **Captions**: Roboto Regular (12sp)
- **Buttons**: Roboto Medium (14sp, uppercase)

### Touch Feedback
- All touchable elements use Material ripple effect
- Floating action buttons have subtle elevation shadow:
  - elevation: 4
  - shadowColor: #000000
  - shadowOffset: {width: 0, height: 2}
  - shadowOpacity: 0.10
  - shadowRadius: 2

### Icons
- Use Material Icons from @expo/vector-icons
- Core icons:
  - Patient: account-circle
  - Doctor: stethoscope
  - Pharmacist: pharmacy
  - Prescription: file-document
  - QR Code: qrcode-scan
  - Medication: pill
  - Vitals: heart-pulse
  - Allergy: alert-circle
  - SMS: message-text

### Critical Assets
Generate the following custom assets:
1. **3 Profile Avatars** (circular, 120x120dp, medical theme):
   - Stethoscope badge (blue gradient)
   - Medical cross icon (green gradient)
   - Heartbeat line graphic (cyan gradient)
2. **Role Badges** (24x24dp):
   - Doctor (stethoscope icon)
   - Patient (person icon)
   - Pharmacist (medicine bottle icon)
   - Lab (test tube icon)
   - Physiotherapy (exercise icon)
   - Radiologist (scan icon)
3. **Empty State Illustrations** (200x200dp, flat style):
   - No patients yet
   - No medications
   - No prescriptions
   - Medicine database empty

### Safe Area Insets
- **With tab bar**: Bottom = tabBarHeight + 16dp
- **Without tab bar**: Bottom = insets.bottom + 16dp
- **With transparent header**: Top = headerHeight + 16dp
- **Without header**: Top = insets.top + 16dp
- **With opaque header**: Top = 16dp

### Accessibility
- Minimum touch target: 48x48dp
- Color contrast ratio: 4.5:1 for text
- Critical warnings (allergies, interactions) use icons + color + text
- Support for TalkBack screen reader
- Biometric authentication has fallback to phone/username