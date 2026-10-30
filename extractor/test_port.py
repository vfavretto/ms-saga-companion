import socket

ports_to_test = [28011, 28012, 28013, 28010, 8080]
for port in ports_to_test:
    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    s.settimeout(0.5)
    code = s.connect_ex(('127.0.0.1', port))
    s.close()
    if code == 0:
        print(f"Port {port} is OPEN! Found PINE server!")
    else:
        print(f"Port {port} closed ({code})")
