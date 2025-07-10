import os
import pandas as pd

def load_properties(filepath):
    props = {}
    with open(filepath, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                key, value = line.split("=", 1)
                props[key.strip()] = value.strip()
    return props

# === LOAD CONFIG ===
config = load_properties("config.properties")
csv_path = config["csv_path"]
folder_path = config["folder_path"]
column_current = config["column_current"]
column_new = config["column_new"]

# === READ CSV ===
df = pd.read_csv(csv_path)

# === FIND DUPLICATES ===
#duplicate_current = df[column_current][df[column_current].duplicated(keep=False)]
#duplicate_new = df[column_new][df[column_new].duplicated(keep=False)]

# === RENAME FILES ===
invalid_chars = r'<>:"/\|?*'

for index, row in df.iterrows():
    old_name = row[column_current]
    new_name = row[column_new]

    ext = os.path.splitext(old_name)[-1]
    old_file = os.path.join(folder_path, old_name)

    # Skip if file doesn't exist
    if not os.path.isfile(old_file):
        print(f"File not found: {old_name}")
        continue

    # Skip if duplicate
    # if old_name in duplicate_current.values:
    #     print(f"Skipped duplicate source file: {old_name}")
    #     continue
    # if new_name in duplicate_new.values:
    #     new_name+='(1)'
    #     print(f"Adding (1) to target name: {new_name}")        
        #continue

    # Sanitize new file name
    safe_new_name = ''.join(c if c not in invalid_chars else '_' for c in new_name)
    new_file = os.path.join(folder_path, safe_new_name + ext)

    try:
        os.rename(old_file, new_file)
        print(f"Renamed: {old_name} -> {safe_new_name + ext}")
    except Exception as e:
        print(f"Error renaming {old_name} to {safe_new_name + ext}: {e}")
