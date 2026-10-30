with open("extracted/SLUS_212.70", "rb") as f:
    # glb_townName at 0x003B7800
    f.seek(0x003B7800 - 0x000FF000)
    towns_blob = f.read(0x3B7BA8 - 0x3B7800)
    
    # glb_dungeonName at 0x003B7BA8
    f.seek(0x003B7BA8 - 0x000FF000)
    dungeons_blob = f.read(1500)

print("--- Town Names Table (glb_townName) ---")
town_strings = [s.decode('ascii', errors='ignore') for s in towns_blob.split(b'\x00') if len(s.strip()) > 0]
for idx, name in enumerate(town_strings):
    print(f"  Town [{idx:02d}]: {name}")

print("\n--- Dungeon Names Table (glb_dungeonName) ---")
dungeon_strings = [s.decode('ascii', errors='ignore') for s in dungeons_blob.split(b'\x00') if len(s.strip()) > 0]
for idx, name in enumerate(dungeon_strings):
    print(f"  Dungeon [{idx:02d}]: {name}")
