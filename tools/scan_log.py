#!/usr/bin/env python3
import sys
from pathlib import Path
import re

if len(sys.argv)<2:
    print('Usage: scan_log.py <logfile>')
    sys.exit(1)

p=Path(sys.argv[1])
raw=p.read_bytes()
for enc in ('utf-8','utf-16','utf-16-le','latin-1'):
    try:
        s=raw.decode(enc)
        # simple heuristic
        if '\\x00' in raw[:200] and enc.startswith('utf-8'):
            continue
        break
    except Exception:
        s=None
if s is None:
    s=raw.decode('latin-1',errors='replace')

kw = ['SYSTEM','TELEMETRY','CPU','Heap','WCET','cycles','Stack HWM','State','STATE','EMERGENCY']
lines=s.splitlines()
for i,l in enumerate(lines):
    for k in kw:
        if k.lower() in l.lower():
            print(i, l)
            break

print('\n---sample block around first match---\n')
# print block around first match
for i,l in enumerate(lines[:1000]):
    if 'system' in l.lower() or 'telemetry' in l.lower():
        start=max(0,i-5); end=min(len(lines), i+20)
        for j in range(start,end): print(j, lines[j])
        break
