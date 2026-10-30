with open("extracted/SLUS_212.70", "rb") as f:
    f.seek(0x001003F0 - 0x000FF000) # GAME_Main
    data = f.read(4000)

print("Searching for dllfsize or references to AFS file 11...")
# File index 11 is 0x0B
