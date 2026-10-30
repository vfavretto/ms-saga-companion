import struct

class ByteMSBReader:
    def __init__(self, data):
        self.data = data
        self.byte_pos = 0
        self.bit_pos = 7
        
    def read_bit(self):
        if self.byte_pos >= len(self.data):
            return 0
        bit = (self.data[self.byte_pos] >> self.bit_pos) & 1
        if self.bit_pos == 0:
            self.bit_pos = 7
            self.byte_pos += 1
        else:
            self.bit_pos -= 1
        return bit
        
    def read_bits(self, n):
        val = 0
        for _ in range(n):
            val = (val << 1) | self.read_bit()
        return val

def decompress_byte_msb(data):
    comp_size, uncomp_size = struct.unpack("<II", data[4:12])
    reader = ByteMSBReader(data[12:])
    
    fill_byte = reader.read_bits(8)
    bit_count_a = reader.read_bits(8)
    bit_count_b = reader.read_bits(8)
    bit_count_c = reader.read_bits(8)
    num_runs = reader.read_bits(16)
    
    print(f"Header: fill=0x{fill_byte:02x}, a={bit_count_a}, b={bit_count_b}, c={bit_count_c}, runs={num_runs}")
    
    out = bytearray([fill_byte] * uncomp_size)
    s6 = 0
    for r in range(num_runs):
        delta = reader.read_bits(bit_count_a)
        s6 += delta
        stride = reader.read_bits(bit_count_b) + 1
        count = reader.read_bits(bit_count_c) + 1
        val = reader.read_bits(8)
        pos = s6
        for _ in range(count):
            if pos < uncomp_size:
                out[pos] = val
            pos += stride
            
    for i in range(uncomp_size):
        if out[i] == fill_byte:
            out[i] = reader.read_bits(8)
            
    return bytes(out)

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x0004B800) # staff_dll
    raw = f.read(9484)

dec = decompress_byte_msb(raw)
print(f"Decompressed staff_dll: {len(dec)} bytes (expected 18244)")
print("First 32 bytes:", dec[:32])
print("First 32 bytes (hex):", dec[:32].hex())
