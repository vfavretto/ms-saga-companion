with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

pattern = b"\x58\x1a\x04\x0c"
pos = 0
while True:
    idx = data.find(pattern, pos)
    if idx == -1:
        break
    addr = idx + 0x000FF000
    print(f"Found 'jal PS_DecSucc' at 0x{addr:08X}")
    pos = idx + 1
