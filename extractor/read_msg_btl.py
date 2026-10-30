import re

with open("extracted/AFSLIST0.AFS", "rb") as afs:
    afs.seek(0x56876800)
    data = afs.read(7824)

strings = re.findall(b"[\x20-\x7E]{3,}", data)
print(f"Strings in msg_btl.cmp: {len(strings)}")
for s in strings:
    print("  *", s.decode('ascii'))
