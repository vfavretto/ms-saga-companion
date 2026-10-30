import struct

with open("extracted/AFSLIST0.AFS", "rb") as f:
    magic = f.read(4)
    file_count = struct.unpack("<I", f.read(4))[0]
    f.seek(8 + 8 * file_count)
    info = f.read(8)
    if len(info) == 8:
        dir_offset, dir_size = struct.unpack("<II", info)
        print(f"Directory Offset: 0x{dir_offset:08X}, Size: {dir_size}")
        if dir_offset > 0 and dir_offset < 1606543360:
            f.seek(dir_offset)
            # AFS filename directory format: 32 bytes per entry (filename: 32 bytes, or filename 24 bytes + date/time)
            print("First 10 filenames:")
            for i in range(10):
                entry_raw = f.read(32)
                name = entry_raw[:20].decode('ascii', errors='ignore').rstrip('\x00')
                print(f"  [{i:04d}] {name} (raw: {entry_raw[:20].hex()})")
