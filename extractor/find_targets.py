import struct

with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

# Let's search pointer table for 0x001264b0 and 0x001265d0
for target in [0x001264b0, 0x001265d0, 0x00126508, 0x00126750]:
    pat = struct.pack("<I", target)
    idx = 0
    while True:
        pos = data.find(pat, idx)
        if pos == -1: break
        print(f"Target 0x{target:08X} referenced at 0x{pos:08X} (VMA: 0x{pos + 0x000FF000:08X})")
        idx = pos + 1
