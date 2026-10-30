"""PINE probe with correct framing.
Request : [u32 total_size][u8 opcode][u32 addr] ... (batched)
Reply   : [u32 total_size][u8 result (0=OK, 0xFF=FAIL)][data...]
"""
import socket
import struct
import sys

HOST, PORT = "127.0.0.1", 28011
OP_READ8, OP_READ16, OP_READ32, OP_READ64 = 0, 1, 2, 3
OP_VERSION, OP_TITLE, OP_ID, OP_STATUS = 8, 0x0B, 0x0C, 0x0F


def recv_exact(s, n):
    buf = b""
    while len(buf) < n:
        chunk = s.recv(n - len(buf))
        if not chunk:
            raise ConnectionError("socket closed")
        buf += chunk
    return buf


def transact(s, body):
    s.sendall(struct.pack("<I", len(body) + 4) + body)
    size = struct.unpack("<I", recv_exact(s, 4))[0]
    rest = recv_exact(s, size - 4)
    return rest[0], rest[1:]


def read_block(s, start, length, batch=4000):
    out = bytearray()
    addr = start
    end = start + length
    while addr < end:
        n = min(batch, (end - addr) // 8)
        body = b"".join(struct.pack("<BI", OP_READ64, addr + i * 8) for i in range(n))
        res, data = transact(s, body)
        if res != 0:
            raise RuntimeError(f"read fail at 0x{addr:08X}")
        out += data
        addr += n * 8
    return bytes(out)


def string_reply(data):
    ln = struct.unpack("<I", data[:4])[0]
    return data[4:4 + ln].rstrip(b"\x00").decode("utf-8", "ignore")


s = socket.create_connection((HOST, PORT), timeout=3)
print("Connected.")

res, data = transact(s, bytes([OP_VERSION]))
print("Version:", res, string_reply(data) if res == 0 else data)
res, data = transact(s, bytes([OP_TITLE]))
print("Title:", res, string_reply(data) if res == 0 else data)
res, data = transact(s, bytes([OP_ID]))
print("GameID:", res, string_reply(data) if res == 0 else data)

# Current offsets used by the companion
for name, op, addr, fmt in [
    ("gold@01FDD000", OP_READ32, 0x01FDD000, "<I"),
    ("mode@01FFF5AE", OP_READ8, 0x01FFF5AE, "<B"),
    ("map@01FFF5B0", OP_READ16, 0x01FFF5B0, "<H"),
    ("pt_h@01FFF460", OP_READ8, 0x01FFF460, "<B"),
    ("pt_m@01FFF461", OP_READ8, 0x01FFF461, "<B"),
    ("hp1@01FDDB94", OP_READ16, 0x01FDDB94, "<H"),
]:
    res, data = transact(s, struct.pack("<BI", op, addr))
    print(f"  {name}: res={res} val={struct.unpack(fmt, data)[0] if res == 0 else '-'}")

# Dump full 32MB? too slow -> dump EE RAM upper region + full scan option
region = sys.argv[1] if len(sys.argv) > 1 else "high"
if region == "full":
    start, length = 0x00100000, 0x01F00000
else:
    start, length = 0x01FD0000, 0x00030000
print(f"Dumping 0x{start:08X}..0x{start+length:08X} ...")
dump = read_block(s, start, length)
fname = f"extractor/ram_{region}.bin"
open(fname, "wb").write(dump)
print("Saved", fname, len(dump))
s.close()
