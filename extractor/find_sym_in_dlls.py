with open("extracted/AFSLIST0.AFS", "rb") as afs:
    # tmap_dll is file 6: offset 0x001B6800, size 414056
    afs.seek(0x001B6800)
    tmap_raw = afs.read(414056)
    
    # fmap_dll is file 3: offset 0x000B4800, size 360828
    afs.seek(0x000B4800)
    fmap_raw = afs.read(360828)

print("Searching in tmap_dll:")
for s in [b"glb_townName", b"glb_dungeonName", b"town", b"dungeon"]:
    pos = tmap_raw.find(s)
    print(f"  '{s.decode('ascii')}' in tmap: {pos}")

print("\nSearching in fmap_dll:")
for s in [b"glb_townName", b"glb_dungeonName", b"town", b"dungeon"]:
    pos = fmap_raw.find(s)
    print(f"  '{s.decode('ascii')}' in fmap: {pos}")
