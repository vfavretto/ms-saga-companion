import re

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800)
    raw = f.read(37420)

strings = re.findall(b"[\x20-\x7E]{3,}", raw)
decoded = [s.decode('ascii', errors='ignore') for s in strings]

print("\n--- Strings 50 to 150 ---")
for s in decoded[50:150]:
    if len(s.strip()) > 2:
        print("  *", s)
