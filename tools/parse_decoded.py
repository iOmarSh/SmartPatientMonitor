#!/usr/bin/env python3
import re
from pathlib import Path
p = Path('telemetry_run1.decoded.txt')
text = p.read_text(encoding='utf-8')
blocks = text.split('=== SYSTEM TELEMETRY ===')
rows = []
for b in blocks[1:]:
    # consider only until next blank line of '=' maybe
    # extract window
    m_win = re.search(r'Report Window:\s*(\d+)\s*ms', b)
    m_cpu = re.search(r'System CPU Utilization:\s*([0-9.]+)%', b)
    m_heap = re.search(r'Heap Free:\s*([0-9]+) bytes', b)
    if m_cpu:
        rows.append({'kind':'system_cpu','system_cpu':float(m_cpu.group(1))})
    if m_heap:
        rows.append({'kind':'heap','heap_free':int(m_heap.group(1))})
    # per-task lines
    for line in b.splitlines():
        mt = re.match(r"\s*([A-Za-z]+)\s*\|\s*CPU:\s*([0-9.]+)%\s*\|\s*Window:\s*([0-9]+)\s*us\s*\|\s*Avg:\s*([0-9.]+)\s*us\s*\|\s*WCET:\s*([0-9]+)\s*us\s*\|\s*Cycles:\s*([0-9]+)", line)
        if mt:
            name = mt.group(1)
            rows.append({'kind':'task','task':name,'task_cpu':float(mt.group(2)),'window_us':int(mt.group(3)),'avg_us':float(mt.group(4)),'wcet_us':int(mt.group(5)),'cycles':int(mt.group(6))})

# write CSV
import csv
out = Path('telemetry_run1_parsed.csv')
fieldnames = ['kind','system_cpu','heap_free','task','task_cpu','window_us','avg_us','wcet_us','cycles']
with out.open('w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    for r in rows:
        row = {k:'' for k in fieldnames}
        row.update(r)
        w.writerow(row)
print('Wrote', out)
