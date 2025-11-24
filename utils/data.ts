import { Medicine, Prescription, VitalSign, PatientAllergy, LifestyleData, DispensingRecord, User } from '@/types';
import { storage } from './storage';
import * as Crypto from 'expo-crypto';

interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

async function generateSalt(): Promise<string> {
  const randomBytes = await Crypto.getRandomBytesAsync(16);
  return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string): Promise<string> {
  const combined = password + salt;
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    combined
  );
}

export const userService = {
  async getAll(): Promise<User[]> {
    const stored = await storage.getData<StoredUser[]>(storage.KEYS.USERS);
    if (!stored) return [];
    return stored.map(({ passwordHash, salt, ...user }) => user);
  },

  async findByUsername(username: string): Promise<StoredUser | null> {
    const users = await storage.getData<StoredUser[]>(storage.KEYS.USERS) || [];
    return users.find(u => 
      u.username === username || 
      u.phoneNumber === username || 
      u.nationalId === username
    ) || null;
  },

  async create(userData: Omit<User, 'id' | 'createdAt' | 'approvalStatus'>, password: string): Promise<User> {
    const users = await storage.getData<StoredUser[]>(storage.KEYS.USERS) || [];
    
    const existing = users.find(u => 
      u.username === userData.username || 
      u.phoneNumber === userData.phoneNumber || 
      u.nationalId === userData.nationalId
    );
    
    if (existing) {
      throw new Error('User already exists');
    }

    const salt = await generateSalt();
    const passwordHash = await hashPassword(password, salt);
    const newUser: StoredUser = {
      ...userData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      approvalStatus: 'pending',
      passwordHash,
      salt,
    };

    await storage.setData(storage.KEYS.USERS, [...users, newUser]);
    
    const { passwordHash: _, salt: __, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },

  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await this.findByUsername(username);
    if (!user) return null;

    const passwordHash = await hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) return null;

    const { passwordHash: _, salt: __, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },

  async updateApprovalStatus(userId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const users = await storage.getData<StoredUser[]>(storage.KEYS.USERS) || [];
    const updated = users.map(u => u.id === userId ? { ...u, approvalStatus: status } : u);
    await storage.setData(storage.KEYS.USERS, updated);
  },

  async enableBiometric(userId: string): Promise<void> {
    const users = await storage.getData<StoredUser[]>(storage.KEYS.USERS) || [];
    const updated = users.map(u => u.id === userId ? { ...u, biometricEnabled: true } : u);
    await storage.setData(storage.KEYS.USERS, updated);
  },

  async createTestUsers(): Promise<void> {
    const testUsers = [
      { username: 'doctor1', phoneNumber: '+1234567890', nationalId: 'DOC001', displayName: 'Dr. Sarah Johnson', role: 'doctor' as const, password: 'password123' },
      { username: 'patient1', phoneNumber: '+1234567891', nationalId: 'PAT001', displayName: 'John Doe', role: 'patient' as const, password: 'password123' },
      { username: 'pharmacist1', phoneNumber: '+1234567892', nationalId: 'PHA001', displayName: 'Emily Davis', role: 'pharmacist' as const, password: 'password123' },
    ];

    for (const testUser of testUsers) {
      const { password, ...userData } = testUser;
      try {
        const user = await this.create({
          ...userData,
          avatarIndex: 0,
          biometricEnabled: false,
        }, password);
        
        await this.updateApprovalStatus(user.id, 'approved');
      } catch (error) {
        console.log(`Test user ${testUser.username} already exists`);
      }
    }
  },
};

const MOCK_MEDICINES: Medicine[] = [
  { id: '1', name: 'Aspirin', genericName: 'Acetylsalicylic acid', manufacturer: 'Bayer', dosageForm: 'Tablet', strength: '100mg', stockLevel: 500, interactions: ['Warfarin', 'Ibuprofen'] },
  { id: '2', name: 'Lisinopril', genericName: 'Lisinopril', manufacturer: 'Merck', dosageForm: 'Tablet', strength: '10mg', stockLevel: 300, interactions: ['Potassium supplements'] },
  { id: '3', name: 'Metformin', genericName: 'Metformin HCl', manufacturer: 'Teva', dosageForm: 'Tablet', strength: '500mg', stockLevel: 450, interactions: ['Alcohol'] },
  { id: '4', name: 'Amoxicillin', genericName: 'Amoxicillin', manufacturer: 'GSK', dosageForm: 'Capsule', strength: '250mg', stockLevel: 200, interactions: ['Warfarin'] },
  { id: '5', name: 'Atorvastatin', genericName: 'Atorvastatin', manufacturer: 'Pfizer', dosageForm: 'Tablet', strength: '20mg', stockLevel: 350, interactions: ['Grapefruit juice'] },
  { id: '6', name: 'Omeprazole', genericName: 'Omeprazole', manufacturer: 'AstraZeneca', dosageForm: 'Capsule', strength: '20mg', stockLevel: 400 },
  { id: '7', name: 'Levothyroxine', genericName: 'Levothyroxine sodium', manufacturer: 'Abbott', dosageForm: 'Tablet', strength: '50mcg', stockLevel: 250 },
  { id: '8', name: 'Albuterol', genericName: 'Albuterol sulfate', manufacturer: 'GSK', dosageForm: 'Inhaler', strength: '90mcg', stockLevel: 100 },
];

const MOCK_PATIENTS: User[] = [
  {
    id: 'P001',
    username: 'john_doe',
    phoneNumber: '+1234567890',
    nationalId: 'ID12345',
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'John Doe',
    avatarIndex: 0,
    biometricEnabled: true,
    createdAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'P002',
    username: 'jane_smith',
    phoneNumber: '+1234567891',
    nationalId: 'ID12346',
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'Jane Smith',
    avatarIndex: 1,
    biometricEnabled: true,
    createdAt: '2024-02-20T14:30:00Z',
  },
  {
    id: 'P003',
    username: 'bob_johnson',
    phoneNumber: '+1234567892',
    nationalId: 'ID12347',
    role: 'patient',
    approvalStatus: 'approved',
    displayName: 'Bob Johnson',
    avatarIndex: 2,
    biometricEnabled: false,
    createdAt: '2024-03-10T09:15:00Z',
  },
];

export const medicineService = {
  async getAll(): Promise<Medicine[]> {
    const stored = await storage.getData<Medicine[]>(storage.KEYS.MEDICINES);
    return stored || MOCK_MEDICINES;
  },

  async search(query: string): Promise<Medicine[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(m => 
      m.name.toLowerCase().includes(lowerQuery) ||
      m.genericName.toLowerCase().includes(lowerQuery)
    );
  },

  async getById(id: string): Promise<Medicine | null> {
    const all = await this.getAll();
    return all.find(m => m.id === id) || null;
  },

  async add(medicine: Omit<Medicine, 'id'>): Promise<Medicine> {
    const all = await this.getAll();
    const newMedicine: Medicine = {
      ...medicine,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.MEDICINES, [...all, newMedicine]);
    return newMedicine;
  },

  async update(id: string, updates: Partial<Medicine>): Promise<void> {
    const all = await this.getAll();
    const updated = all.map(m => m.id === id ? { ...m, ...updates } : m);
    await storage.setData(storage.KEYS.MEDICINES, updated);
  },
};

export const patientService = {
  async getAll(): Promise<User[]> {
    const stored = await storage.getData<User[]>(storage.KEYS.PATIENTS);
    return stored || MOCK_PATIENTS;
  },

  async search(query: string): Promise<User[]> {
    const all = await this.getAll();
    const lowerQuery = query.toLowerCase();
    return all.filter(p => 
      p.displayName.toLowerCase().includes(lowerQuery) ||
      p.id.toLowerCase().includes(lowerQuery) ||
      p.phoneNumber.includes(query)
    );
  },

  async getById(id: string): Promise<User | null> {
    const all = await this.getAll();
    return all.find(p => p.id.toLowerCase() === id.toLowerCase()) || null;
  },
};

export const prescriptionService = {
  async getAll(): Promise<Prescription[]> {
    const stored = await storage.getData<Prescription[]>(storage.KEYS.PRESCRIPTIONS);
    return stored || [];
  },

  async getByPatientId(patientId: string): Promise<Prescription[]> {
    const all = await this.getAll();
    return all.filter(p => p.patientId === patientId);
  },

  async create(prescription: Omit<Prescription, 'id' | 'createdAt' | 'qrCode' | 'webLink'>): Promise<Prescription> {
    const all = await this.getAll();
    const id = 'RX' + Date.now();
    const newPrescription: Prescription = {
      ...prescription,
      id,
      createdAt: new Date().toISOString(),
      qrCode: `medrecord://prescription/${id}`,
      webLink: `https://medrecord.app/rx/${id}`,
    };
    await storage.setData(storage.KEYS.PRESCRIPTIONS, [...all, newPrescription]);
    return newPrescription;
  },

  async getById(id: string): Promise<Prescription | null> {
    const all = await this.getAll();
    return all.find(p => p.id === id) || null;
  },

  async dispense(id: string, dispensedBy: string, partial: boolean): Promise<void> {
    const all = await this.getAll();
    const updated = all.map(p => 
      p.id === id 
        ? { 
            ...p, 
            dispensedAt: new Date().toISOString(), 
            dispensedBy,
            partiallyDispensed: partial 
          } 
        : p
    );
    await storage.setData(storage.KEYS.PRESCRIPTIONS, updated);
  },
};

export const vitalSignsService = {
  async getByPatientId(patientId: string): Promise<VitalSign[]> {
    const stored = await storage.getData<VitalSign[]>(storage.KEYS.VITAL_SIGNS);
    return (stored || []).filter(v => v.patientId === patientId);
  },

  async add(vitalSign: Omit<VitalSign, 'id'>): Promise<VitalSign> {
    const stored = await storage.getData<VitalSign[]>(storage.KEYS.VITAL_SIGNS) || [];
    const newVital: VitalSign = {
      ...vitalSign,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.VITAL_SIGNS, [...stored, newVital]);
    return newVital;
  },
};

export const lifestyleService = {
  async getByPatientId(patientId: string): Promise<LifestyleData[]> {
    const stored = await storage.getData<LifestyleData[]>(storage.KEYS.LIFESTYLE_DATA);
    return (stored || []).filter(l => l.patientId === patientId);
  },

  async add(data: Omit<LifestyleData, 'id'>): Promise<LifestyleData> {
    const stored = await storage.getData<LifestyleData[]>(storage.KEYS.LIFESTYLE_DATA) || [];
    const newData: LifestyleData = {
      ...data,
      id: Date.now().toString(),
    };
    await storage.setData(storage.KEYS.LIFESTYLE_DATA, [...stored, newData]);
    return newData;
  },
};

export const dispensingService = {
  async getAll(): Promise<DispensingRecord[]> {
    const stored = await storage.getData<DispensingRecord[]>(storage.KEYS.DISPENSING_HISTORY);
    return stored || [];
  },

  async record(record: Omit<DispensingRecord, 'id' | 'dispensedAt'>): Promise<DispensingRecord> {
    const stored = await this.getAll();
    const newRecord: DispensingRecord = {
      ...record,
      id: Date.now().toString(),
      dispensedAt: new Date().toISOString(),
    };
    await storage.setData(storage.KEYS.DISPENSING_HISTORY, [...stored, newRecord]);
    return newRecord;
  },
};

export const allergyService = {
  async getByPatientId(patientId: string): Promise<PatientAllergy[]> {
    const stored = await storage.getData<PatientAllergy[]>(storage.KEYS.ALLERGIES);
    return (stored || []).filter(a => a.patientId === patientId);
  },

  async add(allergy: Omit<PatientAllergy, 'id' | 'recordedAt'>): Promise<PatientAllergy> {
    const stored = await storage.getData<PatientAllergy[]>(storage.KEYS.ALLERGIES) || [];
    const newAllergy: PatientAllergy = {
      ...allergy,
      id: Date.now().toString(),
      recordedAt: new Date().toISOString(),
    };
    await storage.setData(storage.KEYS.ALLERGIES, [...stored, newAllergy]);
    return newAllergy;
  },

  async remove(id: string): Promise<void> {
    const stored = await storage.getData<PatientAllergy[]>(storage.KEYS.ALLERGIES) || [];
    const updated = stored.filter(a => a.id !== id);
    await storage.setData(storage.KEYS.ALLERGIES, updated);
  },
};

export const MEDICAL_ADVICE = [
  {
    title: 'Stay Hydrated',
    description: 'Drink at least 8 glasses of water daily to maintain proper hydration and support bodily functions.',
    icon: 'water',
  },
  {
    title: 'Regular Exercise',
    description: 'Aim for 30 minutes of moderate exercise most days of the week to maintain cardiovascular health.',
    icon: 'run',
  },
  {
    title: 'Healthy Diet',
    description: 'Eat a balanced diet rich in fruits, vegetables, whole grains, and lean proteins.',
    icon: 'food-apple',
  },
  {
    title: 'Adequate Sleep',
    description: 'Get 7-9 hours of quality sleep each night to support immune function and mental health.',
    icon: 'sleep',
  },
  {
    title: 'Stress Management',
    description: 'Practice relaxation techniques like meditation, deep breathing, or yoga to reduce stress.',
    icon: 'meditation',
  },
  {
    title: 'Regular Check-ups',
    description: 'Schedule annual health screenings and follow up with your healthcare provider regularly.',
    icon: 'clipboard-pulse',
  },
];

export async function createTestDataIfEmpty() {
  const existingPatients = await storage.getData<User[]>(storage.KEYS.PATIENTS);
  if (!existingPatients || existingPatients.length === 0) {
    await storage.setData(storage.KEYS.PATIENTS, MOCK_PATIENTS);
  }

  const existingPrescriptions = await storage.getData<Prescription[]>(storage.KEYS.PRESCRIPTIONS);
  if (!existingPrescriptions || existingPrescriptions.length === 0) {
    const testPrescriptions: Prescription[] = [
      {
        id: 'RX001',
        patientId: 'P001',
        doctorId: '1',
        medicineName: 'Amoxicillin',
        dosage: '500mg',
        frequency: 'Three times daily',
        duration: '7 days',
        notes: 'Take with food',
        prescribedAt: '2024-03-15T10:00:00Z',
        createdAt: '2024-03-15T10:00:00Z',
        qrCode: 'medrecord://prescription/RX001',
        webLink: 'https://medrecord.app/rx/RX001',
        status: 'active',
      },
      {
        id: 'RX002',
        patientId: 'P001',
        doctorId: '1',
        medicineName: 'Lisinopril',
        dosage: '10mg',
        frequency: 'Once daily',
        duration: '30 days',
        notes: 'For blood pressure management',
        prescribedAt: '2024-03-10T14:30:00Z',
        createdAt: '2024-03-10T14:30:00Z',
        qrCode: 'medrecord://prescription/RX002',
        webLink: 'https://medrecord.app/rx/RX002',
        status: 'dispensed',
        dispensedAt: '2024-03-11T09:00:00Z',
        dispensedBy: '3',
      },
    ];
    await storage.setData(storage.KEYS.PRESCRIPTIONS, testPrescriptions);
  }

  const existingVitals = await storage.getData<VitalSign[]>(storage.KEYS.VITAL_SIGNS);
  if (!existingVitals || existingVitals.length === 0) {
    const testVitals: VitalSign[] = [
      {
        id: 'V001',
        patientId: 'P001',
        bloodPressure: '120/80',
        heartRate: 72,
        temperature: 36.8,
        weight: 75.5,
        height: 175,
        recordedAt: '2024-03-15T10:00:00Z',
        recordedBy: '1',
      },
      {
        id: 'V002',
        patientId: 'P001',
        bloodPressure: '118/78',
        heartRate: 70,
        temperature: 36.7,
        weight: 75.2,
        height: 175,
        recordedAt: '2024-03-10T14:30:00Z',
        recordedBy: '1',
      },
    ];
    await storage.setData(storage.KEYS.VITAL_SIGNS, testVitals);
  }

  const existingAllergies = await storage.getData<PatientAllergy[]>(storage.KEYS.ALLERGIES);
  if (!existingAllergies || existingAllergies.length === 0) {
    const testAllergies: PatientAllergy[] = [
      {
        id: 'A001',
        patientId: 'P001',
        allergen: 'Penicillin',
        severity: 'high',
        reaction: 'Skin rash and difficulty breathing',
        recordedAt: '2024-01-05T00:00:00Z',
      },
      {
        id: 'A002',
        patientId: 'P002',
        allergen: 'Peanuts',
        severity: 'medium',
        reaction: 'Hives',
        recordedAt: '2024-02-10T00:00:00Z',
      },
    ];
    await storage.setData(storage.KEYS.ALLERGIES, testAllergies);
  }
}
