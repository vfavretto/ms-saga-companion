import struct
from test_fixed import decompress_sd0

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00032800)
    raw = f.read(100984)

dec = decompress_sd0(raw)
print(f"Decompressed title_dll: {len(dec)} bytes (expected 248732)")
print("First 32 bytes:", dec[:32])
print("First 32 bytes (hex):", dec[:32].hex())
print("Last 32 bytes (hex):", dec[-32:].hex())
