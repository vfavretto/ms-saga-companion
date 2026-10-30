with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00346000)
    raw = f.read(60)

print("dllfsize.cmp full hex dump (60 bytes):")
for i in range(0, len(raw), 16):
    chunk = raw[i:i+16]
    hex_str = " ".join(f"{b:02x}" for b in chunk)
    ascii_str = "".join(chr(b) if 32 <= b < 127 else "." for b in chunk)
    print(f"{i:04x}:  {hex_str:<48}  {ascii_str}")
