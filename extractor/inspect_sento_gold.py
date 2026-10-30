import struct
from test_fixed import decompress_sd0
from disasm_ps_dec import decode_mips

with open("extracted/AFSLIST0.AFS", "rb") as afs:
    # sento_dll is file 4: offset 0x0010D000, size 505568
    afs.seek(0x0010D000)
    raw = afs.read(505568)

dec = decompress_sd0(raw)
print(f"Decompressed sento_dll: {len(dec)} bytes")

# Offset +0x009164 in sento_dll
base_off = 0x00009164
print(f"\n--- Sento Victory Logic at +0x{base_off:06X} ---")
for i in range(40):
    off = base_off + i * 4
    insn = struct.unpack("<I", dec[off:off+4])[0]
    print(f"+0x{off:06X}:  {decode_mips(insn, off)}")
