#!/usr/bin/env python3
import sys, re, csv
from pathlib import Path

if len(sys.argv) < 2:
    print('Usage: parse_telemetry.py <telemetry.log>')
    sys.exit(2)

infile = Path(sys.argv[1])
outfile = infile.with_suffix('.csv')

# read with encoding detection (try utf-8, then utf-16-le)
raw = infile.read_bytes()
text = None
for enc in ('utf-8', 'utf-16', 'utf-16-le', 'latin-1'):
    try:
        text = raw.decode(enc)
        # Heuristic: if NULs present, skip
        if '\x00' in raw[:200] and enc.startswith('utf-8'):
            raise UnicodeDecodeError(enc, b'', 0, 1, 'nul')
        break
    except Exception:
        text = None

if text is None:
    text = raw.decode('latin-1', errors='replace')

lines = text.splitlines()

cpu_re = re.compile(r'System\s+CPU[^\d]*([0-9]+(?:\.[0-9]+)?)%')
heap_re = re.compile(r'Heap[^\d]*([0-9]+)')
# task lines: capture name and numbers (loose)
task_re = re.compile(r"^\s*([A-Za-z0-9_\- ]{1,24}):.*?([0-9]+(?:\.[0-9]+)?)%.*?window[_ ]?us=?(\d+).*?wcet[_ ]?us=?(\d+).*?avg=?(\d+(?:\.\d+)?).*?cycles=?(\d+)", re.I)
# fallback task line patterns
fallback_task_re = re.compile(r"^\s*([A-Za-z0-9_\- ]{1,24})\s+CPU.*?([0-9]+(?:\.[0-9]+)?)%.*?wcet[_ ]?us=?(\d+).*?avg=?(\d+(?:\.\d+)?).*?cycles=?(\d+)", re.I)

rows = []
for idx, l in enumerate(lines):
    m = cpu_re.search(l)
    if m:
        rows.append({'line': idx, 'kind':'system_cpu','system_cpu':float(m.group(1))})
        continue
    mh = heap_re.search(l)
    if mh and 'Heap' in l:
        rows.append({'line': idx, 'kind':'heap','heap_free':int(mh.group(1))})
        continue
    mt = task_re.match(l)
    if mt:
        name = mt.group(1).strip()
        rows.append({'line': idx, 'kind':'task','task':name,'task_cpu':float(mt.group(2)),'window_us':int(mt.group(3)),'wcet_us':int(mt.group(4)),'avg_us':float(mt.group(5)),'cycles':int(mt.group(6))})
        continue
    mf = fallback_task_re.match(l)
    if mf:
        name = mf.group(1).strip()
        rows.append({'line': idx, 'kind':'task','task':name,'task_cpu':float(mf.group(2)),'window_us':'','wcet_us':int(mf.group(3)),'avg_us':float(mf.group(4)),'cycles':int(mf.group(5))})
        continue

# write CSV
fieldnames = ['line','kind','system_cpu','heap_free','task','task_cpu','window_us','wcet_us','avg_us','cycles']
with open(outfile, 'w', newline='') as f:
    w = csv.DictWriter(f, fieldnames=fieldnames)
    w.writeheader()
    for r in rows:
        row = {k:'' for k in fieldnames}
        row.update(r)
        w.writerow(row)

print('Wrote', outfile)
