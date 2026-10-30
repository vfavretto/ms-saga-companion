import struct
import json
import re

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800) # glbdata.cmp
    raw = f.read(37420)

# We know glbdata has SD0 header (16 bytes), then MRG archive
# Let's inspect all strings and their offsets
strings_with_pos = []
for match in re.finditer(b"[\x20-\x7E]{3,}", raw):
    s = match.group(0).decode('ascii', errors='ignore')
    if len(s.strip()) >= 3:
        strings_with_pos.append((match.start(), s))

print(f"Total structured strings found: {len(strings_with_pos)}")

# Let's group strings that look like Mobile Suits, Weapons, Option parts
known_ms_keywords = [
    "Zaku", "GM", "Gouf", "Dom", "Gelgoog", "Gundam", "Guncannon", 
    "Qubeley", "Marasai", "Kaempfer", "Nemo", "Rick Dias", "Zeta", 
    "Hizack", "Dreissen", "Jarja", "Sazabi", "Shining", "Heavyarms", "Deathscythe"
]

known_weapon_keywords = [
    "Saber", "Hawk", "Rifle", "Bazooka", "Cannon", "Shield", "Gatling",
    "Funnel", "Missile", "Lance", "Claw", "Hammer", "Vulcan", "Scythe", "Blade"
]

known_option_keywords = [
    "Booster", "Armor", "Propellant", "Psycommu", "Bio-Frame", "Recovery",
    "Medical", "Barrier", "Device", "Absorber", "Cloak", "HP Part", "Capacity"
]

print("\n--- Detected Mobile Suits ---")
for pos, s in strings_with_pos:
    if any(k.lower() in s.lower() for k in known_ms_keywords):
        print(f"  [0x{pos:04X}] {s}")

print("\n--- Detected Weapons ---")
for pos, s in strings_with_pos:
    if any(k.lower() in s.lower() for k in known_weapon_keywords):
        print(f"  [0x{pos:04X}] {s}")

print("\n--- Detected Option Parts ---")
for pos, s in strings_with_pos:
    if any(k.lower() in s.lower() for k in known_option_keywords):
        print(f"  [0x{pos:04X}] {s}")
