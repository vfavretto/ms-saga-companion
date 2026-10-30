import struct

with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

targets = [
    b"glb_dungeonName\x00",
    b"glb_townName\x00",
    b"glb_shopItemList\x00",
    b"FMMF_FMapMainBoot\x00",
    b"TMMF_TMapMainBoot\x00",
    b"gEvtStat\x00"
]

for t in targets:
    pos = data.find(t)
    if pos != -1:
        vma = pos + 0x000FF000
        # Search for references to this string pointer in .sndata
        str_pat = struct.pack("<I", vma)
        ref = 0
        while True:
            idx = data.find(str_pat, ref)
            if idx == -1: break
            # Each SNR1 symbol entry is: (name_ptr: 4, val_ptr: 4, type: 4)
            val = struct.unpack("<I", data[idx+4:idx+8])[0]
            print(f"Symbol '{t.decode('ascii').strip(chr(0))}' string @ 0x{vma:08X} -> Value: 0x{val:08X} (at file offset 0x{idx:08X})")
            ref = idx + 1
