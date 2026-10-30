import struct

# Simple MIPS disassembler helper for the decompression loop
def decode_mips(insn, pc):
    op = (insn >> 26) & 0x3F
    rs = (insn >> 21) & 0x1F
    rt = (insn >> 16) & 0x1F
    rd = (insn >> 11) & 0x1F
    sh = (insn >> 6) & 0x1F
    fn = insn & 0x3F
    imm = insn & 0xFFFF
    simm = imm if imm < 0x8000 else imm - 0x10000
    target = (insn & 0x3FFFFFF) << 2
    
    reg = ["zero", "at", "v0", "v1", "a0", "a1", "a2", "a3", 
           "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7",
           "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
           "t8", "t9", "k0", "k1", "gp", "sp", "fp", "ra"]
    
    rname = lambda r: reg[r]
    
    if op == 0:
        if fn == 0x00: return f"sll ${rname(rd)}, ${rname(rt)}, {sh}"
        if fn == 0x02: return f"srl ${rname(rd)}, ${rname(rt)}, {sh}"
        if fn == 0x03: return f"sra ${rname(rd)}, ${rname(rt)}, {sh}"
        if fn == 0x08: return f"jr ${rname(rs)}"
        if fn == 0x09: return f"jalr ${rname(rd)}, ${rname(rs)}"
        if fn == 0x20: return f"add ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x21: return f"addu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x23: return f"subu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x24: return f"and ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x25: return f"or ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x26: return f"xor ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x27: return f"nor ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x2A: return f"slt ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        if fn == 0x2B: return f"sltu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        return f"special 0x{fn:02x}"
    if op == 0x02: return f"j 0x{(pc & 0xF0000000) | target:08x}"
    if op == 0x03: return f"jal 0x{(pc & 0xF0000000) | target:08x}"
    if op == 0x04: return f"beq ${rname(rs)}, ${rname(rt)}, 0x{pc + 4 + (simm << 2):08x}"
    if op == 0x05: return f"bne ${rname(rs)}, ${rname(rt)}, 0x{pc + 4 + (simm << 2):08x}"
    if op == 0x08: return f"addi ${rname(rt)}, ${rname(rs)}, {simm}"
    if op == 0x09: return f"addiu ${rname(rt)}, ${rname(rs)}, {simm}"
    if op == 0x0A: return f"slti ${rname(rt)}, ${rname(rs)}, {simm}"
    if op == 0x0C: return f"andi ${rname(rt)}, ${rname(rs)}, 0x{imm:04x}"
    if op == 0x0D: return f"ori ${rname(rt)}, ${rname(rs)}, 0x{imm:04x}"
    if op == 0x0F: return f"lui ${rname(rt)}, 0x{imm:04x}"
    if op == 0x20: return f"lb ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x21: return f"lh ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x23: return f"lw ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x24: return f"lbu ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x25: return f"lhu ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x28: return f"sb ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x29: return f"sh ${rname(rt)}, {simm}(${rname(rs)})"
    if op == 0x2B: return f"sw ${rname(rt)}, {simm}(${rname(rs)})"
    return f"op 0x{op:02x}"

with open("extracted/SLUS_212.70", "rb") as f:
    f.seek(0x7960)
    for i in range(120):
        pc = 0x00106960 + i * 4
        raw = f.read(4)
        insn = struct.unpack("<I", raw)[0]
        print(f"0x{pc:08x}:  {raw.hex()}  {decode_mips(insn, pc)}")
