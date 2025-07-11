import csv
import json
import re
import os
import requests
from bs4 import BeautifulSoup
import configparser

def sanitize_filename(name):
    # Replace invalid filename characters with _
    return re.sub(r'[\\/:*?"<>| ]', '_', name)

def extract_data_from_page(soup):
    data = {
        "Track Type": None,
        "TrackGradeFilter": None,
        "Length": None,
        "Location": None,
        "Recommended classes": None
    }
    
    # Find the first table (infobox has no class)
    infobox = soup.find('table')
    if infobox:
        rows = infobox.find_all('tr')
        for row in rows:
            th = row.find('th')
            td = row.find('td')
            if th and td:
                key = th.text.strip()
                value = td.text.strip()
                if key == 'Track Type':
                    data["Track Type"] = value
                elif key == 'TrackGradeFilter':
                    data["TrackGradeFilter"] = value
                elif key == 'Length':
                    data["Length"] = value
                elif key == 'Location':
                    data["Location"] = value
                elif key == 'Recommended classes':
                    data["Recommended classes"] = value  # Now captured directly from table
    
    return data

def download_image(soup, folder, filename):
    # Find the infobox table
    infobox = soup.find('table')
    if infobox:
        # Find the first <a> in the first row (image link)
        a_tag = infobox.find('a')
        if a_tag and 'href' in a_tag.attrs:
            img_url = a_tag['href']
            # Ensure it's a full URL
            if img_url.startswith('//'):
                img_url = 'https:' + img_url
            elif not img_url.startswith('http'):
                img_url = 'https://automobilista-2.fandom.com' + img_url
            try:
                response = requests.get(img_url, stream=True)
                if response.status_code == 200:
                    # Get extension from URL (handle query params)
                    ext = os.path.splitext(img_url.split('?')[0])[1] or '.png'
                    img_filename = os.path.join(folder, filename + ext)
                    with open(img_filename, 'wb') as f:
                        for chunk in response.iter_content(1024):
                            f.write(chunk)
                    print(f"Downloaded image: {img_filename}")
                    return True
            except Exception as e:
                print(f"Error downloading image: {e}")
    return False

def main():
    # Read config.properties
    config = configparser.ConfigParser()
    config.read('config.properties')
    
    # Get CSV path from property 'trackmaps' under [SETTINGS]
    try:
        csv_path = config['SETTINGS']['trackmaps']
    except KeyError:
        print("Error: 'trackmaps' property not found in [SETTINGS] section of config.properties")
        return
    
    if not os.path.exists(csv_path):
        print(f"Error: CSV file not found at {csv_path}")
        return
    
    # Create 'tracks' folder if it doesn't exist
    tracks_folder = 'tracks'
    if not os.path.exists(tracks_folder):
        os.makedirs(tracks_folder)
        print(f"Created folder: {tracks_folder}")
    
    with open(csv_path, 'r', encoding='utf-8') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            track_name = row.get('Track Name')
            url = row.get('Hyperlink')
            
            if not track_name or not url:
                print("Skipping row: Missing Track Name or Hyperlink")
                continue
            
            filename = sanitize_filename(track_name)
            
            try:
                # Fetch the page
                response = requests.get(url)
                if response.status_code != 200:
                    print(f"Error fetching page {url}: Status {response.status_code}")
                    continue
                
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Download image
                download_image(soup, tracks_folder, filename)
                
                # Extract data
                data = extract_data_from_page(soup)
                
                # Write JSON
                json_filename = os.path.join(tracks_folder, filename + '.json')
                with open(json_filename, 'w', encoding='utf-8') as jsonfile:
                    json.dump(data, jsonfile, indent=4)
                print(f"Generated JSON: {json_filename}")
            
            except Exception as e:
                print(f"Error processing {track_name} ({url}): {e}")
                continue

if __name__ == "__main__":
    main()