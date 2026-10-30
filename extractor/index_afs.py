import struct
import json

afs_path = "extracted/AFSLIST0.AFS"

with open(afs_path, "rb") as f:
    magic = f.read(4)
    file_count = struct.unpack("<I", f.read(4))[0]
    
    entries = []
    for i in range(file_count):
        offset, size = struct.unpack("<II", f.read(8))
        entries.append({"id": i, "offset": offset, "size": size})
        
    f.seek(8 + 8 * file_count)
    dir_offset, dir_size = struct.unpack("<II", f.read(8))
    
    f.seek(dir_offset)
    for i in range(file_count):
        entry_raw = f.read(48)
        name = entry_raw[:32].split(b'\x00')[0].decode('ascii', errors='ignore')
        entries[i]["name"] = name

# Filter some interesting patterns
keywords = ["data", "item", "ms", "weapon", "enemy", "map", "dungeon", "town", "quest", "event", "shop"]

print(f"Indexed {len(entries)} files from AFSLIST0.AFS")

matches_by_kw = {}
for kw in keywords:
    matched = [e for e in entries if kw in e["name"].lower()]
    matches_by_kw[kw] = matched
    print(f"Keyword '{kw}': {len(matched)} files found (e.g. {[m['name'] for m in matched[:5]]})")

with open("extractor/afs_file_index.json", "w", encoding="utf-8") as out:
    json.dump(entries, out, indent=2)
print("Saved full index to extractor/afs_file_index.json")
