import struct

class BitReader:
    def __init__(self, data):
        self.data = data
        self.offset = 0
        self.current_word = 0
        self.bits_left = 0
        self.refill()
        
    def refill(self):
        if self.offset + 4 <= len(self.data):
            self.current_word = struct.unpack("<I", self.data[self.offset:self.offset+4])[0]
            self.offset += 4
            self.bits_left = 32
        elif self.offset < len(self.data):
            rem = self.data[self.offset:] + b'\x00' * (4 - (len(self.data) - self.offset))
            self.current_word = struct.unpack("<I", rem)[0]
            self.offset = len(self.data)
            self.bits_left = 32
        else:
            self.current_word = 0
            self.bits_left = 0
            
    def read_bits(self, n):
        if n == 0:
            return 0
        if n <= self.bits_left:
            self.bits_left -= n
            val = (self.current_word >> self.bits_left) & ((1 << n) - 1)
            return val
        else:
            part1_bits = self.bits_left
            val1 = self.current_word & ((1 << part1_bits) - 1)
            n_remain = n - part1_bits
            self.refill()
            if self.bits_left < n_remain:
                return 0
            self.bits_left -= n_remain
            val2 = (self.current_word >> self.bits_left) & ((1 << n_remain) - 1)
            return (val1 << n_remain) | val2

def decompress_sd0_exact(data):
    if len(data) < 16 or data[:4] != b'SD0\x00':
        raise ValueError("Invalid SD0 header")
        
    comp_size, uncomp_size = struct.unpack("<II", data[4:12])
    print(f"SD0 Header: comp={comp_size}, uncomp={uncomp_size}")
    
    # Bit stream starts at data + 12
    reader = BitReader(data[12:])
    
    fill_byte = reader.read_bits(8)
    bit_count_a = reader.read_bits(8) # 0($sp)
    bit_count_b = reader.read_bits(8) # 4($sp)
    bit_count_c = reader.read_bits(8) # 8($sp)
    num_runs = reader.read_bits(16)   # $s7
    
    print(f"fill_byte=0x{fill_byte:02x}, bits_a={bit_count_a}, bits_b={bit_count_b}, bits_c={bit_count_c}, num_runs={num_runs}")
    
    out = bytearray([fill_byte] * uncomp_size)
    curr_offset = 0
    
    for r in range(num_runs):
        delta = reader.read_bits(bit_count_a)
        curr_offset += delta
        stride = reader.read_bits(bit_count_b) + 1
        count = reader.read_bits(bit_count_c) + 1
        val = reader.read_bits(8)
        
        pos = curr_offset
        for _ in range(count):
            if pos < uncomp_size:
                out[pos] = val
            pos += stride
            
    # Phase 2: replace all remaining fill_bytes
    for i in range(uncomp_size):
        if out[i] == fill_byte:
            out[i] = reader.read_bits(8)
            
    return bytes(out)

with open("extracted/AFSLIST0.AFS", "rb") as f:
    f.seek(0x00388800)
    raw = f.read(37420)

dec = decompress_sd0_exact(raw)
with open("extractor/glbdata_exact.bin", "wb") as f_out:
    f_out.write(dec)

import re
strings = re.findall(b"[\x20-\x7E]{4,}", dec)
print(f"Strings found in exact glbdata: {len(strings)}")
for s in strings[:50]:
    print("  ->", s.decode('ascii'))
