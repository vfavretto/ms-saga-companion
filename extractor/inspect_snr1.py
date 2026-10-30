import struct

# Check if AFSLIST0.AFS files contain calls or references to PS_DecSucc (symbol index)
# In SNR1, symbols have indices or names.
with open("extracted/SLUS_212.70", "rb") as f:
    slus = f.read()

# Let's find symbol index of PS_DecSucc in .sndata
# The symbol table starts at 0x002A0000 or similar
ps_dec_addr = 0x00106960
sym_table_offset = 0x0039EC3C - 0x000FF000 # from reverse state doc

print(f"Reading SNR1 export table at file offset 0x{sym_table_offset:08X}...")
# Let's inspect the SNR1 header
f_off = 0x00385080 - 0x000FF000
print(slus[f_off:f_off+32])
