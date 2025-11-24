import pandas as pd
import json

# Read the Excel file
excel_file = 'attached_assets/tarshouby_1764018668533.xlsx'
print(f"Reading Excel file: {excel_file}")

# Try to read the first sheet
try:
    df = pd.read_excel(excel_file, sheet_name=0)
    print(f"\nShape: {df.shape[0]} rows, {df.shape[1]} columns")
    print(f"\nColumn names:")
    print(df.columns.tolist())
    print(f"\nFirst 5 rows:")
    print(df.head())
    print(f"\nData types:")
    print(df.dtypes)
except Exception as e:
    print(f"Error reading Excel: {e}")
