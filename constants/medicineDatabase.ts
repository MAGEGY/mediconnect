export interface MedicineMapping {
  tradeName: string;
  genericName: string;
  category: string;
}

export const MEDICINE_TRADE_NAMES: MedicineMapping[] = [
  {
    tradeName: "Tylenol",
    genericName: "Acetaminophen",
    category: "Pain Relief",
  },
  { tradeName: "Advil", genericName: "Ibuprofen", category: "Pain Relief" },
  { tradeName: "Motrin", genericName: "Ibuprofen", category: "Pain Relief" },
  { tradeName: "Aleve", genericName: "Naproxen", category: "Pain Relief" },
  {
    tradeName: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    category: "Pain Relief",
  },
  { tradeName: "Coumadin", genericName: "Warfarin", category: "Anticoagulant" },
  { tradeName: "Jantoven", genericName: "Warfarin", category: "Anticoagulant" },
  { tradeName: "Plavix", genericName: "Clopidogrel", category: "Antiplatelet" },
  { tradeName: "Lipitor", genericName: "Atorvastatin", category: "Statin" },
  { tradeName: "Crestor", genericName: "Rosuvastatin", category: "Statin" },
  { tradeName: "Zocor", genericName: "Simvastatin", category: "Statin" },
  { tradeName: "Glucophage", genericName: "Metformin", category: "Diabetes" },
  { tradeName: "Amaryl", genericName: "Glimepiride", category: "Diabetes" },
  {
    tradeName: "Lantus",
    genericName: "Insulin Glargine",
    category: "Diabetes",
  },
  {
    tradeName: "Norvasc",
    genericName: "Amlodipine",
    category: "Blood Pressure",
  },
  {
    tradeName: "Vasotec",
    genericName: "Enalapril",
    category: "Blood Pressure",
  },
  { tradeName: "Lasix", genericName: "Furosemide", category: "Diuretic" },
  {
    tradeName: "Zithromax",
    genericName: "Azithromycin",
    category: "Antibiotic",
  },
  { tradeName: "Amoxil", genericName: "Amoxicillin", category: "Antibiotic" },
  {
    tradeName: "Augmentin",
    genericName: "Amoxicillin-Clavulanate",
    category: "Antibiotic",
  },
  { tradeName: "Cipro", genericName: "Ciprofloxacin", category: "Antibiotic" },
  {
    tradeName: "Levaquin",
    genericName: "Levofloxacin",
    category: "Antibiotic",
  },
  { tradeName: "Keflex", genericName: "Cephalexin", category: "Antibiotic" },
  {
    tradeName: "Zoloft",
    genericName: "Sertraline",
    category: "Antidepressant",
  },
  {
    tradeName: "Prozac",
    genericName: "Fluoxetine",
    category: "Antidepressant",
  },
  {
    tradeName: "Lexapro",
    genericName: "Escitalopram",
    category: "Antidepressant",
  },
  { tradeName: "Xanax", genericName: "Alprazolam", category: "Anxiolytic" },
  { tradeName: "Ativan", genericName: "Lorazepam", category: "Anxiolytic" },
  { tradeName: "Valium", genericName: "Diazepam", category: "Anxiolytic" },
  { tradeName: "Nexium", genericName: "Esomeprazole", category: "PPI" },
  { tradeName: "Prilosec", genericName: "Omeprazole", category: "PPI" },
  { tradeName: "Prevacid", genericName: "Lansoprazole", category: "PPI" },
  {
    tradeName: "Ventolin",
    genericName: "Albuterol",
    category: "Bronchodilator",
  },
  {
    tradeName: "Proventil",
    genericName: "Albuterol",
    category: "Bronchodilator",
  },
  { tradeName: "Singulair", genericName: "Montelukast", category: "Asthma" },
  { tradeName: "Synthroid", genericName: "Levothyroxine", category: "Thyroid" },
  { tradeName: "Levoxyl", genericName: "Levothyroxine", category: "Thyroid" },
  {
    tradeName: "Claritin",
    genericName: "Loratadine",
    category: "Antihistamine",
  },
  { tradeName: "Zyrtec", genericName: "Cetirizine", category: "Antihistamine" },
  {
    tradeName: "Allegra",
    genericName: "Fexofenadine",
    category: "Antihistamine",
  },
  {
    tradeName: "Benadryl",
    genericName: "Diphenhydramine",
    category: "Antihistamine",
  },
  { tradeName: "Viagra", genericName: "Sildenafil", category: "ED Treatment" },
  { tradeName: "Cialis", genericName: "Tadalafil", category: "ED Treatment" },
  { tradeName: "Ambien", genericName: "Zolpidem", category: "Sleep Aid" },
  {
    tradeName: "Lyrica",
    genericName: "Pregabalin",
    category: "Neuropathic Pain",
  },
  {
    tradeName: "Neurontin",
    genericName: "Gabapentin",
    category: "Neuropathic Pain",
  },
  { tradeName: "Eliquis", genericName: "Apixaban", category: "Anticoagulant" },
  {
    tradeName: "Xarelto",
    genericName: "Rivaroxaban",
    category: "Anticoagulant",
  },
  {
    tradeName: "Metoprolol",
    genericName: "Metoprolol",
    category: "Beta Blocker",
  },
  { tradeName: "Toprol", genericName: "Metoprolol", category: "Beta Blocker" },
  {
    tradeName: "Lopressor",
    genericName: "Metoprolol",
    category: "Beta Blocker",
  },
  { tradeName: "Coreg", genericName: "Carvedilol", category: "Beta Blocker" },
  { tradeName: "Diovan", genericName: "Valsartan", category: "ARB" },
  { tradeName: "Cozaar", genericName: "Losartan", category: "ARB" },
  {
    tradeName: "Lisinopril",
    genericName: "Lisinopril",
    category: "ACE Inhibitor",
  },
  {
    tradeName: "Prinivil",
    genericName: "Lisinopril",
    category: "ACE Inhibitor",
  },
  {
    tradeName: "Zestril",
    genericName: "Lisinopril",
    category: "ACE Inhibitor",
  },
];
