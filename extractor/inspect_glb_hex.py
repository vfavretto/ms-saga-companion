with open("extractor/glbdata_dec.bin", "rb") as f:
    data = f.read()

idx = data.find(b"ajraJ")
if idx != -1:
    print(f"Found ajraJ at 0x{idx:08X}:")
    print(data[idx-10:idx+20])
    print(data[idx-10:idx+20].hex())

idx = data.find(b"azaS")
if idx != -1:
    print(f"\nFound azaS at 0x{idx:08X}:")
    print(data[idx-10:idx+20])
    print(data[idx-10:idx+20].hex())
