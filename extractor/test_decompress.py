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
            # Need bits from next word
            part1_bits = self.bits_left
            val1 = self.current_word & ((1 << part1_bits) - 1)
            n_remain = n - part1_bits
            self.refill()
            if self.bits_left < n_remain:
                # Truncated?
                return 0
            self.bits_left -= n_remain
            val2 = (self.current_word >> self.bits_left) & ((1 << n_remain) - 1)
            return (val1 << n_remain) | val2

def decompress_sd0(data):
    if len(data) < 16:
        raise ValueError("Data too small for SD0 header")
    magic = data[:4]
    if magic != b'SD0\x00':
        raise ValueError(f"Invalid magic: {magic}")
        
    comp_size, uncomp_size = struct.unpack("<II", data[4:12])
    print(f"SD0 Header: comp_size={comp_size}, uncomp_size={uncomp_size}")
    
    reader = BitReader(data[12:])
    fill_byte = reader.read_bits(8)
    bit_count_a = reader.read_bits(8)
    bit_count_b = reader.read_bits(8)
    num_runs = reader.read_bits(16)
    
    print(f"fill_byte=0x{fill_byte:02x}, bits_a={bit_count_a}, bits_b={bit_count_b}, num_runs={num_runs}")
    
    out = bytearray([fill_byte] * uncomp_size)
    curr_offset = 0
    
    for r in range(num_runs):
        delta = reader.read_bits(bit_count_a)
        curr_offset += delta
        run_len = reader.read_bits(bit_count_b) + 1
        val = reader.read_bits(8)
        for i in range(run_len):
            if curr_offset + i < uncomp_size:
                out[curr_offset + i] = val
        curr_offset += run_len
        
    for i in range(uncomp_size):
        if out[i] == fill_byte:
            out[i] = reader.read_bits(8)
            
    return bytes(out)

with open("extracted/AFSLIST0.AFS", "rb") as f:
    # Test dllfsize.cmp (file 11, offset 0x00346000, size 60)
    f.seek(0x00346000)
    raw = f.read(60)
    
dec = decompress_sd0(raw)
print(f"Decompressed dllfsize: {len(dec)} bytes")
print("Hex dump:")
print(dec.hex())
print("Integers in dllfsize (uncompressed sizes of DLLs 0..11):")
for i in range(0, len(dec), 4):
    sz = struct.unpack("<I", dec[i:i+4])[0]
    print(f"  DLL[{i//4:02d}]: {sz:8d} bytes (0x{sz:08X})")
