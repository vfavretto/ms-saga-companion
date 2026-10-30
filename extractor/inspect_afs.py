import struct
import os

afs_path = "extracted/AFSLIST0.AFS"

if not os.path.exists(afs_path):
    print(f"File not found: {afs_path}")
    exit(1)

with open(afs_path, "rb") as f:
    magic = f.read(4)
    file_count = struct.unpack("<I", f.read(4))[0]
    print(f"Magic: {magic}, File Count: {file_count}")
    
    entries = []
    for i in range(min(file_count, 30)):
        offset, size = struct.unpack("<II", f.read(8))
        entries.append((i, offset, size))
        
    for idx, off, sz in entries[:15]:
        # Peek first 16 bytes of each file
        f.seek(off)
        header = f.read(16)
        print(f"[{idx:04d}] Offset: 0x{off:08X}, Size: {sz:8d} bytes | Header: {header}")
