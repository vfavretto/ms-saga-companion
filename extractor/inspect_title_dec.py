from test_fixed import decompress_sd0

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00032800) # title_dll
    raw = f.read(100984)

dec = decompress_sd0(raw)
idx = dec.find(b"SNR1")
print(f"SNR1 found in decompressed title_dll at offset: {idx}")

# Also search for strings in decompressed title_dll
import re
strings = re.findall(b"[\x20-\x7E]{4,}", dec)
print(f"Strings found: {len(strings)}")
for s in strings[:30]:
    print("  ->", s.decode('ascii'))
