import struct
from test_decompress import decompress_sd0

with open("extracted/AFSLIST0.AFS", "rb") as f:
    # glbdata.cmp is file 14: offset 0x00388800, size 37420
    f.seek(0x00388800)
    raw = f.read(37420)

dec = decompress_sd0(raw)
print(f"Decompressed glbdata: {len(dec)} bytes (expected ~134140)")
with open("extractor/glbdata_dec.bin", "wb") as f_out:
    f_out.write(dec)

# Check strings in decompressed glbdata
import re
strings = re.findall(b"[\x20-\x7E]{4,}", dec)
print(f"Strings found in glbdata: {len(strings)}")
for s in strings[:30]:
    print("  ->", s.decode('ascii'))
