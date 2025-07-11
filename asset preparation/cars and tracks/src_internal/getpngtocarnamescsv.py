from bs4 import BeautifulSoup
import re
import pandas as pd

# Load updated HTML file
with open("cars.html", "r", encoding="utf-8") as f:
    soup = BeautifulSoup(f, "html.parser")

# Find all wow-image tags with .png in their image uri
image_tags = soup.find_all("wow-image")
results = []

for img_tag in image_tags:
    img_info = img_tag.get("data-image-info")
    if img_info:
        match = re.search(r'"uri"\s*:\s*"([^"]+\.png)"', img_info)
        if match:
            png_url = match.group(1)
            png_filename = png_url.split("/")[-1].split("?")[0]

            # Find nearest gallery title div after this image
            title_div = img_tag.find_next("div", {"data-testid": "gallery-item-title"})
            title = title_div.get_text(strip=True) if title_div else ""
            results.append((png_filename, title))

# Create DataFrame and export
df_new = pd.DataFrame(results, columns=["PNG File Name", "Gallery Item Title"])
csv_output_path = "updated_png_titles.csv"
df_new.to_csv(csv_output_path, index=False)

csv_output_path
