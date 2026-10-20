# Gemensamma sökvägar för testerna: spelet byggs till ../dist/TURBO-RACE.html, skärmdumpar hamnar i tests/shots/
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
URL = 'file://' + os.path.join(ROOT, 'dist', 'TURBO-RACE.html')
SHOTS = os.path.join(HERE, 'shots'); os.makedirs(SHOTS, exist_ok=True)
TMP = os.path.join(HERE, 'shots', 'tmp'); os.makedirs(TMP, exist_ok=True)
