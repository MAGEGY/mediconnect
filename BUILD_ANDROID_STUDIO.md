# How to Build MedRecord App in Android Studio

This guide explains how to build your Expo app using Android Studio on your local machine.

## Prerequisites

### 1. Install Android Studio
1. Download Android Studio from: https://developer.android.com/studio
2. Install with default settings
3. Open Android Studio and complete the setup wizard
4. Install Android SDK (API 34 recommended, minimum API 21)

### 2. Install Required Tools
- **Java Development Kit (JDK)**: Install JDK 11 or newer
  - Check if installed: `java -version`
  - Download from: https://adoptium.net/
  
- **Node.js**: Already installed in Replit, but if working locally you need Node 18+

### 3. Set Environment Variables

Add these to your system PATH:
```bash
# Android SDK location (usually):
# Windows: C:\Users\YourName\AppData\Local\Android\Sdk
# macOS: ~/Library/Android/sdk
# Linux: ~/Android/Sdk

ANDROID_HOME=/path/to/android/sdk
PATH=$PATH:$ANDROID_HOME/platform-tools
PATH=$PATH:$ANDROID_HOME/tools
```

Verify with:
```bash
adb version
```

## Step 1: Generate Native Android Code

Expo apps don't include native Android code by default. You need to generate it using `expo prebuild`:

```bash
# In your project directory
npx expo prebuild --platform android
```

This creates an `android/` directory with the native Android project.

**Important**: The `android/` directory is gitignored by default. Don't commit it - regenerate it when needed.

## Step 2: Open Project in Android Studio

1. Open Android Studio
2. Click **"Open an Existing Project"**
3. Navigate to your project folder
4. Select the **`android`** folder (NOT the root folder)
5. Click **"Open"**
6. Wait for Gradle sync to complete (this may take several minutes the first time)

## Step 3: Configure the Project

### Update Gradle (if needed)
If you see Gradle version warnings:
1. Go to **File → Project Structure**
2. Update Android Gradle Plugin version if prompted
3. Click **"Apply"** and sync

### Set Build Variant
1. Click **"Build"** menu → **"Select Build Variant"**
2. Choose **"debug"** for testing or **"release"** for production

## Step 4: Build APK

### Method A: Using Android Studio UI

1. **For Debug APK** (for testing):
   - Click **"Build"** → **"Build Bundle(s) / APK(s)"** → **"Build APK(s)"**
   - Wait for build to complete
   - Click **"locate"** in the popup to find the APK
   - Location: `android/app/build/outputs/apk/debug/app-debug.apk`

2. **For Release APK** (for distribution):
   - Click **"Build"** → **"Build Bundle(s) / APK(s)"** → **"Build APK(s)"**
   - Select release variant
   - Note: Requires signing configuration (see below)

### Method B: Using Terminal/Command Line

From your project root:

```bash
# Debug build
cd android
./gradlew assembleDebug

# Release build (requires signing)
./gradlew assembleRelease

# Output location:
# Debug: android/app/build/outputs/apk/debug/app-debug.apk
# Release: android/app/build/outputs/apk/release/app-release.apk
```

## Step 5: Configure Signing (For Release Builds)

Release APKs must be signed. Here's how:

### Generate a Keystore

```bash
keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore medrecord-release.keystore \
  -alias medrecord-key \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be asked for:
- Keystore password (remember this!)
- Key password (can be same as keystore)
- Your name, organization, etc.

**IMPORTANT**: Keep this keystore file safe! You need it to update your app in the future.

### Configure Gradle for Signing

1. Move the keystore to `android/app/medrecord-release.keystore`

2. Create or edit `android/gradle.properties`:

```properties
MEDRECORD_RELEASE_STORE_FILE=medrecord-release.keystore
MEDRECORD_RELEASE_KEY_ALIAS=medrecord-key
MEDRECORD_RELEASE_STORE_PASSWORD=your_keystore_password
MEDRECORD_RELEASE_KEY_PASSWORD=your_key_password
```

3. Edit `android/app/build.gradle`, add inside `android {}` block:

```gradle
signingConfigs {
    release {
        storeFile file(MEDRECORD_RELEASE_STORE_FILE)
        storePassword MEDRECORD_RELEASE_STORE_PASSWORD
        keyAlias MEDRECORD_RELEASE_KEY_ALIAS
        keyPassword MEDRECORD_RELEASE_KEY_PASSWORD
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

Now you can build signed release APKs!

## Step 6: Run on Device/Emulator

### Option A: Run on Physical Device
1. Enable **Developer Options** on your Android phone:
   - Go to Settings → About Phone
   - Tap "Build Number" 7 times
2. Enable **USB Debugging** in Developer Options
3. Connect phone via USB
4. Click the **green play button** in Android Studio
5. Select your device

### Option B: Run on Emulator
1. Click **"Tools"** → **"Device Manager"**
2. Click **"Create Device"**
3. Select a device (e.g., Pixel 5)
4. Select a system image (API 34 recommended)
5. Click **Finish**
6. Click the **green play button** in Android Studio
7. Select the emulator

## Troubleshooting

### Problem: "SDK location not found"
**Solution**: 
1. Create `android/local.properties` file
2. Add: `sdk.dir=/path/to/your/android/sdk`

### Problem: "Gradle sync failed"
**Solution**:
1. Click **"File"** → **"Invalidate Caches / Restart"**
2. Click **"Invalidate and Restart"**
3. Wait for re-sync

### Problem: Build fails with memory error
**Solution**:
Edit `android/gradle.properties`, add:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m
```

### Problem: "Execution failed for task ':app:mergeDebugResources'"
**Solution**:
```bash
cd android
./gradlew clean
./gradlew assembleDebug
```

### Problem: App crashes immediately
**Solution**:
1. Check logcat in Android Studio (bottom panel)
2. Look for red error messages
3. Common issue: Missing permissions in AndroidManifest.xml

## Important Notes

### After Making Code Changes
If you modify your React Native code:
1. The app has **hot reload** enabled
2. Changes appear automatically while running
3. For native changes, rebuild the APK

### Updating Native Dependencies
If you install a new Expo package with native code:
```bash
npx expo prebuild --clean --platform android
```
Then reopen in Android Studio.

### Clean Build
If things seem broken:
```bash
cd android
./gradlew clean
cd ..
npx expo prebuild --clean --platform android
```

## APK Locations

After successful build, find your APK at:
- **Debug**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release**: `android/app/build/outputs/apk/release/app-release.apk`

## Installing the APK

### On Physical Device:
1. Transfer APK to phone via USB or cloud storage
2. Enable "Install from unknown sources" in Settings
3. Tap the APK file to install

### Via ADB:
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## File Sizes

Expect these approximate sizes:
- **Debug APK**: ~50-80 MB
- **Release APK**: ~25-40 MB (optimized)

## Next Steps

1. Test the debug APK thoroughly
2. Build release APK when ready for distribution
3. Consider building AAB (Android App Bundle) for Play Store:
   ```bash
   ./gradlew bundleRelease
   ```
   Output: `android/app/build/outputs/bundle/release/app-release.aab`

## Quick Reference Commands

```bash
# Generate native code
npx expo prebuild --platform android

# Debug build
cd android && ./gradlew assembleDebug

# Release build
cd android && ./gradlew assembleRelease

# Clean build
cd android && ./gradlew clean

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat
```

---

**Having Issues?** Common problems:
- Make sure ANDROID_HOME is set correctly
- Make sure JDK is installed and in PATH
- Make sure Android SDK Build-Tools are installed
- Try running `npx expo prebuild --clean` to regenerate native code
