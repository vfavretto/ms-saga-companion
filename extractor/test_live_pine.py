import socket
import struct

HOST = "127.0.0.1"
PORT = 28011

print(f"Connecting to PCSX2 PINE at {HOST}:{PORT}...")
try:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(2.0)
    s.connect((HOST, PORT))
    print("Connected successfully!")
    
    # Test Read32 (opcode 2) at 0x01FDD000 (Gold)
    # Packet: [opcode (1 byte), address (4 bytes LE)]
    req = struct.pack("<BI", 2, 0x01FDD000)
    s.sendall(req)
    
    res = s.recv(4)
    print(f"Raw response ({len(res)} bytes): {res.hex()}")
    if len(res) == 4:
        gold = struct.unpack("<I", res)[0]
        print(f"Read Gold (0x01FDD000): {gold} Credits")
        
    # Test Read8 (opcode 0) at 0x01FFF5AE (GameMode)
    req = struct.pack("<BI", 0, 0x01FFF5AE)
    s.sendall(req)
    res = s.recv(1)
    if len(res) == 1:
        mode = res[0]
        print(f"Read GameMode (0x01FFF5AE): {mode}")
        
    # Test Read16 (opcode 1) at 0x01FFF5B0 (Map ID)
    req = struct.pack("<BI", 1, 0x01FFF5B0)
    s.sendall(req)
    res = s.recv(2)
    if len(res) == 2:
        map_id = struct.unpack("<H", res)[0]
        print(f"Read Map ID (0x01FFF5B0): {map_id}")

    # Test Read16 (opcode 1) at 0x01FDDB94 (Slot 1 HP)
    req = struct.pack("<BI", 1, 0x01FDDB94)
    s.sendall(req)
    res = s.recv(2)
    if len(res) == 2:
        hp1 = struct.unpack("<H", res)[0]
        print(f"Read Slot 1 HP (0x01FDDB94): {hp1}")

    s.close()
except Exception as e:
    print(f"Error connecting/reading: {e}")
