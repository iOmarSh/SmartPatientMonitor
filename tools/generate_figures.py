#!/usr/bin/env python3
import sys
from pathlib import Path
import pandas as pd
import matplotlib.pyplot as plt

if len(sys.argv) < 2:
    print('Usage: generate_figures.py <telemetry.csv>')
    sys.exit(2)

csvf = Path(sys.argv[1])
df = pd.read_csv(csvf)
if 'line' not in df.columns:
    df['line'] = df.index
outdir = csvf.parent / 'figures'
outdir.mkdir(exist_ok=True)

# Figure 2: System CPU time-series
cpu = df[df['kind']=='system_cpu'].copy()
if not cpu.empty:
    plt.figure(figsize=(8,3))
    plt.plot(cpu['line'], cpu['system_cpu'], marker='o', linestyle='-')
    plt.xlabel('Log line')
    plt.ylabel('System CPU %')
    plt.title('Figure 2 — System CPU over time')
    plt.grid(alpha=0.3)
    plt.tight_layout()
    plt.savefig(outdir / 'fig2_cpu.png')
    print('Wrote fig2_cpu.png')
else:
    print('No system_cpu rows found — Figure 2 skipped')

# Figure 3: Heap trend
heap = df[df['kind']=='heap']
if not heap.empty:
    plt.figure(figsize=(8,2))
    plt.plot(heap['line'], heap['heap_free'], color='tab:orange')
    plt.xlabel('Log line'); plt.ylabel('Heap free (bytes)')
    plt.title('Figure 3 — Heap free over time')
    plt.tight_layout(); plt.savefig(outdir / 'fig3_heap.png')
    print('Wrote fig3_heap.png')
else:
    print('No heap rows — Figure 3 skipped')

# Figure 4: Per-task CPU% lines
tasks = df[df['kind']=='task']
if not tasks.empty:
    plt.figure(figsize=(10,4))
    for t, g in tasks.groupby('task'):
        try:
            vals = g['task_cpu'].astype(float)
            plt.plot(g['line'], vals, marker='.', linestyle='-', label=t)
        except Exception:
            continue
    plt.xlabel('Log line'); plt.ylabel('Task CPU %'); plt.legend(loc='upper right', fontsize='small')
    plt.title('Figure 4 — Per-task CPU%')
    plt.tight_layout(); plt.savefig(outdir / 'fig4_tasks_cpu.png')
    print('Wrote fig4_tasks_cpu.png')
else:
    print('No task rows — Figure 4 skipped')

# Figure 5: WCET scatter
if not tasks.empty:
    plt.figure(figsize=(8,3))
    for t, g in tasks.groupby('task'):
        try:
            wc = pd.to_numeric(g['wcet_us'], errors='coerce')
            plt.scatter(g['line'], wc, s=8, label=t)
        except Exception:
            continue
    plt.xlabel('Log line'); plt.ylabel('WCET (us)'); plt.title('Figure 5 — WCET scatter per task')
    plt.tight_layout(); plt.savefig(outdir / 'fig5_wcet.png')
    print('Wrote fig5_wcet.png')

# Figure 6: Jitter histogram (approx from window_us)
if not tasks.empty:
    plt.figure(figsize=(8,3))
    for t, g in tasks.groupby('task'):
        try:
            w = pd.to_numeric(g['window_us'], errors='coerce').dropna()
            if w.size>0:
                plt.hist(w, bins=30, alpha=0.5, label=t)
        except Exception:
            continue
    plt.xlabel('window_us'); plt.ylabel('count'); plt.title('Figure 6 — Jitter histogram (window_us)')
    plt.legend(fontsize='small')
    plt.tight_layout(); plt.savefig(outdir / 'fig6_jitter.png')
    print('Wrote fig6_jitter.png')

print('Done')
