import struct

with open("extracted/SLUS_212.70", "rb") as f:
    slus = f.read()

for target_name, target_addr in [("glb_townName", 0x003B7800), ("glb_dungeonName", 0x003B7BA8)]:
    # lui $reg, 0x003b ; addiu/lw $reg2, 0x7800
    # In MIPS: lui 0x003B (3b 00 0x 3c), then offset
    print(f"\nSearching references to {target_name} (0x{target_addr:08X})...")
    pat = struct.pack("<I", target_addr)
    idx = 0
    while True:
        pos = slus.find(pat, idx)
        if pos == -1: break
        print(f"  Exact pointer at file offset 0x{pos:08X} (VMA: 0x{pos + 0x000FF000:08X})")
        idx = pos + 1
