with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

# Let's inspect the SNR1 symbol entry at 0x002A00E4
# Each symbol entry is usually (name_offset, value, type)
for addr in [0x002A00E4, 0x002A03C0, 0x0029FC4C, 0x002A01E0]:
    chunk = data[addr-16:addr+32]
    print(f"Offset 0x{addr:08X}: {chunk.hex()}")
