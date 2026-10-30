import struct
from test_fixed import BitReader

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00032800)
    data = f.read(100)

comp_size, uncomp_size = struct.unpack("<II", data[4:12])
print(f"title_dll header: comp={comp_size}, uncomp={uncomp_size}")

reader = BitReader(data[12:])
fill_byte = reader.read_bits(8)
bit_count_a = reader.read_bits(8)
bit_count_b = reader.read_bits(8)
bit_count_c = reader.read_bits(8)
num_runs = reader.read_bits(16)

print(f"fill={hex(fill_byte)}, a={bit_count_a}, b={bit_count_b}, c={bit_count_c}, num_runs={num_runs}")
