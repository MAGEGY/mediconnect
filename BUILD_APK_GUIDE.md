# How to Build APK for MedRecord App

This guide explains how to build an Android APK for the MedRecord application.

## Important Note
This Expo app is currently configured to run with **Expo Go** (the Expo development app). To build a standalone APK that can be installed on any Android device, you need to use **EAS Build** (Expo Application Services).

## Option 1: EAS Build (Recommended)

### Prerequisites
1. Install EAS CLI globally:
   ```bash
   npm install -g eas-cli
   ```

2. Create a free Expo account at https://expo.dev/signup

3. Login to your Expo account:
   ```bash
   eas login
   ```

### Build Steps

1. **Configure the project for EAS Build:**
   ```bash
   eas build:configure
   ```
   This creates an `eas.json` file with build configurations.

2. **Build an APK for Android:**
   ```bash
   eas build -p android --profile preview
   ```
   
   Or for a production build:
   ```bash
   eas build -p android --profile production
   ```

3. **Wait for the build:**
   - The build happens on Expo's cloud servers
   - You'll get a link to track the build progress
   - Build typically takes 10-20 minutes
   - Once complete, you'll get a download link for the APK

4. **Download and install:**
   - Download the APK from the provided link
   - Transfer it to your Android device
   - Enable "Install from unknown sources" in Android settings
   - Install the APK

### Build Profiles Explained

- **development**: Includes debugging tools, larger file size
- **preview**: For testing, includes dev tools but is closer to production
- **production**: Optimized for release, no dev tools, smallest size

## Option 2: Local Build (Advanced)

If you want to build locally without using Expo's servers:

### Prerequisites
- Android SDK and Android Studio installed
- Java Development Kit (JDK) 11 or newer

### Steps
```bash
# Build locally
eas build --platform android --local
```

This builds on your machine but requires significant setup and disk space (~10GB).

## Option 3: Development Build (For Testing)

If you just need to test on a device without Expo Go:

```bash
# Create a development build
eas build --profile development --platform android
```

This creates an APK that includes your code but still allows hot reloading and development features.

## Common Issues & Solutions

### 1. Bundle Identifier Already Used
If you get an error about the bundle identifier:
- Go to `app.json`
- Change `expo.android.package` to a unique value
- Example: `com.yourname.medrecord`

### 2. Build Takes Too Long
- EAS Build free tier has limited concurrent builds
- Consider upgrading to a paid plan for faster builds
- Or use local builds if you have the setup

### 3. APK Size Too Large
- Use the `production` profile which optimizes the build
- Remove unused assets and dependencies
- Enable Hermes engine (already configured)

## Testing Your Build

1. **Before building**, test thoroughly with Expo Go
2. **After building**, test the APK on multiple devices
3. **Check all features**:
   - Login with all three roles (Doctor, Patient, Pharmacist)
   - Patient registration
   - Prescription management
   - Drug interaction checking
   - Biometric authentication

## Current App Configuration

From `app.json`:
- **App Name**: MedRecord
- **Bundle ID (Android)**: `com.anonymous.medrecord`
- **Version**: 1.0.0
- **Minimum SDK**: 21 (Android 5.0)
- **Target SDK**: 34 (Android 14)
- **Permissions**: Camera, Biometric, SMS (for future features)

## Next Steps After Building

1. Test the APK thoroughly
2. Fix any issues and rebuild
3. When ready for production:
   - Update version in `app.json`
   - Use production build profile
   - Consider publishing to Google Play Store

## Publishing to Google Play Store

Once you have a production APK:
1. Create a Google Play Developer account ($25 one-time fee)
2. Build with `--profile production`
3. Generate an AAB (Android App Bundle) instead of APK:
   ```bash
   eas build -p android --profile production
   ```
4. Upload to Google Play Console
5. Complete store listing and submit for review

## Support

- EAS Build documentation: https://docs.expo.dev/build/introduction/
- Expo forums: https://forums.expo.dev/
- Replit support for deployment questions

---

**Quick Start Command:**
```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build preview APK
eas build -p android --profile preview
```
