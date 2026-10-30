import re

with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

# Find ASCII strings with length >= 4
strings = re.findall(b"[\x20-\x7E]{4,}", data)
print(f"Total ASCII strings in SLUS_212.70: {len(strings)}")

interesting = ["Zaku", "Gundam", "GM", "Rifle", "Saber", "Tristan", "Fritz", "Tremmie", "Eisengrad", "G-System"]

for word in interesting:
    matches = [s.decode('ascii', errors='ignore') for s in strings if word.lower() in s.decode('ascii', errors='ignore').lower()]
    print(f"Matches for '{word}': {len(matches)}")
    for m in matches[:5]:
        print(f"   -> {m}")
