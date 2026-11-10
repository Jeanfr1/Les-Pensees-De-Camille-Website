#!/usr/bin/env python3
"""Verify released kit file hashes; standard library only."""
from pathlib import Path
import hashlib, sys
root = Path(__file__).resolve().parents[1]
manifest = root / 'MANIFEST.sha256'
if not manifest.is_file():
    sys.exit('MANIFEST.sha256 não encontrado')
errors = []
count = 0
for line in manifest.read_text().splitlines():
    expected, name = line.split('  ', 1)
    path = root / name
    if not path.is_file() or hashlib.sha256(path.read_bytes()).hexdigest() != expected:
        errors.append(name)
    count += 1
if errors:
    sys.exit('Divergências: ' + ', '.join(errors))
print(f'PASS — {count} arquivos correspondem ao manifesto.')
