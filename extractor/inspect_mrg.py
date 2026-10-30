import struct

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800)
    raw = f.read(37420)

# Skip 12 or 16 bytes SD0 header
# At offset 12: 00 4d 52 47 (MRG)
mrg_data = raw[16:]
print("MRG length:", len(mrg_data))

# Let's inspect the MRG header
file_count = struct.unpack("<H", mrg_data[6:8])[0]
print(f"Possible sub-file count: {file_count}")

# Read first 10 uint32 offsets
offsets = []
for i in range(16):
    off = struct.unpack("<I", mrg_data[8 + i*4 : 12 + i*4])[0]
    offsets.append(off)
    print(f"Subfile [{i:02d}]: offset 0x{off:08X} ({off})")
