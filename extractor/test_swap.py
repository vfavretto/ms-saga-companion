with open("extractor/glbdata_dec.bin", "rb") as f:
    data = bytearray(f.read())

# Swap every 4 bytes: [B0, B1, B2, B3] <-> [B3, B2, B1, B0]
swapped = bytearray(len(data))
for i in range(0, len(data) - 3, 4):
    swapped[i] = data[i+3]
    swapped[i+1] = data[i+2]
    swapped[i+2] = data[i+1]
    swapped[i+3] = data[i]

import re
strings = re.findall(b"[\x20-\x7E]{4,}", swapped)
print(f"Strings in byte-swapped glbdata: {len(strings)}")
for s in strings[:40]:
    print("  ->", s.decode('ascii'))
