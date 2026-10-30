import struct

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x5FAEF800)
    for i in range(15):
        entry_raw = f.read(48)
        # Typically 32 bytes name (null-padded) + year(2), month(2), day(2), hour(2), min(2), sec(2), size(4) = 48 bytes!
        name = entry_raw[:32].split(b'\x00')[0].decode('ascii', errors='ignore')
        meta = entry_raw[32:]
        year, month, day, hour, minute, sec, sz = struct.unpack("<HHHHHHI", meta)
        print(f"[{i:04d}] {name:20s} | {year:04d}-{month:02d}-{day:02d} {hour:02d}:{minute:02d}:{sec:02d} | Size: {sz}")
