import struct

with open("extracted/SLUS_212.70", "rb") as f:
    f.seek(0x00106014 - 0x000FF000)
    for i in range(15):
        pc = 0x00106014 + i * 4
        raw = f.read(4)
        insn = struct.unpack("<I", raw)[0]
        op = (insn >> 26) & 0x3F
        rs = (insn >> 21) & 0x1F
        rt = (insn >> 16) & 0x1F
        rd = (insn >> 11) & 0x1F
        sh = (insn >> 6) & 0x1F
        fn = insn & 0x3F
        imm = insn & 0xFFFF
        print(f"0x{pc:08X}: {raw.hex()} | op=0x{op:02x} fn=0x{fn:02x} rs={rs:2d} rt={rt:2d} rd={rd:2d} sh={sh:2d} imm=0x{imm:04x}")
