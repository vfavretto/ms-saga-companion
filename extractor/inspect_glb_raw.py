with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800) # glbdata.cmp
    raw = f.read(37420)

print("glbdata.cmp header (first 48 bytes):")
for i in range(0, 48, 16):
    chunk = raw[i:i+16]
    print(f"{i:04x}: {chunk.hex()}  {''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)}")
