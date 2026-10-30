with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

idx = data.find(b"PS_DecSucc")
print(f"PS_DecSucc name found at offset: 0x{idx:08X}")

# Search for the pointer to PS_DecSucc (0x00106960)
ptr_pattern = (0x00106960).to_bytes(4, "little")
pos = 0
while True:
    p = data.find(ptr_pattern, pos)
    if p == -1: break
    print(f"Found pointer to 0x00106960 at file offset 0x{p:08X} (VMA: 0x{p + 0x000FF000:08X})")
    pos = p + 1
