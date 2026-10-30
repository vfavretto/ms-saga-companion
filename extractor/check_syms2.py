with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

for target in [0x00106928, 0x001067C0]:
    pat = target.to_bytes(4, "little")
    idx = data.find(pat)
    if idx != -1:
        str_ptr = int.from_bytes(data[idx-4:idx], "little")
        s = data[str_ptr - 0x000FF000:].split(b'\x00')[0].decode('ascii', errors='ignore')
        print(f"Address 0x{target:08X} -> Symbol: '{s}'")
    else:
        print(f"Address 0x{target:08X} not in export table")
