import struct

with open("extracted/SLUS_212.70", "rb") as f:
    f.seek(0x00106960 - 0x000FF000)
    raw = f.read(0x00106b18 - 0x00106960)

with open("extractor/ps_dec_raw.bin", "wb") as f_out:
    f_out.write(raw)

print(f"Dumped {len(raw)} bytes of PS_DecSucc")
