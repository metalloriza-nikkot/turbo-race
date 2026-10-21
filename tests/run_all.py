"""Kör regressionstesterna mot dist/TURBO-RACE.html (bygg först: python3 build.py).
Varje test skriver ut vad det mätte och avslutar med 'no errors' om inga JavaScript-fel inträffade.
Användning: python3 tests/run_all.py [namn ...]"""
import os, subprocess, sys, time
HERE = os.path.dirname(os.path.abspath(__file__))
TESTS = ['test_races', 'test_tvshow', 'test_school', 'test_city', 'test_reading', 'test_math', 'test_saveload', 'test_superturbo', 'test_hunt_route', 'test_soundstrip', 'test_supermeter', 'test_aisuper', 'test_builder', 'test_laps']
pick = sys.argv[1:] or TESTS
bad = []
for t in pick:
    t0 = time.time()
    try:
        r = subprocess.run([sys.executable, os.path.join(HERE, t + '.py')], capture_output=True, text=True, timeout=420)
    except subprocess.TimeoutExpired:
        bad.append(t); print(f'✗ {t}: tog för lång tid'); continue
    out = (r.stdout + r.stderr).strip().splitlines()
    ok = r.returncode == 0 and not any(('Error' in l or 'Traceback' in l) and 'no errors' not in l for l in out)
    print(f"{'✓' if ok else '✗'} {t} ({time.time() - t0:.0f} s): {out[-1] if out else ''}")
    if not ok:
        bad.append(t); print('   ' + '\n   '.join(out[-8:]))
print('\nALLA TESTER OK' if not bad else f'\nMISSLYCKADES: {", ".join(bad)}')
sys.exit(1 if bad else 0)
