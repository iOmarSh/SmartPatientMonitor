from pathlib import Path
p=Path('telemetry_run1.log')
out=Path('telemetry_run1.decoded.txt')
raw=p.read_bytes()
for enc in ('utf-8','utf-16','utf-16-le','utf-16-be','latin-1'):
    try:
        text=raw.decode(enc)
        # quick heuristic: must contain bracketed tags like [Processing]
        if '[Processing]' in text or '[SensorQueue]' in text or 'System' in text:
            print('decoded with',enc)
            out.write_text(text, encoding='utf-8')
            break
    except Exception:
        continue
else:
    # fallback
    out.write_text(raw.decode('latin-1',errors='replace'),encoding='utf-8')
    print('decoded fallback latin-1')
print('wrote',out)
