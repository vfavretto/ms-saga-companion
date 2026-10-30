import re

with open("extracted/SLUS_212.70", "rb") as f:
    data = f.read()

# Search for symbols near PS_DecSucc
pos = 0x002879EC
strings = re.findall(b"[A-Za-z0-9_]{3,}", data[pos-200:pos+300])
for s in strings:
    print(s.decode('ascii'))
