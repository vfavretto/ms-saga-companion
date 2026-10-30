import struct

def disasm_block(start_addr, count):
    reg = ["zero", "at", "v0", "v1", "a0", "a1", "a2", "a3", 
           "t0", "t1", "t2", "t3", "t4", "t5", "t6", "t7",
           "s0", "s1", "s2", "s3", "s4", "s5", "s6", "s7",
           "t8", "t9", "k0", "k1", "gp", "sp", "fp", "ra"]
    
    with open("extracted/SLUS_212.70", "rb") as f:
        f.seek(start_addr - 0x000FF000)
        data = f.read(count * 4)
        
    for i in range(count):
        insn = struct.unpack("<I", data[i*4:(i+1)*4])[0]
        pc = start_addr + i * 4
        op = (insn >> 26) & 0x3F
        rs = (insn >> 21) & 0x1F
        rt = (insn >> 16) & 0x1F
        rd = (insn >> 11) & 0x1F
        sh = (insn >> 6) & 0x1F
        fn = insn & 0x3F
        imm = insn & 0xFFFF
        simm = imm if imm < 0x8000 else imm - 0x10000
        target = (insn & 0x3FFFFFF) << 2
        rname = lambda r: reg[r]
        
        name = f"unk_{op:02x}"
        if op == 0:
            if fn == 0x00: name = f"sll ${rname(rd)}, ${rname(rt)}, {sh}"
            elif fn == 0x02: name = f"srl ${rname(rd)}, ${rname(rt)}, {sh}"
            elif fn == 0x03: name = f"sra ${rname(rd)}, ${rname(rt)}, {sh}"
            elif fn == 0x04: name = f"sllv ${rname(rd)}, ${rname(rt)}, ${rname(rs)}"
            elif fn == 0x06: name = f"srlv ${rname(rd)}, ${rname(rt)}, ${rname(rs)}"
            elif fn == 0x07: name = f"srav ${rname(rd)}, ${rname(rt)}, ${rname(rs)}"
            elif fn == 0x08: name = f"jr ${rname(rs)}"
            elif fn == 0x09: name = f"jalr ${rname(rd)}, ${rname(rs)}"
            elif fn == 0x0A: name = f"movz ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x0B: name = f"movn ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x20: name = f"add ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x21: name = f"addu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x22: name = f"sub ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x23: name = f"subu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x24: name = f"and ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x25: name = f"or ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x26: name = f"xor ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x27: name = f"nor ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x2A: name = f"slt ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x2B: name = f"sltu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
            elif fn == 0x2D: name = f"daddu ${rname(rd)}, ${rname(rs)}, ${rname(rt)}"
        elif op == 0x01:
            if rt == 0: name = f"bltz ${rname(rs)}, 0x{pc + 4 + (simm << 2):08x}"
            elif rt == 1: name = f"bgez ${rname(rs)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x02: name = f"j 0x{(pc & 0xF0000000) | target:08x}"
        elif op == 0x03: name = f"jal 0x{(pc & 0xF0000000) | target:08x}"
        elif op == 0x04: name = f"beq ${rname(rs)}, ${rname(rt)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x05: name = f"bne ${rname(rs)}, ${rname(rt)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x06: name = f"blez ${rname(rs)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x07: name = f"bgtz ${rname(rs)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x08: name = f"addi ${rname(rt)}, ${rname(rs)}, {simm}"
        elif op == 0x09: name = f"addiu ${rname(rt)}, ${rname(rs)}, {simm}"
        elif op == 0x0A: name = f"slti ${rname(rt)}, ${rname(rs)}, {simm}"
        elif op == 0x0B: name = f"sltiu ${rname(rt)}, ${rname(rs)}, {simm}"
        elif op == 0x0C: name = f"andi ${rname(rt)}, ${rname(rs)}, 0x{imm:04x}"
        elif op == 0x0D: name = f"ori ${rname(rt)}, ${rname(rs)}, 0x{imm:04x}"
        elif op == 0x0E: name = f"xori ${rname(rt)}, ${rname(rs)}, 0x{imm:04x}"
        elif op == 0x0F: name = f"lui ${rname(rt)}, 0x{imm:04x}"
        elif op == 0x14: name = f"beql ${rname(rs)}, ${rname(rt)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x15: name = f"bnel ${rname(rs)}, ${rname(rt)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x16: name = f"blezl ${rname(rs)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x17: name = f"bgtzl ${rname(rs)}, 0x{pc + 4 + (simm << 2):08x}"
        elif op == 0x1F: name = f"sq ${rname(rt)}, {simm}(${rname(rs)})" # Sony EE quadword store
        elif op == 0x1E: name = f"lq ${rname(rt)}, {simm}(${rname(rs)})" # Sony EE quadword load
        elif op == 0x20: name = f"lb ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x21: name = f"lh ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x23: name = f"lw ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x24: name = f"lbu ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x25: name = f"lhu ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x27: name = f"lwu ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x28: name = f"sb ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x29: name = f"sh ${rname(rt)}, {simm}(${rname(rs)})"
        elif op == 0x2B: name = f"sw ${rname(rt)}, {simm}(${rname(rs)})"
        print(f"0x{pc:08x}: {name}")

print("=== PS_DecSucc ===")
disasm_block(0x00106960, 110)
