import struct
from test_fixed import decompress_sd0

with open("extracted/AFSLIST0.AFS", "rb") as f:
    # fmap_dll.cmp: offset 739328, size 360828
    f.seek(739328)
    fmap_cmp = f.read(360828)
    
    # tmap_dll.cmp: offset 1796096, size 414056
    f.seek(1796096)
    tmap_cmp = f.read(414056)

print("Decompressing fmap_dll...")
fmap_dec = decompress_sd0(fmap_cmp)
with open("extractor/fmap_dll.bin", "wb") as f_out:
    f_out.write(fmap_dec)
print(f"Saved fmap_dll.bin ({len(fmap_dec)} bytes)")

print("Decompressing tmap_dll...")
tmap_dec = decompress_sd0(tmap_cmp)
with open("extractor/tmap_dll.bin", "wb") as f_out:
    f_out.write(tmap_dec)
print(f"Saved tmap_dll.bin ({len(tmap_dec)} bytes)")
