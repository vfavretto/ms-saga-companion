import struct

elf_path = "extracted/SLUS_212.70"
with open(elf_path, "rb") as f:
    f.seek(0x7960) # 0x00106960 - 0x000FF000
    code = f.read(256)
    
print("Bytes at 0x00106960:")
print(code.hex())
