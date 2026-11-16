"""Synthesised soundtrack: a jaunty little tune that stops dead at the empty seat."""
import sys
import wave
import numpy as np

SR = 44100
DUR = 42.5
N = int(SR * DUR)
rng = np.random.default_rng(1)
mix = np.zeros(N, np.float32)


def hz(semi):  # semitones from A4
    return 440.0 * 2 ** (semi / 12.0)


def add(sig, t0, gain=1.0):
    i0 = int(t0 * SR)
    if i0 >= N:
        return
    sig = sig[: N - i0]
    mix[i0:i0 + len(sig)] += gain * sig


def pluck(f, dur, bright=0.5):
    n = int(SR * dur)
    p = max(2, int(SR / f))
    buf = rng.uniform(-1, 1, p).astype(np.float32)
    out = np.zeros(n, np.float32)
    for i in range(n):
        out[i] = buf[i % p]
        buf[i % p] = 0.5 * (buf[i % p] + buf[(i + 1) % p]) * (0.996 - 0.004 * (1 - bright))
    return out


def pluck_fast(f, dur, decay=4.0):
    t = np.arange(int(SR * dur)) / SR
    env = np.exp(-decay * t) * (1 - np.exp(-t * 400))
    s = (np.sin(2 * np.pi * f * t) + 0.5 * np.sin(4 * np.pi * f * t) * np.exp(-t * 6)
         + 0.25 * np.sin(6 * np.pi * f * t) * np.exp(-t * 10))
    return (s * env).astype(np.float32)


def reed(f, dur, vib=5.5):
    t = np.arange(int(SR * dur)) / SR
    ph = 2 * np.pi * f * t + 0.004 * f / vib * np.sin(2 * np.pi * vib * t) * (t > 0.12)
    s = np.sin(ph) + 0.45 * np.sin(3 * ph) + 0.2 * np.sin(5 * ph) + 0.12 * np.sin(2 * ph)
    env = np.minimum(1, t / 0.03) * np.minimum(1, (dur - t) / 0.06).clip(0)
    return (s * env * 0.5).astype(np.float32)


def glock(f, dur=1.2):
    t = np.arange(int(SR * dur)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.3 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 8)
    return (s * np.exp(-t * 3.5) * (1 - np.exp(-t * 800))).astype(np.float32)


def bass(f, dur):
    t = np.arange(int(SR * dur)) / SR
    s = np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t)
    return (s * np.exp(-t * 5) * (1 - np.exp(-t * 300))).astype(np.float32)


def noise_burst(dur, lp=0.9):
    n = int(SR * dur)
    x = rng.normal(0, 1, n).astype(np.float32)
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(n):
        acc = lp * acc + (1 - lp) * x[i]
        y[i] = acc
    return y


# note names relative to A4
NOTE = {"C": -9, "D": -7, "E": -5, "F": -4, "G": -2, "A": 0, "B": 2}


def n(name, octv=5):
    return NOTE[name] + 12 * (octv - 4)


BPM = 126
B = 60.0 / BPM
mel = [("E", 5, .5), ("G", 5, .5), ("C", 6, .5), ("G", 5, .5), ("A", 5, .5), ("G", 5, .5), ("E", 5, .5), ("C", 5, .5),
       ("D", 5, .5), ("F", 5, .5), ("A", 5, .5), ("F", 5, .5), ("G", 5, 1.5), (None, 0, .5),
       ("E", 5, .5), ("G", 5, .5), ("C", 6, .5), ("G", 5, .5), ("A", 5, .5), ("G", 5, .5), ("E", 5, .5), ("G", 5, .5),
       ("F", 5, .5), ("E", 5, .5), ("D", 5, .5), ("B", 4, .5), ("C", 5, 1.5), (None, 0, .5),
       ("C", 6, .5), ("B", 5, .5), ("A", 5, .5), ("G", 5, .5), ("F", 5, 1.0), ("A", 5, 1.0),
       ("G", 5, .5), ("F", 5, .5), ("E", 5, .5), ("D", 5, .5), ("E", 5, 1.0), ("G", 5, 1.0),
       ("A", 5, .5), ("G", 5, .5), ("F", 5, .5), ("E", 5, .5), ("D", 5, .5), ("E", 5, .5), ("F", 5, .5), ("D", 5, .5),
       ("C", 5, .5), ("E", 5, .5), ("G", 5, .5), ("E", 5, .5), ("C", 5, 1.0), (None, 0, 1.0)]
chords = ["C", "C", "Dm", "G", "C", "C", "G7", "C", "F", "C", "F", "C", "F", "C", "G7", "C"]
CH = {"C": (n("C", 3), [n("E", 4), n("G", 4), n("C", 5)]),
      "Dm": (n("D", 3), [n("F", 4), n("A", 4), n("D", 5)]),
      "G": (n("G", 2), [n("D", 4), n("G", 4), n("B", 4)]),
      "G7": (n("G", 2), [n("D", 4), n("F", 4), n("B", 4)]),
      "F": (n("F", 2), [n("F", 4), n("A", 4), n("C", 5)])}

STOP = 35.75
START = 1.0
# intro glockenspiel run
for k, nm in enumerate(["C", "E", "G", "C"]):
    add(glock(hz(n(nm, 6 if k < 3 else 7))), 0.2 + k * B * 0.5, 0.35)

loop_len = sum(d for *_, d in mel) * B
rep = 0
t0 = START
while t0 < STOP:
    t = t0
    for (nm, o, d) in mel:
        if nm is not None and t < STOP:
            f = hz(n(nm, o + (1 if rep == 2 else 0)))
            dur = min(d * B * 1.1, STOP - t)
            add(reed(f, dur), t, 0.16 if rep != 1 else 0.10)
            add(pluck_fast(f * 2, min(0.6, dur + 0.3), 7), t, 0.10 if rep >= 1 else 0.05)
        t += d * B
    for bi, ch in enumerate(chords):
        bt = t0 + bi * 4 * B
        root, tri = CH[ch]
        for beat in range(4):
            tt = bt + beat * B
            if tt >= STOP:
                break
            if beat % 2 == 0:
                add(bass(hz(root + (7 if beat == 2 else 0)), B * 0.9), tt, 0.32)
            else:
                for nn in tri:
                    add(pluck_fast(hz(nn), B * 0.7, 9), tt, 0.06)
            # soft brush/shaker
            add(noise_burst(0.05, 0.4) * np.exp(-np.arange(int(SR * 0.05)) / (SR * 0.012)), tt + B * 0.5, 0.05)
    t0 += loop_len
    rep += 1

# camera "whoosh" glides between seats in the close-up, tiny wooden tick on each arrival
for i in range(1, 10):
    add(glock(hz(n("G", 6)), 0.5), 15.0 + 2.0 * i, 0.08)

# hard stop: a single surprised plink
mix[int(STOP * SR):] = 0
add(glock(hz(n("C", 7)), 1.5), STOP, 0.25)

# silence with wind + tumbleweed rustle
wt = np.arange(int(SR * 6.0)) / SR
wind = noise_burst(6.0, 0.985)
wind = wind / (np.abs(wind).max() + 1e-6)
wind *= (0.5 + 0.5 * np.sin(2 * np.pi * 0.35 * wt)) * np.minimum(1, wt / 1.0) * np.minimum(1, (6.0 - wt) / 1.0)
add(wind.astype(np.float32), 36.2, 0.22)
rust = rng.normal(0, 1, int(SR * 3.6)).astype(np.float32)
rt = np.arange(len(rust)) / SR
rust *= (0.4 + 0.6 * np.abs(np.sin(rt * np.pi * 3.2))) * np.sin(np.pi * rt / 3.6)
rust = np.diff(rust, prepend=0)
add(rust, 36.6, 0.05)
# cricket
for k in range(4):
    for j in range(3):
        tt = 38.6 + k * 0.45 + j * 0.05
        ct = np.arange(int(SR * 0.035)) / SR
        add((np.sin(2 * np.pi * 4300 * ct) * np.sin(np.pi * ct / 0.035)).astype(np.float32), tt, 0.06)
# final low "bwomp" as the iris closes
bt = np.arange(int(SR * 1.0)) / SR
fb = 110 * (1 - 0.25 * bt)
ph = 2 * np.pi * np.cumsum(fb) / SR
bw = (np.sin(ph) + 0.5 * np.sin(2 * ph) + 0.3 * np.sin(3 * ph)) * np.exp(-bt * 3) * np.minimum(1, bt / 0.02)
add(bw.astype(np.float32), 41.2, 0.35)

# tape: wow/flutter, gentle low-pass, hiss
t = np.arange(N) / SR
warp = t + 0.0018 * np.sin(2 * np.pi * 0.55 * t) + 0.0003 * np.sin(2 * np.pi * 7 * t)
mix = np.interp(warp * SR, np.arange(N), mix).astype(np.float32)
k = np.ones(5, np.float32) / 5
mix = np.convolve(mix, k, mode="same")
mix += rng.normal(0, 0.004, N).astype(np.float32)
mix = np.tanh(mix * 1.3) / 1.3
mix /= np.abs(mix).max() / 0.85
fade = np.minimum(1, (DUR - t) / 0.4)
mix *= fade.astype(np.float32)

out = sys.argv[1] if len(sys.argv) > 1 else "out/audio.wav"
pcm = (mix * 32767).astype(np.int16)
st = np.stack([pcm, pcm], axis=1)
with wave.open(out, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(st.tobytes())
print("wrote", out)
