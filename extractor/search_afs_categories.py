import json

with open("extractor/afs_file_index.json", "r", encoding="utf-8") as f:
    files = json.load(f)

# Search for interesting files
names = [f["name"] for f in files]

categories = {
    "town": [f for f in files if "town" in f["name"].lower()],
    "map": [f for f in files if "map" in f["name"].lower()],
    "sento": [f for f in files if "sento" in f["name"].lower() or "btl" in f["name"].lower()],
    "mrg": [f for f in files if ".mrg" in f["name"].lower() or "mrg" in f["name"].lower()],
    "tbl": [f for f in files if "tbl" in f["name"].lower()],
    "param": [f for f in files if "param" in f["name"].lower() or "prm" in f["name"].lower()],
    "script": [f for f in files if "scr" in f["name"].lower() or "ev" in f["name"].lower()]
}

for cat, flist in categories.items():
    print(f"\n--- Category '{cat}' ({len(flist)} files) ---")
    for item in flist[:12]:
        print(f"  [{item['id']:04d}] {item['name']:25s} | size: {item['size']:8d}")
