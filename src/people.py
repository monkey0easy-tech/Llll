"""Caricature students: heads, hair, clothes, poses."""
import math
from ink import (G, INK, shape, stroke, tube, ell, oval, dot, poly, clip_to,
                 lerp, mix, darker, ctx, path)

SKIN = (0.98, 0.83, 0.69)
SKIN2 = (0.96, 0.78, 0.64)
CHEEK = (0.95, 0.50, 0.47)
FRECK = (0.72, 0.45, 0.30)
WHITE = (0.98, 0.97, 0.92)
MOUTH = (0.55, 0.16, 0.16)
TONGUE = (0.93, 0.48, 0.48)
LW = 5.0


# --------------------------------------------------------------- face parts
def eye(x, y, R, style="open", look=(0, 0), lid=0.0, big=1.0):
    ex, ey = 0.19 * R * big, 0.25 * R * big
    if style == "closed":       # sleeping: soft downward arc
        stroke([(x - ex, y), (x, y + ey * 0.45), (x + ex, y)], 4.5)
        stroke([(x - ex * 0.9, y + 2), (x - ex * 1.2, y + 8)], 3)
        return
    if style == "happy":        # laughing ^ ^
        stroke([(x - ex, y + ey * 0.3), (x, y - ey * 0.55), (x + ex, y + ey * 0.3)], 5)
        return
    if style == "squint":
        shape([(x - ex * 1.1, y), (x, y - ey * 0.35), (x + ex * 1.1, y),
               (x, y + ey * 0.3)], WHITE, 4)
        dot(x + look[0] * ex * 0.5, y + 0.5, ex * 0.42)
        stroke([(x - ex * 1.25, y - ey * 0.15), (x, y - ey * 0.6),
                (x + ex * 1.25, y - ey * 0.2)], 5)
        return
    oval(x, y, ex, ey, WHITE, 4.2, n=10)
    px, py = x + look[0] * ex * 0.45, y + look[1] * ey * 0.45
    dot(px, py, ex * 0.5)
    dot(px + ex * 0.2, py - ey * 0.22, ex * 0.15, WHITE)
    if lid > 0.02:
        c = ctx()
        c.save()
        path(ell(x, y, ex, ey, n=10), jit=0)
        c.clip()
        top = y - ey - 2
        ly = y - ey + 2 * ey * lid
        shape([(x - ex - 4, top - 4), (x + ex + 4, top - 4), (x + ex + 4, ly),
               (x, ly + ey * 0.12), (x - ex - 4, ly)], SKIN2, 0, ink=None)
        c.restore()
        stroke([(x - ex * 1.05, y - ey + 2 * ey * lid), (x, y - ey + 2 * ey * lid + ey * 0.14),
                (x + ex * 1.05, y - ey + 2 * ey * lid)], 4.5)


def mouth(R, kind, amt=1.0, wide=1.0, t=0.0):
    y = 0.50 * R
    w = 0.30 * R * wide
    if kind == "smile":
        stroke([(-w, y - 0.06 * R), (-w * 0.4, y + 0.08 * R), (w * 0.4, y + 0.08 * R),
                (w, y - 0.06 * R)], 5)
        stroke([(-w - 6, y - 0.12 * R), (-w + 2, y - 0.02 * R)], 3.5)
        stroke([(w + 6, y - 0.12 * R), (w - 2, y - 0.02 * R)], 3.5)
    elif kind == "smirk":
        stroke([(-w * 0.8, y + 0.03 * R), (0, y + 0.06 * R), (w * 0.7, y - 0.02 * R),
                (w * 1.05, y - 0.13 * R)], 5)
        stroke([(w * 1.1, y - 0.2 * R), (w * 0.95, y - 0.06 * R)], 3)
    elif kind == "crooked":
        stroke([(-w, y - 0.02 * R), (-w * 0.2, y + 0.07 * R), (w * 0.5, y + 0.02 * R),
                (w * 0.95, y - 0.12 * R)], 5)
    elif kind in ("grin", "laugh", "talk", "o"):
        if kind == "o":
            oval(0, y + 0.04 * R, 0.09 * R * (0.6 + amt), 0.1 * R * (0.5 + amt), MOUTH, 4)
            return
        h = {"grin": 0.24, "laugh": 0.40, "talk": 0.30}[kind] * R * amt
        top = y - 0.05 * R
        pts = [(-w * 1.05, top), (-w * 0.5, top + 0.02 * R), (w * 0.5, top + 0.02 * R),
               (w * 1.05, top), (w * 0.75, top + h * 0.75), (0, top + h),
               (-w * 0.75, top + h * 0.75)]
        saved = shape(pts, MOUTH, 5)
        c = ctx()
        c.save()
        clip_to(saved)
        # teeth with a gap in the middle
        th = max(6, 0.11 * R)
        shape([(-w * 1.1, top - 6), (-0.045 * R, top - 6), (-0.045 * R, top + th),
               (-w * 1.1, top + th)], WHITE, 3, smooth=False)
        shape([(0.045 * R, top - 6), (w * 1.1, top - 6), (w * 1.1, top + th),
               (0.045 * R, top + th)], WHITE, 3, smooth=False)
        if h > 0.18 * R:
            oval(0, top + h * 0.95, w * 0.6, h * 0.35, TONGUE, 0, ink=None)
        c.restore()
        shape(pts, None, 5)
        for s in (-1, 1):
            stroke([(s * (w * 1.05 + 7), top - 7), (s * (w * 1.05 - 1), top + 3)], 3.5)
    elif kind == "line":
        stroke([(-w * 0.6, y), (w * 0.6, y + 2)], 5)
    elif kind == "sleep":
        oval(0, y + 0.02 * R, 0.08 * R, 0.06 * R, MOUTH, 3.5)


def brows(R, style="calm", raise_=0.0, tilt=0.0):
    y = -0.38 * R - raise_ * R
    for s in (-1, 1):
        x0, x1 = s * 0.2 * R, s * 0.52 * R
        if style == "calm":
            pts = [(x0, y + 2), (s * 0.36 * R, y - 0.06 * R), (x1, y + 0.02 * R)]
        elif style == "sly":
            lift = (0.1 * R if s > 0 else -0.02 * R)
            pts = [(x0, y + 0.06 * R), (s * 0.36 * R, y - lift), (x1, y - lift * 0.6)]
        elif style == "smug":
            pts = [(x0, y + 0.04 * R), (s * 0.36 * R, y - 0.1 * R), (x1, y - 0.06 * R)]
        elif style == "busy":
            pts = [(x0, y - 0.06 * R), (s * 0.36 * R, y - 0.02 * R), (x1, y + 0.06 * R)]
        elif style == "tired":
            pts = [(x0, y - 0.04 * R), (s * 0.36 * R, y), (x1, y + 0.08 * R)]
        else:
            pts = [(x0, y), (x1, y)]
        pts = [(px, py + s * tilt * R) for px, py in pts]
        stroke(pts, 6.5)


def glasses(R, kind, eye_y=-0.05):
    y = eye_y * R
    if kind == "clear":
        for s in (-1, 1):
            shape(ell(s * 0.37 * R, y, 0.27 * R, 0.25 * R, n=10), (0.85, 0.93, 0.98), 3.5,
                  alpha=0.35)
            shape(ell(s * 0.37 * R, y, 0.27 * R, 0.25 * R, n=10), None, 3.5)
            stroke([(s * 0.25 * R, y - 0.13 * R), (s * 0.18 * R, y - 0.02 * R)], 3, WHITE)
        stroke([(-0.1 * R, y - 0.03 * R), (0.1 * R, y - 0.03 * R)], 3.5)
    elif kind == "gold":
        gold = (0.85, 0.66, 0.25)
        for s in (-1, 1):
            shape(ell(s * 0.37 * R, y, 0.24 * R, 0.24 * R, n=12), None, 6.5)
            shape(ell(s * 0.37 * R, y, 0.24 * R, 0.24 * R, n=12), None, 3.2, ink=gold, jit=0)
        stroke([(-0.13 * R, y - 0.04 * R), (0.13 * R, y - 0.04 * R)], 3.5)
    elif kind == "black":
        for s in (-1, 1):
            cx = s * 0.37 * R
            poly([(cx - 0.27 * R, y - 0.2 * R), (cx + 0.27 * R, y - 0.2 * R),
                  (cx + 0.25 * R, y + 0.19 * R), (cx - 0.25 * R, y + 0.19 * R)],
                 (0.8, 0.9, 0.95), 0, alpha=0.25, ink=None)
            poly([(cx - 0.27 * R, y - 0.2 * R), (cx + 0.27 * R, y - 0.2 * R),
                  (cx + 0.25 * R, y + 0.19 * R), (cx - 0.25 * R, y + 0.19 * R)],
                 None, 8)
        stroke([(-0.12 * R, y - 0.1 * R), (0.12 * R, y - 0.1 * R)], 6)


# --------------------------------------------------------------- hair styles
def S(pts, R):
    return [(x * R, y * R) for x, y in pts]


def hair_back(p, R):
    st, col = p["hair"], p["hair_col"]
    if st == "spread":
        shape(S([(-2.3, 0.75), (-2.1, 0.1), (-1.6, -0.6), (-0.9, -1.15), (0, -1.3), (0.9, -1.15),
                 (1.6, -0.6), (2.2, 0.0), (2.5, 0.6), (1.8, 0.95), (1.0, 0.7), (-1.0, 0.75),
                 (-1.7, 1.0)], R), col, LW)
        for k in range(-3, 4):
            stroke(S([(k * 0.25, -1.0), (k * 0.55, -0.4), (k * 0.75, 0.6)], R), 2.5, (0.3, 0.25, 0.24))
    if st == "curtains":
        shape(S([(-1.12, -0.3), (-1.0, -0.95), (-0.4, -1.25), (0.4, -1.25), (1.0, -0.95),
                 (1.12, -0.3), (1.2, 0.8), (1.25, 1.75), (0.6, 1.85), (-0.6, 1.85),
                 (-1.25, 1.75), (-1.2, 0.8)], R), darker(col, 0.85), LW)
    elif st == "longdark":
        shape(S([(-1.1, -0.3), (-1.0, -0.95), (-0.4, -1.25), (0.4, -1.25), (1.0, -0.95),
                 (1.1, -0.3), (1.25, 1.0), (1.35, 2.3), (0.6, 2.45), (-0.6, 2.45),
                 (-1.35, 2.3), (-1.25, 1.0)], R), darker(col, 0.85), LW)
    elif st == "pigtails":
        for s in (-1, 1):
            shape(S([(s * 0.95, -0.2), (s * 1.45, 0.1), (s * 1.6, 0.8), (s * 1.35, 1.25),
                     (s * 1.15, 0.7), (s * 0.95, 0.25)], R), col, LW)
            shape(ell(s * 1.0 * R, -0.25 * R, 0.25 * R, 0.17 * R, rot=s * 0.6, n=8),
                  p.get("bow", (0.9, 0.3, 0.3)), 4)
    elif st == "ponytail":
        shape(S([(0.6, -0.9), (1.25, -0.7), (1.45, 0.0), (1.3, 0.9), (1.05, 1.1),
                 (1.1, 0.3), (0.85, -0.4)], R), col, LW)
    elif st == "bob":
        shape(S([(-1.12, -0.4), (-0.9, -1.05), (0, -1.25), (0.9, -1.05), (1.12, -0.4),
                 (1.2, 0.55), (0.9, 0.75), (-0.9, 0.75), (-1.2, 0.55)], R),
              darker(col, 0.85), LW)


def hair_front(p, R, t=0.0):
    st, col = p["hair"], p["hair_col"]
    if st == "slick":
        shape(S([(-1.0, -0.25), (-0.98, -0.75), (-0.6, -1.12), (0, -1.2), (0.6, -1.12),
                 (0.98, -0.75), (1.0, -0.25), (0.85, -0.55), (0.4, -0.78), (0, -0.82),
                 (-0.4, -0.78), (-0.85, -0.55)], R), col, LW)
        for x in (-0.4, 0, 0.4):
            stroke(S([(x * 1.2, -0.8), (x, -1.1)], R), 3, (0.35, 0.28, 0.24))
    elif st == "curtains":
        for s in (-1, 1):
            shape(S([(0, -1.18), (s * 0.55, -1.12), (s * 1.0, -0.7), (s * 1.12, 0.1),
                     (s * 1.18, 0.9), (s * 1.22, 1.75), (s * 0.95, 1.8), (s * 0.86, 1.0),
                     (s * 0.78, 0.2), (s * 0.62, -0.45), (s * 0.3, -0.78), (0, -0.85)], R),
                  col, LW)
            for k in (0.75, 0.95):
                stroke(S([(s * 0.5 * k, -0.95), (s * k, -0.2), (s * k * 1.08, 1.2)], R), 2.5,
                       darker(col, 0.75))
    elif st == "buzz":
        sv = shape(S([(-1.02, -0.2), (-0.95, -0.75), (-0.55, -1.1), (0, -1.15), (0.55, -1.1),
                      (0.95, -0.75), (1.02, -0.2), (0.88, -0.5), (0.5, -0.68), (0, -0.72),
                      (-0.5, -0.68), (-0.88, -0.5)], R), col, 4)
        c = ctx()
        c.save()
        clip_to(sv)
        rng = G["rng"]
        for i in range(40):
            a = -math.pi * (0.05 + 0.9 * (i * 0.6180339 % 1))
            r = R * (0.78 + 0.3 * ((i * 0.37) % 1))
            dot(r * math.cos(a), r * math.sin(a) - 0.05 * R, 2.2, (0.08, 0.06, 0.05))
        c.restore()
        for i in range(14):
            a = -math.pi * (0.1 + 0.8 * i / 13)
            x, y = 1.08 * R * math.cos(a), 1.08 * R * math.sin(a) - 0.05 * R
            stroke([(x, y), (x * 1.06, y * 1.06)], 2.5)
    elif st == "mop":
        bumps = [(-1.15, 0.25), (-1.2, -0.3), (-1.0, -0.85), (-0.5, -1.25), (0.05, -1.32),
                 (0.6, -1.22), (1.05, -0.85), (1.22, -0.3), (1.18, 0.3), (0.95, 0.15),
                 (0.75, -0.1), (0.5, -0.02), (0.25, -0.18), (0.0, -0.05), (-0.3, -0.2),
                 (-0.55, -0.04), (-0.8, -0.12), (-1.0, 0.2)]
        sw = math.sin(t * 2.0) * 0.03
        shape(S([(x + sw * (1 + y), y) for x, y in bumps], R), col, LW)
        for x in (-0.7, -0.3, 0.15, 0.6):
            stroke(S([(x, -0.9), (x + 0.08, -0.35)], R), 3, darker(col, 0.8))
    elif st == "bowl":
        shape(S([(-1.12, 0.05), (-1.08, -0.65), (-0.65, -1.15), (0, -1.25), (0.65, -1.15),
                 (1.08, -0.65), (1.12, 0.05), (0.98, -0.28), (0.4, -0.3), (-0.4, -0.3),
                 (-0.98, -0.28)], R), col, LW)
        for x in (-0.75, -0.45, -0.15, 0.15, 0.45, 0.75):
            stroke(S([(x, -0.72), (x, -0.32)], R), 2.5, (0.32, 0.26, 0.22))
    elif st == "wave":
        shape(S([(-1.0, -0.25), (-1.0, -0.8), (-0.75, -1.2), (-0.4, -1.42), (0.1, -1.5),
                 (0.55, -1.42), (0.95, -1.15), (1.05, -0.7), (1.0, -0.25), (0.88, -0.6),
                 (0.55, -0.82), (0.2, -0.98), (-0.25, -0.88), (-0.65, -0.72), (-0.9, -0.55)], R),
              col, LW)
        for k in (0, 1, 2):
            stroke(S([(-0.6 + k * 0.4, -0.92 + k * 0.03), (-0.35 + k * 0.4, -1.3),
                      (0.0 + k * 0.38, -1.38)], R), 3, darker(col, 0.75))
    elif st == "curls":
        rng = [(-1.05, -0.2), (-1.12, -0.6), (-0.9, -1.0), (-0.5, -1.25), (0, -1.32),
               (0.5, -1.25), (0.9, -1.0), (1.12, -0.6), (1.05, -0.2), (-0.6, -0.8),
               (0, -0.9), (0.6, -0.8), (-0.3, -1.05), (0.3, -1.05)]
        big = p.get("curl_r", 0.32)
        for i, (x, y) in enumerate(rng):
            r = big * (0.85 + 0.3 * ((i * 0.53) % 1))
            shape(ell(x * R, y * R, r * R, r * R * 0.95, n=8), col, 4)
            stroke([((x - r * 0.35) * R, (y - r * 0.2) * R), ((x + r * 0.2) * R, (y + r * 0.3) * R)],
                   2.5, darker(col, 0.7))
    elif st == "bangs":
        shape(S([(-1.05, -0.05), (-1.02, -0.7), (-0.6, -1.15), (0, -1.22), (0.6, -1.15),
                 (1.02, -0.7), (1.05, -0.05), (0.92, -0.32), (0.75, -0.42), (0.6, -0.3),
                 (0.42, -0.45), (0.22, -0.32), (0.0, -0.46), (-0.22, -0.32), (-0.45, -0.46),
                 (-0.62, -0.3), (-0.8, -0.44), (-0.95, -0.3)], R), col, LW, smooth=False)
    elif st == "quiff":
        shape(S([(-1.0, -0.3), (-0.95, -0.82), (-0.55, -1.12), (-0.1, -1.18), (0.15, -1.45),
                 (0.55, -1.42), (0.85, -1.15), (1.0, -0.75), (1.0, -0.3), (0.85, -0.6),
                 (0.4, -0.75), (-0.2, -0.75), (-0.8, -0.6)], R), col, LW)
        stroke(S([(0.1, -1.0), (0.3, -1.3), (0.6, -1.3)], R), 3, darker(col, 0.75))
    elif st == "side":
        shape(S([(-1.0, -0.3), (-0.98, -0.8), (-0.6, -1.15), (0, -1.22), (0.6, -1.15),
                 (0.98, -0.8), (1.0, -0.3), (0.9, -0.52), (0.55, -0.58), (0.0, -0.5),
                 (-0.5, -0.6), (-0.85, -0.55)], R), col, LW)
        stroke(S([(-0.55, -1.0), (0.2, -0.8), (0.8, -0.6)], R), 3, (0.32, 0.27, 0.24))
        stroke(S([(-0.3, -1.12), (0.4, -0.92), (0.95, -0.72)], R), 3, (0.32, 0.27, 0.24))
    elif st == "spread":
        shape(S([(-1.02, -0.1), (-0.95, -0.75), (-0.55, -1.12), (0, -1.2), (0.55, -1.12),
                 (0.95, -0.75), (1.02, -0.1), (0.8, -0.45), (0.3, -0.7), (-0.3, -0.7),
                 (-0.8, -0.45)], R), col, LW)
    elif st == "longdark":
        for s in (-1, 1):
            shape(S([(0, -1.18), (s * 0.55, -1.12), (s * 1.0, -0.7), (s * 1.1, 0.2),
                     (s * 1.2, 1.2), (s * 1.3, 2.3), (s * 1.0, 2.35), (s * 0.88, 1.2),
                     (s * 0.8, 0.2), (s * 0.66, -0.45), (s * 0.3, -0.8), (0, -0.88)], R), col, LW)
    elif st in ("pigtails", "bob", "ponytail"):
        shape(S([(-1.05, 0.0), (-1.02, -0.7), (-0.6, -1.15), (0, -1.22), (0.6, -1.15),
                 (1.02, -0.7), (1.05, 0.0), (0.9, -0.4), (0.5, -0.5), (0.15, -0.38),
                 (-0.2, -0.5), (-0.6, -0.42), (-0.92, -0.35)], R), col, LW)
        if st == "ponytail":
            shape(ell(0.75 * R, -0.85 * R, 0.16 * R, 0.13 * R, n=8), p.get("bow", (0.3, 0.5, 0.8)), 4)
        if st == "bob" and p.get("bow"):
            shape(ell(-0.6 * R, -1.0 * R, 0.25 * R, 0.15 * R, rot=-0.4, n=8), p["bow"], 4)


def beard(R):
    col = (0.20, 0.14, 0.11)
    pts = [(1.02, -0.1), (1.05, 0.4), (0.92, 0.9), (0.62, 1.28), (0.3, 1.48), (0, 1.55),
           (-0.3, 1.48), (-0.62, 1.28), (-0.92, 0.9), (-1.05, 0.4), (-1.02, -0.1),
           (-0.8, 0.22), (-0.5, 0.3), (-0.22, 0.28), (0, 0.33), (0.22, 0.28),
           (0.5, 0.3), (0.8, 0.22)]
    shape(S(pts, R), col, LW)
    for x, y in ((-0.7, 0.7), (0.7, 0.7), (-0.4, 1.1), (0.4, 1.1), (0, 1.25), (-0.85, 0.35),
                 (0.85, 0.35)):
        stroke(S([(x, y), (x * 0.9, y + 0.15)], R), 2.5, (0.38, 0.3, 0.26))
    # moustache
    shape(S([(-0.5, 0.42), (-0.25, 0.28), (0, 0.33), (0.25, 0.28), (0.5, 0.42),
             (0.25, 0.42), (0, 0.4), (-0.25, 0.42)], R), col, 4)
    # mouth hole
    shape(S([(-0.28, 0.47), (0.28, 0.47), (0.18, 0.62), (0, 0.66), (-0.18, 0.62)], R),
          (0.75, 0.38, 0.35), 4)


# --------------------------------------------------------------- clothes
def torso_pts(W, sh, bottom=150, slim=1.0):
    return [(-W * 0.9 * slim, bottom), (-W, -sh + 55), (-W * 0.93, -sh + 14),
            (-W * 0.62, -sh - 2), (-W * 0.22, -sh - 8), (W * 0.22, -sh - 8),
            (W * 0.62, -sh - 2), (W * 0.93, -sh + 14), (W, -sh + 55), (W * 0.9 * slim, bottom)]


def knit(saved, W, sh, col, vertical=True):
    c = ctx()
    c.save()
    clip_to(saved)
    for i in range(-8, 9):
        x = i * W / 7
        stroke([(x, -sh), (x + 3, -sh * 0.5), (x, 40)], 2.2, darker(col, 0.78), jit=0.6)
    c.restore()


def clothes(p, W, sh):
    k = p["clothes"]
    nk = 26  # neck half width at collar
    if k == "blazer_vest":       # Nikolai
        navy, shirt, vest = (0.20, 0.25, 0.43), (0.70, 0.83, 0.93), (0.20, 0.20, 0.25)
        shape(torso_pts(W, sh), navy, LW)
        poly([(-W * 0.36, -sh - 6), (W * 0.36, -sh - 6), (0, -sh + 125)], shirt, 4)
        poly([(-W * 0.3, -sh + 30), (0, -sh + 95), (W * 0.3, -sh + 30), (W * 0.3, 60),
              (-W * 0.3, 60)], vest, 4)
        for y in (-sh + 110, -sh + 140):
            dot(0, y, 4, (0.6, 0.6, 0.62))
        poly([(-nk, -sh - 10), (-6, -sh + 22), (-nk - 22, -sh + 6)], WHITE, 3.5)
        poly([(nk, -sh - 10), (6, -sh + 22), (nk + 22, -sh + 6)], WHITE, 3.5)
        for s in (-1, 1):
            poly([(s * W * 0.38, -sh - 6), (s * W * 0.32, -sh + 70), (s * W * 0.06, -sh + 130),
                  (s * W * 0.14, -sh + 40)], darker(navy, 0.85), 4)
        return navy
    if k == "blazer_sweater":    # Kolya
        navy, cream = (0.20, 0.25, 0.43), (0.95, 0.90, 0.76)
        shape(torso_pts(W, sh), navy, LW)
        poly([(-W * 0.36, -sh - 6), (W * 0.36, -sh - 6), (W * 0.28, 60), (-W * 0.28, 60)],
             cream, 4)
        stroke([(-nk - 6, -sh - 4), (0, -sh + 12), (nk + 6, -sh - 4)], 6, darker(cream, 0.8))
        for s in (-1, 1):
            poly([(s * W * 0.38, -sh - 6), (s * W * 0.3, -sh + 70), (s * W * 0.2, -sh + 150),
                  (s * W * 0.16, -sh + 40)], darker(navy, 0.85), 4)
        return navy
    if k == "vneck":             # Kolenka
        g = (0.17, 0.36, 0.25)
        sv = shape(torso_pts(W, sh, slim=0.95), g, LW)
        knit(sv, W, sh, g)
        poly([(-nk - 4, -sh - 8), (nk + 4, -sh - 8), (0, -sh + 50)], SKIN2, 4)
        stroke([(-nk - 12, -sh - 6), (0, -sh + 62), (nk + 12, -sh - 6)], 6, darker(g, 0.7))
        return g
    if k == "polo":              # Yarik
        b = (0.19, 0.18, 0.21)
        shape(torso_pts(W, sh), b, LW)
        poly([(-10, -sh - 6), (10, -sh - 6), (8, -sh + 55), (-8, -sh + 55)], (0.27, 0.26, 0.3), 3)
        dot(0, -sh + 18, 4, (0.5, 0.5, 0.55))
        dot(0, -sh + 38, 4, (0.5, 0.5, 0.55))
        for s in (-1, 1):
            poly([(s * 4, -sh - 10), (s * (nk + 22), -sh - 12), (s * (nk + 30), -sh + 14),
                  (s * 12, -sh + 26)], (0.24, 0.23, 0.27), 4)
        return b
    if k in ("halfzip_beige", "halfzip_white"):  # Denis, Nikita
        col = (0.87, 0.77, 0.60) if k == "halfzip_beige" else (0.96, 0.95, 0.92)
        shape(torso_pts(W, sh), col, LW)
        poly([(-nk - 10, -sh - 34), (nk + 10, -sh - 34), (nk + 14, -sh - 2), (-nk - 14, -sh - 2)],
             darker(col, 0.93), 4)
        stroke([(0, -sh - 32), (0, -sh + 70)], 4)
        poly([(-6, -sh + 60), (6, -sh + 60), (5, -sh + 82), (-5, -sh + 82)], (0.7, 0.7, 0.72), 3)
        return col
    if k == "check":             # Ilyas
        g, shirt = (0.58, 0.58, 0.58), WHITE
        sv = shape(torso_pts(W, sh), g, LW)
        c = ctx()
        c.save()
        clip_to(sv)
        for i in range(-10, 11):
            stroke([(i * 22, -sh - 20), (i * 22, 150)], 2.2, (0.42, 0.42, 0.44), jit=0.4)
            stroke([(-W - 10, -sh + i * 22 + 100), (W + 10, -sh + i * 22 + 100)], 2.2,
                   (0.42, 0.42, 0.44), jit=0.4)
        c.restore()
        shape(torso_pts(W, sh), None, LW)
        poly([(-W * 0.34, -sh - 6), (W * 0.34, -sh - 6), (0, -sh + 135)], shirt, 4)
        stroke([(0, -sh + 20), (0, -sh + 130)], 2.5)
        poly([(-nk, -sh - 10), (-6, -sh + 22), (-nk - 22, -sh + 6)], WHITE, 3.5)
        poly([(nk, -sh - 10), (6, -sh + 22), (nk + 22, -sh + 6)], WHITE, 3.5)
        for s in (-1, 1):
            poly([(s * W * 0.36, -sh - 6), (s * W * 0.32, -sh + 75), (s * W * 0.04, -sh + 140),
                  (s * W * 0.14, -sh + 40)], (0.5, 0.5, 0.5), 4)
        return g
    if k == "knitgrey":          # Kirill
        g = (0.33, 0.33, 0.36)
        sv = shape(torso_pts(W, sh), g, LW)
        knit(sv, W, sh, g)
        stroke([(-nk - 8, -sh - 6), (0, -sh + 14), (nk + 8, -sh - 6)], 9, darker(g, 0.75))
        return g
    if k == "hoodie":            # Igor
        hood, tee = (0.68, 0.68, 0.69), (0.48, 0.48, 0.50)
        shape([(-W * 0.75, -sh + 10), (-W * 0.55, -sh - 30), (0, -sh - 38), (W * 0.55, -sh - 30),
               (W * 0.75, -sh + 10)], darker(hood, 0.9), LW)
        shape(torso_pts(W, sh), hood, LW)
        poly([(-W * 0.3, -sh - 4), (W * 0.3, -sh - 4), (W * 0.24, 60), (-W * 0.24, 60)], tee, 4)
        stroke([(-nk - 4, -sh - 4), (0, -sh + 12), (nk + 4, -sh - 4)], 4)
        for s in (-1, 1):
            stroke([(s * W * 0.27, -sh), (s * W * 0.27, -sh + 70)], 3.5, WHITE)
            dot(s * W * 0.27, -sh + 74, 5, WHITE)
        return hood
    if k == "cardigan":          # Aman
        br, tee = (0.57, 0.38, 0.23), WHITE
        sv = shape(torso_pts(W * 1.12, sh), br, LW)
        knit(sv, W * 1.12, sh, br)
        poly([(-W * 0.28, -sh - 6), (W * 0.28, -sh - 6), (W * 0.24, 60), (-W * 0.24, 60)], tee, 4)
        for y in (-sh + 50, -sh + 95, -sh + 140):
            dot(-W * 0.3, y, 5, (0.35, 0.22, 0.13))
        return br
    if k == "tee_tied":          # Dima
        tee, sw = (0.50, 0.33, 0.21), (0.68, 0.50, 0.33)
        shape(torso_pts(W, sh), tee, LW)
        stroke([(-nk - 4, -sh - 6), (0, -sh + 10), (nk + 4, -sh - 6)], 4)
        shape([(-W * 1.0, -sh + 40), (-W * 0.9, -sh - 8), (-W * 0.3, -sh - 20), (W * 0.3, -sh - 20),
               (W * 0.9, -sh - 8), (W * 1.0, -sh + 40), (W * 0.7, -sh + 18), (0, -sh + 6),
               (-W * 0.7, -sh + 18)], sw, LW)
        tube([(-W * 0.85, -sh + 15), (-W * 0.4, -sh + 50), (-8, -sh + 68)], 26, sw)
        tube([(W * 0.85, -sh + 15), (W * 0.4, -sh + 50), (8, -sh + 68)], 26, sw)
        oval(0, -sh + 70, 20, 16, darker(sw, 0.9), 4)
        tube([(-6, -sh + 82), (-16, -sh + 120)], 20, sw)
        tube([(6, -sh + 82), (18, -sh + 116)], 20, sw)
        return tee
    if k == "sweatshirt_olive":  # Seryozha
        o = (0.50, 0.52, 0.41)
        shape(torso_pts(W, sh), o, LW)
        stroke([(-nk - 8, -sh - 6), (0, -sh + 14), (nk + 8, -sh - 6)], 9, darker(o, 0.8))
        return o
    if k == "girl":
        col = p["top_col"]
        shape(torso_pts(W, sh), col, LW)
        poly([(-nk - 18, -sh - 8), (0, -sh + 26), (nk + 18, -sh - 8), (nk + 6, -sh + 18),
              (0, -sh + 40), (-nk - 6, -sh + 18)], WHITE, 3.5)
        return col
    shape(torso_pts(W, sh), (0.6, 0.5, 0.4), LW)
    return (0.6, 0.5, 0.4)


# --------------------------------------------------------------- person
DEFAULT = dict(R=82, sh=165, W=112, neck=30, ears=1.0, glasses=None, beard=False,
               brows="calm", mouth="smile", eyes="open", big_eye=1.0, freckles=True)


def person(**kw):
    p = dict(DEFAULT)
    p.update(kw)
    return p


def body_xform(pose):
    """Transform from body-local coords into seat coords."""
    bx, by, br = pose.get("bx", 0), pose.get("by", 0), math.radians(pose.get("brot", 0))
    cr, sr = math.cos(br), math.sin(br)

    def f(x, y):
        y2 = y - 40
        return (bx + x * cr - y2 * sr, by + 40 + x * sr + y2 * cr)
    return f


def head_center(p, pose):
    return (pose.get("hx", 0), -p["sh"] - p["neck"] - p["R"] * 0.92 + pose.get("hy", 0))


def draw_head(p, pose, t, with_back=True):
    if pose.get("hair_override"):
        p = dict(p, hair=pose["hair_override"])
    R = p["R"]
    c = ctx()
    hx, hy = head_center(p, pose)
    c.save()
    c.translate(hx, hy)
    c.rotate(math.radians(pose.get("hrot", 0)))
    if with_back:
        hair_back(p, R)
    # ears
    es = p["ears"]
    for s in (-1, 1):
        oval(s * 0.98 * R, 0.08 * R, 0.2 * R * es, 0.27 * R * es, SKIN, LW, rot=s * 0.2, n=9)
        stroke([(s * 0.98 * R, -0.02 * R), (s * (0.98 + 0.06 * es) * R, 0.12 * R)], 3)
    # head
    hp = []
    for i in range(14):
        a = 2 * math.pi * i / 14
        x, y = R * math.cos(a), R * 1.04 * math.sin(a)
        if y > 0:
            x *= 1 + 0.07 * math.sin(a)
        hp.append((x, y))
    shape(hp, SKIN, LW)
    if p["beard"]:
        beard(R)
    # cheeks + freckles
    for s in (-1, 1):
        oval(s * 0.56 * R, 0.30 * R, 0.17 * R, 0.11 * R, CHEEK, 0, alpha=0.55, ink=None)
        if p["freckles"]:
            for (fx, fy) in ((0.47, 0.17), (0.6, 0.2), (0.53, 0.26), (0.68, 0.27)):
                dot(s * fx * R, fy * R, 2.4, FRECK, 0.8)
    # eyes
    style = pose.get("eyes", p["eyes"])
    look = pose.get("look", (0, 0))
    lid = pose.get("lid", 0.0)
    for s in (-1, 1):
        eye(s * 0.36 * R, -0.05 * R, R, style, look, lid, p["big_eye"])
        if p.get("lashes") and style == "open":
            ex, ey = s * 0.36 * R, -0.05 * R - 0.25 * R * (1 - 2 * lid)
            for k in (-1, 0, 1):
                stroke([(ex + s * (0.1 + 0.07 * k) * R, ey + 2), (ex + s * (0.16 + 0.09 * k) * R, ey - 0.1 * R)], 3)
    brows(R, pose.get("brows", p["brows"]), pose.get("brow_raise", 0.0),
          pose.get("brow_tilt", 0.0))
    # nose
    shape(ell(0, 0.2 * R, 0.14 * R, 0.11 * R, n=9), (0.97, 0.72, 0.6), 4.2)
    if pose.get("bubble"):
        b = pose["bubble"]
        shape(ell(0.12 * R + b * 0.7, 0.3 * R + b * 0.3, b, b, n=10), (0.75, 0.9, 1.0), 3.5, alpha=0.55)
        dot(0.12 * R + b * 0.4, 0.3 * R - b * 0.1, max(2, b * 0.22), WHITE)
    if not p["beard"]:
        mouth(R, pose.get("mouth", p["mouth"]), pose.get("mouth_amt", 1.0),
              pose.get("mouth_wide", p.get("mouth_wide", 1.0)), t)
    else:
        if pose.get("mouth") == "laugh":
            shape(S([(-0.3, 0.46), (0.3, 0.46), (0, 0.72)], R), MOUTH, 4)
    hair_front(p, R, t)
    if p["glasses"]:
        glasses(R, p["glasses"])
    c.restore()


def draw_person_back(p, pose, t):
    """Everything behind the desk: torso and (unless head_front) the head."""
    c = ctx()
    f = body_xform(pose)
    c.save()
    bx, by, br = pose.get("bx", 0), pose.get("by", 0), pose.get("brot", 0)
    c.translate(bx, by + 40)
    c.rotate(math.radians(br))
    c.translate(0, -40)
    sh, W = p["sh"], p["W"]
    if not pose.get("head_front"):
        hx, hy = head_center(p, pose)
        c.save()
        c.translate(hx, hy)
        c.rotate(math.radians(pose.get("hrot", 0)))
        hair_back(p, p["R"])
        c.restore()
    # neck
    if not pose.get("head_front"):
        shape([(-24, -sh - p["neck"] - 30), (24, -sh - p["neck"] - 30), (26, -sh + 10),
               (-26, -sh + 10)], SKIN2, LW, smooth=False)
    pose["_sleeve"] = clothes(p, W, sh)
    for a in pose.get("arms", []):
        if a.get("layer") == "back":
            draw_arm(p, pose, a, local=True)
    if not pose.get("head_front"):
        draw_head(p, pose, t, with_back=False)
    c.restore()
    if pose.get("knees"):
        j = 6 * math.sin(t * 11)
        for kx, ph in ((-70, 0), (30, 1.7)):
            oval(kx, -58 - abs(j) * (1 if ph else 0.5), 36, 30, (0.22, 0.24, 0.33), LW, n=10)


def shoulder(p, side):
    return (side * (p["W"] - 22), -p["sh"] + 34)


def draw_arm(p, pose, a, local=False):
    side = a["side"]
    sx, sy = shoulder(p, side)
    if not local:
        sx, sy = body_xform(pose)(sx, sy)
    pts = [(sx, sy)] + [tuple(q) for q in a["pts"]]
    col = a.get("color", pose.get("_sleeve", (0.5, 0.5, 0.5)))
    tube(pts, a.get("w", 44), col)
    hx, hy = pts[-1]
    px, py = pts[-2]
    ang = math.atan2(hy - py, hx - px)
    kind = a.get("hand", "mitt")
    ctx().save()
    ctx().translate(hx, hy)
    ctx().rotate(ang)
    # cuff
    if a.get("cuff", True):
        oval(-4, 0, 8, 24, darker(col, 0.85), 4, n=8)
    if kind == "pen":
        stroke([(10, -6), (52, 20)], 7, (0.25, 0.35, 0.7))
        stroke([(46, 16), (56, 23)], 4, INK)
    if kind != "none":
        shape(ell(16, 0, 22, 19, n=10), SKIN, 4.5)
        stroke([(20, -12), (30, -6)], 3)
        stroke([(22, 2), (33, 6)], 3)
    ctx().restore()


def draw_person_front(p, pose, t):
    for a in pose.get("arms", []):
        if a.get("layer", "front") == "front":
            draw_arm(p, pose, a)
    if pose.get("head_front"):
        draw_head(p, pose, t)
