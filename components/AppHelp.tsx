import { useAuth } from "@/contexts/AuthContext";
import { navigationRef } from "@/navigation/navigationRef";
import FloatingHelp from "@/components/FloatingHelp";
import type { HelpFunction, HelpHowTo } from "@/components/FloatingHelp";

const BASE_HOWTOS: HelpHowTo[] = [
  { title: "Try the demo accounts", body: "The app seeds three ready-to-use accounts: doctor1 / Doctor123!, patient1 / Patient123!, pharmacist1 / Pharma123!. Log in with any of them to explore each role." },
  { title: "About registering", body: "Registration creates a pending account that needs an admin approval — in this demo version only the seeded accounts above can sign in." },
  { title: "Scan a medicine package", body: "Use the Scan screen to photograph a medicine package — the app reads the package text with OCR and identifies the medicine for you." },
  { title: "Prescriptions", body: "Doctors create prescriptions for their patients; patients open and read them; pharmacists dispense against them and track inventory." },
  { title: "Language", body: "The app supports English and Arabic — switch it from the profile/settings screen." },
  { title: "Where is my data?", body: "Everything is stored locally in your browser (or on the device in the Android app). Nothing is uploaded to a server in this version." },
];

export default function AppHelp() {
  const { user } = useAuth();

  const functions: HelpFunction[] = [];

  if (!user) {
    functions.push(
      { label: "Sign in", description: "Log in with your approved account", action: () => navigationRef.navigate("Login") },
      { label: "Register", description: "Create a new doctor, patient or pharmacist account", action: () => navigationRef.navigate("Register") },
    );
  } else {
    switch (user.role) {
      case "doctor":
      case "lab":
      case "physiotherapy":
      case "radiologist":
        functions.push(
          { label: "My patients", description: "Patient list, details and history", action: () => navigationRef.navigate("DoctorMain", { screen: "Patients" }) },
          { label: "Scan medicine", description: "OCR-scan a medicine package", action: () => navigationRef.navigate("DoctorMain", { screen: "Scan" }) },
          { label: "Prescriptions", description: "Create and manage prescriptions", action: () => navigationRef.navigate("DoctorMain", { screen: "Prescriptions" }) },
          { label: "Medicine database", description: "Browse the medicine catalog", action: () => navigationRef.navigate("DoctorMain", { screen: "Database" }) },
        );
        break;
      case "patient":
        functions.push(
          { label: "Home", description: "Your overview and quick actions", action: () => navigationRef.navigate("PatientMain", { screen: "Home" }) },
          { label: "My medications", description: "Medication list and schedules", action: () => navigationRef.navigate("PatientMain", { screen: "Medications" }) },
          { label: "Lifestyle", description: "Lifestyle tracking", action: () => navigationRef.navigate("PatientMain", { screen: "Lifestyle" }) },
          { label: "Profile", description: "Account and settings", action: () => navigationRef.navigate("PatientMain", { screen: "Profile" }) },
        );
        break;
      case "pharmacist":
        functions.push(
          { label: "Dispense", description: "Dispense prescriptions by QR or code", action: () => navigationRef.navigate("PharmacistMain", { screen: "Dispense" }) },
          { label: "Inventory", description: "Stock levels and management", action: () => navigationRef.navigate("PharmacistMain", { screen: "Inventory" }) },
          { label: "History", description: "Dispensing history", action: () => navigationRef.navigate("PharmacistMain", { screen: "History" }) },
          { label: "Profile", description: "Account and settings", action: () => navigationRef.navigate("PharmacistMain", { screen: "Profile" }) },
        );
        break;
      default:
        break;
    }
  }

  return <FloatingHelp color="#0077B6" functions={functions} howtos={BASE_HOWTOS} />;
}
