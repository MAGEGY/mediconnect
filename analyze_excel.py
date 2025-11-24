import pandas as pd
import re

# Read the Excel file
df = pd.read_excel('attached_assets/tarshouby_1764018668533.xlsx', sheet_name=0)

print("=" * 80)
print("SAMPLE DATA - First 20 rows:")
print("=" * 80)
pd.set_option('display.max_columns', None)
pd.set_option('display.width', None)
pd.set_option('display.max_colwidth', 100)
print(df.head(20).to_string())

print("\n" + "=" * 80)
print("UNIQUE VALUES IN KEY COLUMNS:")
print("=" * 80)
print(f"\nTotal medicines: {len(df)}")
print(f"\nUnique Titles: {df['Title'].nunique()}")
print(f"\nSample Titles:")
for title in df['Title'].head(30):
    print(f"  - {title}")

print("\n" + "=" * 80)
print("CHECKING FOR GENERIC NAME PATTERNS:")
print("=" * 80)

# Try to extract generic names from medicine titles
# Common patterns: "Paracetamol 500mg", "Ibuprofen Tablets", etc.
def extract_generic_name(title):
    if pd.isna(title):
        return None
    # Remove dosage information
    title = re.sub(r'\d+(\.\d+)?\s*(mg|mcg|ml|g|%|IU|units?)\b', '', title, flags=re.IGNORECASE)
    # Remove common forms
    title = re.sub(r'\b(tablet|capsule|syrup|injection|cream|ointment|drops|solution|suspension|powder)\b', '', title, flags=re.IGNORECASE)
    # Remove numbers
    title = re.sub(r'\d+', '', title)
    # Clean up
    title = re.sub(r'\s+', ' ', title).strip()
    return title

df['extracted_generic'] = df['Title'].apply(extract_generic_name)

print("\nSample extracted generic names:")
for i, row in df.head(30).iterrows():
    print(f"{row['Title']:60} => {row['extracted_generic']}")

