"""Tiny 'hand-inked cel' drawing kit on top of pycairo.

Every outline is a Catmull-Rom spline through slightly jittered points.
The jitter is re-seeded every frame, which gives the classic line boil of
old cel animation.
"""
import math
import numpy as np
import cairo

INK = (0.15, 0.10, 0.08)

G = {"ctx": None, "rng": np.random.default_rng(0), "boil": 1.0}


def ctx():
    return G["ctx"]


def cur_scale():
    m = G["ctx"].get_matrix()
    return math.sqrt(abs(m.xx * m.yy - m.xy * m.yx)) or 1.0


def _jit(pts, amp):
    pts = np.asarray(pts, float)
    if amp <= 0:
        return pts
    sc = cur_scale()
    a = 1.15 * amp * G["boil"] / sc
    rng = G["rng"]
    shift = rng.normal(0, a * 0.6, 2)
    return pts + rng.normal(0, a, pts.shape) + shift


def path(pts, closed=True, smooth=True, jit=1.0):
    c = G["ctx"]
    p = _jit(pts, jit)
    n = len(p)
    c.new_path()
    if n == 0:
        return
    if not smooth or n < 3:
        c.move_to(*p[0])
        for q in p[1:]:
            c.line_to(*q)
        if closed:
            c.close_path()
        return
    c.move_to(*p[0])
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = p[(i - 1) % n] if (closed or i > 0) else p[0]
        p1 = p[i]
        p2 = p[(i + 1) % n]
        p3 = p[(i + 2) % n] if (closed or i + 2 < n) else p[-1]
        c1 = p1 + (p2 - p0) / 6.0
        c2 = p2 - (p3 - p1) / 6.0
        c.curve_to(c1[0], c1[1], c2[0], c2[1], p2[0], p2[1])
    if closed:
        c.close_path()


def shape(pts, fill=None, lw=5.0, closed=True, smooth=True, jit=1.0,
          alpha=1.0, ink=INK, clip_after=False):
    c = G["ctx"]
    path(pts, closed, smooth, jit)
    saved = c.copy_path()
    if fill is not None and closed:
        c.set_source_rgba(*fill, alpha) if len(fill) == 3 else c.set_source_rgba(*fill)
        c.fill_preserve()
    if ink is not None and lw > 0:
        c.set_source_rgba(*ink, alpha) if len(ink) == 3 else c.set_source_rgba(*ink)
        c.set_line_width(lw)
        c.stroke()
    else:
        c.new_path()
    return saved


def clip_to(saved):
    c = G["ctx"]
    c.new_path()
    c.append_path(saved)
    c.clip()


def stroke(pts, lw=5.0, color=INK, smooth=True, jit=1.0, alpha=1.0, closed=False):
    c = G["ctx"]
    path(pts, closed=closed, smooth=smooth, jit=jit)
    c.set_source_rgba(*color, alpha)
    c.set_line_width(lw)
    c.stroke()


def tube(pts, w, color, lw=5.0, jit=1.0):
    """Rubbery limb: ink stroke underneath, colour stroke on top."""
    c = G["ctx"]
    path(pts, closed=False, smooth=True, jit=jit)
    saved = c.copy_path()
    c.set_source_rgb(*INK)
    c.set_line_width(w + 2 * lw)
    c.stroke()
    c.append_path(saved)
    c.set_source_rgb(*color)
    c.set_line_width(w)
    c.stroke()


def ell(cx, cy, rx, ry, rot=0.0, n=12, start=0.0, bumps=0, bump_amp=0.0):
    out = []
    cr, sr = math.cos(rot), math.sin(rot)
    for i in range(n):
        a = start + 2 * math.pi * i / n
        k = 1.0 + (bump_amp * math.cos(bumps * a) if bumps else 0.0)
        x, y = rx * k * math.cos(a), ry * k * math.sin(a)
        out.append((cx + x * cr - y * sr, cy + x * sr + y * cr))
    return out


def oval(cx, cy, rx, ry, fill, lw=5.0, rot=0.0, n=12, jit=1.0, alpha=1.0, ink=INK):
    return shape(ell(cx, cy, rx, ry, rot, n), fill, lw, jit=jit, alpha=alpha, ink=ink)


def dot(x, y, r, color=INK, alpha=1.0):
    c = G["ctx"]
    c.new_path()
    c.arc(x, y, r, 0, 2 * math.pi)
    c.set_source_rgba(*color, alpha)
    c.fill()


def rect_pts(x0, y0, x1, y1, step=None):
    """Rectangle corner points, optionally subdivided so long edges wobble."""
    if step is None:
        return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    pts = []
    for (ax, ay, bx, by) in ((x0, y0, x1, y0), (x1, y0, x1, y1),
                             (x1, y1, x0, y1), (x0, y1, x0, y0)):
        L = math.hypot(bx - ax, by - ay)
        k = max(1, int(L / step))
        for i in range(k):
            f = i / k
            pts.append((ax + (bx - ax) * f, ay + (by - ay) * f))
    return pts


def poly(pts, fill, lw=5.0, jit=1.0, alpha=1.0, ink=INK):
    return shape(pts, fill, lw, smooth=False, jit=jit, alpha=alpha, ink=ink)


def lerp(a, b, f):
    return a + (b - a) * f


def ease(f):
    f = min(1.0, max(0.0, f))
    return f * f * (3 - 2 * f)


def ease2(f):
    f = min(1.0, max(0.0, f))
    return 0.5 - 0.5 * math.cos(math.pi * f)


def mix(c1, c2, f):
    return tuple(a + (b - a) * f for a, b in zip(c1, c2))


def darker(c, f=0.8):
    return tuple(x * f for x in c)


def star(cx, cy, r, color, rot=0.0, lw=3.0):
    pts = []
    for i in range(8):
        rr = r if i % 2 == 0 else r * 0.38
        a = rot + i * math.pi / 4
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    shape(pts, color, lw, smooth=False)
