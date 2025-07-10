import pandas as pd
import os
import shutil
import configparser

# Read configuration from config.properties
config = configparser.ConfigParser()
try:
    config.read('config.properties')
    folder_path = config['SETTINGS']['folder_path']
except KeyError:
    print("Error: 'folder_path' not found in config.properties under [SETTINGS] section.")
    exit()
except Exception as e:
    print(f"Error reading config.properties: {e}")
    exit()

# Read the CSV file
try:
    df = pd.read_csv('automobilista2_car_classes.csv')
except FileNotFoundError:
    print("Error: The CSV file 'automobilista2_car_classes.csv' was not found. Please ensure it's in the same directory as the script.")
    exit()

# Ensure the base folder path exists
if not os.path.isdir(folder_path):
    print(f"Error: The specified folder path '{folder_path}' does not exist. Please create it or provide a valid path in config.properties.")
    exit()

# Iterate through each row of the DataFrame
for index, row in df.iterrows():
    # Get folder name from the first column and file name from the second column
    folder_name = str(row.iloc[0])
    file_name = str(row.iloc[1])

    # Construct the full path for the new subfolder
    destination_folder_path = os.path.join(folder_path, folder_name)

    # Create the subfolder if it doesn't exist
    try:
        os.makedirs(destination_folder_path, exist_ok=True)
        print(f"Folder '{destination_folder_path}' created or already exists.")
    except OSError as e:
        print(f"Error creating folder '{destination_folder_path}': {e}")
        continue

    # Construct the full path for the source file
    source_file_path = os.path.join(folder_path, file_name)
    # Construct the full path for the destination file
    destination_file_path = os.path.join(destination_folder_path, file_name)

    # Move the file into the subfolder
    try:
        shutil.move(source_file_path, destination_file_path)
        print(f"File '{file_name}' moved to '{destination_folder_path}'.")
    except FileNotFoundError:
        print(f"Error: File '{file_name}' not found in '{folder_path}'. Skipping.")
    except Exception as e:
        print(f"Error moving file '{file_name}' to '{destination_folder_path}': {e}")

print("Script finished.")