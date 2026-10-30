import struct
from disasm_ps_dec import decode_mips

with open("extracted/SLUS_212.70", "rb") as f:
    for addr in [0x00105ef0, 0x00105f88]:
        f.seek(addr - 0x000FF000)
        print(f"\n--- Function at 0x{addr:08x} ---")
        for i in range(25):
            pc = addr + i * 4
            raw = f.read(4)
            insn = struct.unpack("<I", raw)[0]
            print(f"0x{pc:08x}:  {raw.hex()}  {decode_mips(insn, pc)}")
