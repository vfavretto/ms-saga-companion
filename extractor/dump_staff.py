with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x0004B800)
    raw = f.read(64)

print("staff_dll raw bytes:")
for i in range(0, len(raw), 16):
    chunk = raw[i:i+16]
    print(f"{i:04x}:  {chunk.hex()}  {''.join(chr(b) if 32 <= b < 127 else '.' for b in chunk)}")
