import struct

with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

entries = [
    (0x002A00E4, 0x001264B0),
    (0x002A03C0, 0x001265D0),
    (0x0029FC4C, 0x00126508),
    (0x002A01E0, 0x00126750)
]

for file_off, val in entries:
    str_ptr = struct.unpack("<I", data[file_off - 4 : file_off])[0] # The 4 bytes before value
    str_file_off = str_ptr - 0x000FF000
    s = data[str_file_off:].split(b'\x00')[0].decode('ascii', errors='ignore')
    print(f"Address 0x{val:08X} -> Symbol: '{s}'")
