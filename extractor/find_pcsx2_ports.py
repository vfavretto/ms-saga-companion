import subprocess, re, glob

tl = subprocess.check_output("tasklist /FO CSV /NH", shell=True).decode("cp1252", "ignore")
pids = {}
for line in tl.splitlines():
    parts = [p.strip('"') for p in line.split('","')]
    if len(parts) > 1 and "pcsx" in parts[0].lower():
        pids[parts[1]] = parts[0]
print("PCSX2 processes:", pids)

ns = subprocess.check_output("netstat -ano -p TCP", shell=True).decode("cp1252", "ignore")
for line in ns.splitlines():
    cols = line.split()
    if cols and cols[-1] in pids:
        print("  ", line.strip())

pipes = [p for p in glob.glob(r"\\.\pipe\*") if any(k in p.lower() for k in ("pcsx", "pine", "ipc"))]
print("Pipes:", pipes)
