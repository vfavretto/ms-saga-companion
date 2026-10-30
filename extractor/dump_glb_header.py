with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800)
    raw = f.read(256)

for i in range(0, len(raw), 16):
    chunk = raw[i:i+16]
    hex_s = " ".join(f"{b:02x}" for b in chunk)
    asc_s = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
    print(f"{i:04x}: {hex_s:<48}  {asc_s}")
