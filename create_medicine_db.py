import pandas as pd
import re
import json

# Read the Excel file
df = pd.read_excel('attached_assets/tarshouby_1764018668533.xlsx', sheet_name=0)

def parse_medicine_name(title):
    """Extract medicine name and details"""
    if pd.isna(title):
        return None, None, None, None
    
    # Extract dosage (e.g., "10 mg", "500 ml", "1%")
    dosage_match = re.search(r'(\d+(?:\.\d+)?)\s*(mg|mcg|ml|g|%|IU|units?)\b', title, re.IGNORECASE)
    dosage = dosage_match.group(0) if dosage_match else ""
    
    # Extract form (tablet, capsule, etc.)
    form_patterns = r'\b(tablet|capsule|syrup|injection|cream|ointment|drops?|solution|suspension|powder|ampoule|film|gel|lotion|spray|inhaler|patch)\b'
    form_match = re.search(form_patterns, title, re.IGNORECASE)
    form = form_match.group(0).capitalize() if form_match else ""
    
    # Extract base name (remove dosage, numbers, and form)
    base_name = title
    base_name = re.sub(r'\d+(\.\d+)?\s*(mg|mcg|ml|g|%|IU|units?)\b', '', base_name, flags=re.IGNORECASE)
    base_name = re.sub(form_patterns, '', base_name, flags=re.IGNORECASE)
    base_name = re.sub(r'\d+', '', base_name)
    base_name = re.sub(r'\s+', ' ', base_name).strip()
    
    # Clean up extra words
    base_name = re.sub(r'\b(single dose units?|film coated|coated|for injection|topical|rectal|eye|ear)\b', '', base_name, flags=re.IGNORECASE)
    base_name = re.sub(r'\s+', ' ', base_name).strip()
    
    return base_name, dosage, form, title

# Process all medicines
medicines = []
seen_names = set()

for idx, row in df.iterrows():
    title = row['Title']
    base_name, dosage, form, full_name = parse_medicine_name(title)
    
    if base_name and base_name not in seen_names:
        seen_names.add(base_name)
        medicines.append({
            'id': f'MED{idx+1:05d}',
            'name': base_name,
            'genericName': base_name,  # In this database, many ARE generic names
            'tradeName': base_name,
            'strength': dosage if dosage else 'Various',
            'dosageForm': form if form else 'Various',
            'fullProductName': full_name,
            'manufacturer': 'Various'
        })

# Sort by name
medicines.sort(key=lambda x: x['name'])

print(f"Total medicines extracted: {len(medicines)}")
print(f"\nFirst 20 medicines:")
for med in medicines[:20]:
    print(f"  {med['name']:40} | {med['strength']:15} | {med['dosageForm']:15}")

# Save to TypeScript file
ts_content = f'''// Auto-generated medicine database from tarshouby.xlsx
// Total medicines: {len(medicines)}
// Generated on: {pd.Timestamp.now().strftime('%Y-%m-%d %H:%M:%S')}

export interface Medicine {{
  id: string;
  name: string;
  genericName: string;
  tradeName: string;
  strength: string;
  dosageForm: string;
  fullProductName: string;
  manufacturer: string;
}}

export const MEDICINES_DATABASE: Medicine[] = {json.dumps(medicines, indent=2, ensure_ascii=False)};

// Quick lookup by name (case-insensitive)
export function findMedicineByName(searchName: string): Medicine[] {{
  const search = searchName.toLowerCase().trim();
  return MEDICINES_DATABASE.filter(med => 
    med.name.toLowerCase().includes(search) ||
    med.genericName.toLowerCase().includes(search) ||
    med.tradeName.toLowerCase().includes(search) ||
    med.fullProductName.toLowerCase().includes(search)
  );
}}

// Get all unique medicine names
export function getAllMedicineNames(): string[] {{
  return MEDICINES_DATABASE.map(med => med.name);
}}
'''

with open('constants/medicinesDatabase.ts', 'w', encoding='utf-8') as f:
    f.write(ts_content)

print(f"\n✅ Medicine database saved to: constants/medicinesDatabase.ts")
print(f"✅ Total medicines: {len(medicines)}")

# Also create a simplified CSV for reference
df_export = pd.DataFrame(medicines)
df_export.to_csv('assets/medicines_full_database.csv', index=False, encoding='utf-8')
print(f"✅ CSV backup saved to: assets/medicines_full_database.csv")

