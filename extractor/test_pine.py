import os

pipe_name = r'\\.\pipe\pcsx2-ipc'

if os.path.exists(pipe_name):
    print(f"PINE Named Pipe found: {pipe_name}")
else:
    print(f"PINE Named Pipe '{pipe_name}' is not currently active (PCSX2 with PINE IPC is closed).")
