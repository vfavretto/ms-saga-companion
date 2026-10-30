import json
from collections import Counter

with open("extractor/afs_file_index.json", "r", encoding="utf-8") as f:
    files = json.load(f)

extensions = Counter()
prefixes = Counter()

for f in files:
    name = f["name"]
    ext = name.split(".")[-1] if "." in name else "none"
    extensions[ext] += 1
    pfx = name[:3] if len(name) >= 3 else name
    prefixes[pfx] += 1

print("Top 15 extensions:")
for ext, count in extensions.most_common(15):
    print(f"  .{ext:8s}: {count}")

print("\nTop 20 file prefixes:")
for pfx, count in prefixes.most_common(20):
    print(f"  {pfx:8s}: {count}")
    
# Let's inspect all files from id 0 to 50
print("\nFirst 35 files:")
for f in files[:35]:
    print(f"  [{f['id']:04d}] {f['name']:25s} | size: {f['size']:8d} (offset 0x{f['offset']:08X})")
