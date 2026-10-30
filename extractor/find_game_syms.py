import re

with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

# Search for symbols matching map, gold, money, chest, item, party in .sndata
# .sndata symbols are in ASCII from 0x00385080 to 0x003B3313 (file offset 0x00286080 to 0x002B4313)
sym_region = data[0x00286080:0x002B4313]
symbols = re.findall(b"[A-Za-z0-9_]{3,}", sym_region)
decoded_syms = set(s.decode('ascii', errors='ignore') for s in symbols)

print(f"Total symbols extracted from .sndata: {len(decoded_syms)}")

keywords = ["map", "gold", "money", "area", "stage", "dungeon", "town", "box", "takara", "item", "party", "flag", "pos", "save"]

for kw in keywords:
    matches = [s for s in decoded_syms if kw in s.lower()]
    print(f"Keyword '{kw}': {len(matches)} symbols (e.g. {matches[:6]})")
