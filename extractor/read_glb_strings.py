import re

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800)
    raw = f.read(37420)

# Search all ASCII strings in raw glbdata.cmp
strings = re.findall(b"[\x20-\x7E]{3,}", raw)
print(f"Total ASCII strings in raw glbdata: {len(strings)}")

# Let's filter out interesting strings
decoded = [s.decode('ascii', errors='ignore') for s in strings]

print("\n--- First 50 strings ---")
for s in decoded[:50]:
    if len(s.strip()) > 2:
        print("  *", s)
