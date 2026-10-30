import json

with open("extractor/afs_file_index.json", "r") as f:
    files = json.load(f)

with open("extracted/AFSLIST0.AFS", "rb") as afs:
    for target_id in [514, 25469]:
        meta = files[target_id]
        afs.seek(meta["offset"])
        chunk = afs.read(min(meta["size"], 128))
        print(f"\n--- [{meta['id']}] {meta['name']} (Offset 0x{meta['offset']:08X}, Size {meta['size']}) ---")
        print(chunk[:32].hex())
        print(chunk[:32])
