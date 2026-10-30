with open("9F18CBC5.pnach", "r", encoding="utf-8") as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if any(k in line.lower() for k in ["gold", "exp", "drop", "sento", "0x01f", "high ram", "party"]):
        print(f"Line {idx+1}: {line.strip()}")
