with open("extractor/glbdata_exact.bin", "rb") as f:
    data = f.read()

# Let's search for "AmarF" in data
idx = data.find(b"AmarF")
print(f"AmarF found at 0x{idx:08X}:")
chunk = data[idx:idx+30]
print(chunk)
print(chunk.hex())

idx2 = data.find(b"0Ccanonn")
if idx2 != -1:
    print(f"\n0Ccanonn found at 0x{idx2:08X}:")
    chunk2 = data[idx2:idx2+30]
    print(chunk2)
    print(chunk2.hex())
