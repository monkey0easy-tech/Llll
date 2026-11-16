"""Render the lecture-hall cartoon to MP4 (silent video stream to stdout/ffmpeg)."""
import math
import sys
import subprocess
import numpy as np
import cairo
from PIL import Image

import ink
from ink import (G, INK, shape, stroke, tube, ell, oval, dot, poly, star, lerp, ease,
                 ease2, mix, darker, ctx, rect_pts)
import people
from people import draw_person_back, draw_person_front, WHITE, SKIN
import cast
from cast import UPPER, LOWER, juice, cobweb, tumbleweed

W, H, FPS = 1280, 720, 12
DUR = 42.5

WOOD_TOP = (0.88, 0.58, 0.32)
WOOD = (0.76, 0.45, 0.24)
WOOD_D = (0.58, 0.33, 0.18)
WOOD_DD = (0.46, 0.26, 0.15)
BEIGE = (0.94, 0.88, 0.74)
METAL = (0.70, 0.72, 0.74)
PANEL = (0.67, 0.43, 0.25)

Y_U, Y_L = 800, 1520
UX = [300 + 420 * i for i in range(len(UPPER))]
LX = [300, 760, 1200, 1620, 2040, 2460]


# =================================================================== close-up set
def desk_row(x0, x1, y, bottom, railing=False):
    # front panel
    poly(rect_pts(x0, y + 24, x1, bottom, 260), WOOD, 5)
    for x in range(int(x0) + 210, int(x1), 420):
        stroke([(x, y + 34), (x, bottom)], 3, WOOD_D)
    for k in range(int(x0) + 60, int(x1), 170):
        stroke([(k, y + 60 + (k * 7) % 40), (k + 90, y + 62 + (k * 7) % 40)], 2.5, darker(WOOD, 0.85))
    # top surface
    poly([(x0, y - 32)] + [(x, y - 32) for x in range(int(x0) + 300, int(x1), 300)] +
         [(x1, y - 32), (x1, y + 24)] + [(x, y + 24) for x in range(int(x1) - 300, int(x0), -300)] +
         [(x0, y + 24)], WOOD_TOP, 5)
    stroke([(x0, y + 16), (x1, y + 16)], 3, darker(WOOD_TOP, 0.85))
    if railing:
        for x in range(int(x0) + 210, int(x1), 420):
            poly([(x - 8, y + 50), (x + 8, y + 50), (x + 8, bottom), (x - 8, bottom)], METAL, 4)
        ry = y + 62
        shape([(x0, ry - 9)] + [(x, ry - 9) for x in range(int(x0) + 300, int(x1), 300)] +
              [(x1, ry - 9), (x1, ry + 9)] + [(x, ry + 9) for x in range(int(x1) - 300, int(x0), -300)] +
              [(x0, ry + 9)], METAL, 4.5, smooth=False)
        stroke([(x0, ry - 3), (x1, ry - 3)], 3, WHITE, alpha=0.7)


def backrest(x, y):
    shape([(x - 128, y + 40), (x - 132, y - 200), (x - 110, y - 236), (x + 110, y - 236),
           (x + 132, y - 200), (x + 128, y + 40)], WOOD_DD, 5)
    stroke([(x - 112, y - 214), (x + 112, y - 214)], 3, darker(WOOD_DD, 0.8))


def sunbeams(x0, x1, ytop, ybot, t):
    c = ctx()
    for k, xx in enumerate(range(int(x0), int(x1), 760)):
        sh = 220
        pts = [(xx, ytop), (xx + 230, ytop), (xx + 230 + sh * 2, ybot), (xx + sh * 2, ybot)]
        poly(pts, (1.0, 0.95, 0.75), 0, alpha=0.22, ink=None)
    # floating dust motes
    rng = np.random.default_rng(7)
    for i in range(60):
        bx = rng.uniform(x0, x1)
        by = rng.uniform(ytop, ybot)
        dx = 30 * math.sin(t * 0.4 + i)
        dy = 20 * math.sin(t * 0.3 + i * 1.7)
        dot(bx + dx, by + dy, rng.uniform(1.8, 3.5), (1.0, 0.97, 0.85), 0.7)


def wall(x0, x1, ytop, ypanel, ybot, t):
    poly(rect_pts(x0, ytop, x1, ypanel, 400), BEIGE, 0, ink=None)
    sunbeams(x0, x1, ytop, ybot, t)
    poly(rect_pts(x0, ypanel, x1, ybot, 400), PANEL, 5)
    for x in range(int(x0), int(x1), 210):
        stroke([(x, ypanel + 12), (x, ybot)], 3, darker(PANEL, 0.82))
    stroke([(x0, ypanel + 14), (x1, ypanel + 14)], 3, darker(PANEL, 0.82))


def draw_row(seats, xs, y, t, railing, bottom):
    c = ctx()
    poses = []
    for (p, act), x in zip(seats, xs):
        backrest(x, y)
    for (p, act), x in zip(seats, xs):
        if p is None:
            poses.append(None)
            continue
        pose = act(t)
        poses.append(pose)
        c.save()
        c.translate(x, y)
        draw_person_back(p, pose, t)
        c.restore()
    desk_row(xs[0] - 700, xs[-1] + 900, y, bottom, railing)
    for (p, act), x, pose in zip(seats, xs, poses):
        c.save()
        c.translate(x, y)
        if pose is None:
            empty_seat(t)
        else:
            if pose.get("props"):
                pose["props"](t)
            draw_person_front(p, pose, t)
            if pose.get("props_after"):
                pose["props_after"](t)
        c.restore()


def empty_seat(t):
    cobweb(-128, -232, 1.0)
    c = ctx()
    c.save()
    c.translate(10, -6)
    juice(t)
    c.restore()


def closeup(t):
    wall(-800, 6000, Y_U - 900, Y_U - 300, Y_U + 40, t)
    draw_row(UPPER, UX, Y_U, t, True, Y_L + 40)
    # light patch on the upper desk front behind the lower row
    draw_row(LOWER, LX, Y_L, t, False, Y_L + 600)
    # tumbleweed on the upper desk past the empty seat
    if 36.6 < t < 40.2:
        f = (t - 36.6) / 3.6
        x = lerp(UX[-1] - 700, UX[-1] + 760, f)
        y = Y_U - 50 - abs(math.sin(f * math.pi * 3.2)) * 70
        tumbleweed(x, y, t)


def cam_closeup(t):
    """Camera centre (x, y) and zoom for the close-up set."""
    zl, zu = 1.25, 1.25
    yl, yu = Y_L - 160, Y_U - 172
    if t < 11.5:
        f = ease2((t - 7.0) / 4.5)
        return lerp(LX[5] + 60, (LX[1] + LX[2]) / 2, f), yl, zl
    if t < 13.0:
        return (LX[1] + LX[2]) / 2, yl, zl
    if t < 15.0:
        f = ease2((t - 13.0) / 2.0)
        z = zl - 0.22 * math.sin(math.pi * f)
        return lerp((LX[1] + LX[2]) / 2, UX[0], f), lerp(yl, yu, f), z
    # upper row: hold on each seat, glide to the next
    arrive = [15.0 + 2.0 * i for i in range(10)] + [35.6]
    x = UX[0]
    for i in range(1, len(arrive)):
        dur = 0.8 if i < 10 else 1.4
        f = ease2((t - (arrive[i] - dur)) / dur)
        if f > 0:
            x = lerp(UX[i - 1], UX[i], f)
    return x, yu, zu


# =================================================================== wide set
def row_y(k, x):
    base = 1330 - k * 125
    hw = 560 + 40 * k
    return base - (44 + 4 * k) * ((x - 800) / hw) ** 2


def mini_student(x, y, seed, t, s=1.0):
    rng = np.random.default_rng(seed)
    tops = [(0.85, 0.35, 0.30), (0.30, 0.55, 0.55), (0.90, 0.70, 0.30), (0.20, 0.25, 0.43),
            (0.35, 0.40, 0.28), (0.88, 0.55, 0.62), (0.55, 0.55, 0.58), (0.60, 0.40, 0.25)]
    hairs = [(0.18, 0.13, 0.11), (0.62, 0.45, 0.28), (0.93, 0.80, 0.45), (0.45, 0.30, 0.18),
             (0.86, 0.45, 0.20)]
    top = tops[rng.integers(len(tops))]
    hair = hairs[rng.integers(len(hairs))]
    bob = 3 * math.sin(t * rng.uniform(1.5, 4) + seed) if rng.random() < 0.6 else 0
    r = 20 * s
    shape([(x - 28 * s, y + 10), (x - 27 * s, y - 32 * s), (x - 12 * s, y - 40 * s),
           (x + 12 * s, y - 40 * s), (x + 27 * s, y - 32 * s), (x + 28 * s, y + 10)], top, 3)
    hy = y - 40 * s - r * 0.9 + bob
    oval(x, hy, r, r * 1.05, SKIN, 3, n=10)
    style = rng.integers(3)
    if style == 0:
        shape([(x - r * 1.05, hy), (x - r * 0.9, hy - r * 0.8), (x, hy - r * 1.2),
               (x + r * 0.9, hy - r * 0.8), (x + r * 1.05, hy), (x, hy - r * 0.55)], hair, 3)
    elif style == 1:
        shape([(x - r * 1.1, hy + r * 0.9), (x - r * 1.05, hy - r * 0.7), (x, hy - r * 1.2),
               (x + r * 1.05, hy - r * 0.7), (x + r * 1.1, hy + r * 0.9), (x + r * 0.75, hy - r * 0.3),
               (x - r * 0.75, hy - r * 0.3)], hair, 3)
    else:
        for k in range(6):
            a = math.pi * (1.05 + k * 0.18)
            oval(x + r * 0.85 * math.cos(a), hy + r * 0.85 * math.sin(a), r * 0.38, r * 0.36, hair, 2.5, n=7)
    dot(x - r * 0.35, hy, 2.4)
    dot(x + r * 0.35, hy, 2.4)
    oval(x - r * 0.55, hy + r * 0.35, r * 0.2, r * 0.13, people.CHEEK, 0, alpha=0.5, ink=None)
    oval(x + r * 0.55, hy + r * 0.35, r * 0.2, r * 0.13, people.CHEEK, 0, alpha=0.5, ink=None)
    stroke([(x - r * 0.3, hy + r * 0.45), (x, hy + r * 0.6), (x + r * 0.3, hy + r * 0.45)], 2.4)


def wide(t):
    c = ctx()
    # back wall + windows
    poly(rect_pts(-200, -200, 1800, 1900, 500), BEIGE, 0, ink=None)
    for i, wx in enumerate((260, 560, 860, 1160)):
        shape([(wx, 260), (wx, 90), (wx + 40, 50), (wx + 140, 50), (wx + 180, 90), (wx + 180, 260)],
              (0.75, 0.88, 0.95), 5)
        stroke([(wx + 90, 52), (wx + 90, 258)], 5)
        stroke([(wx + 2, 150), (wx + 178, 150)], 5)
        dot(wx + 135, 100, 12, (1.0, 0.96, 0.7))
    # lamps
    for lx in (420, 800, 1180):
        stroke([(lx, -200), (lx, 10)], 3)
        shape([(lx - 50, 40), (lx - 30, 8), (lx + 30, 8), (lx + 50, 40)], (0.85, 0.85, 0.8), 4,
              smooth=False)
    # sunbeams
    for wx in (260, 560, 860, 1160):
        poly([(wx, 70), (wx + 180, 70), (wx + 560, 1200), (wx + 250, 1200)], (1.0, 0.95, 0.72), 0,
             alpha=0.18, ink=None)
    # side walls
    poly([(-200, 300), (150, 360), (260, 1460), (-200, 1700)], mix(BEIGE, PANEL, 0.12), 5)
    poly([(1800, 300), (1450, 360), (1340, 1460), (1800, 1700)], mix(BEIGE, PANEL, 0.12), 5)
    poly([(-200, 1050), (210, 1000), (260, 1460), (-200, 1700)], PANEL, 5)
    poly([(1800, 1050), (1390, 1000), (1340, 1460), (1800, 1700)], PANEL, 5)
    for k in range(4):
        x = -150 + k * 90
        stroke([(x, 1050 - k * 12), (x + 8, 1640 - k * 50)], 3, darker(PANEL, 0.82))
        stroke([(1750 - k * 90, 1050 - k * 12), (1742 - k * 90, 1640 - k * 50)], 3, darker(PANEL, 0.82))
    # whiteboard (left wall) + TV
    poly([(-60, 1090), (190, 1060), (215, 1330), (-60, 1400)], (0.97, 0.97, 0.95), 6)
    stroke([(-20, 1150), (20, 1130), (60, 1160), (110, 1120)], 3, (0.25, 0.4, 0.75))
    stroke([(-20, 1230), (50, 1200), (150, 1215)], 3, (0.75, 0.25, 0.25))
    stroke([(-30, 1320), (-30, 1250), (40, 1280), (100, 1240), (160, 1255)], 3, (0.25, 0.4, 0.75))
    poly([(20, 900), (180, 880), (190, 1000), (25, 1020)], (0.2, 0.22, 0.26), 6)
    poly([(35, 912), (168, 896), (176, 988), (40, 1004)], (0.35, 0.55, 0.62), 3)
    star(110, 945, 14 + 3 * math.sin(t * 5), (1.0, 0.95, 0.6), rot=t, lw=2.5)
    # door (right wall) + exit sign
    poly([(1405, 1150), (1560, 1140), (1575, 1520), (1410, 1480)], WOOD_D, 6)
    stroke([(1484, 1146), (1492, 1500)], 4)
    dot(1470, 1320, 6, METAL)
    dot(1506, 1318, 6, METAL)
    poly([(1450, 1095), (1520, 1090), (1522, 1122), (1452, 1127)], (0.25, 0.75, 0.40), 4)
    stroke([(1466, 1108), (1490, 1106)], 4, (0.95, 1.0, 0.92))
    stroke([(1484, 1100), (1494, 1106), (1484, 1113)], 4, (0.95, 1.0, 0.92))
    # tiers, back to front
    for k in range(7, -1, -1):
        hw = 560 + 40 * k
        xs = np.linspace(800 - hw, 800 + hw, 9)
        top = [(x, row_y(k, x)) for x in xs]
        nxt = [(x, row_y(k - 1, x) + 0) for x in xs[::-1]] if k > 0 else [(x, row_y(k, x) + 150) for x in xs[::-1]]
        # riser/floor band behind the students in front
        shape(top + nxt, WOOD_DD, 4, smooth=True)
        # stairs at both ends
        for s in (-1, 1):
            x0 = 800 + s * hw
            poly([(x0, row_y(k, x0) - 40), (x0 + s * 70, row_y(k, x0) - 60),
                  (x0 + s * 75, row_y(k, x0) + 70), (x0, row_y(k, x0) + 85)], (0.80, 0.62, 0.42), 4)
        # students
        dens = 0.9 if k <= 4 else 0.45
        n = int(2 * hw / 72)
        for j in range(n):
            x = 800 - hw + 36 + j * 72
            seed = k * 100 + j
            if np.random.default_rng(seed + 999).random() < dens:
                mini_student(x, row_y(k, x) - 6, seed, t)
        # desk band
        front = [(x, row_y(k, x) + 52) for x in xs[::-1]]
        shape([(x, y - 8) for x, y in top] + front, WOOD, 4)
        stroke([(x, y + 4) for x, y in top], 3, WOOD_TOP)
        if k >= 5:
            stroke([(x, y - 22) for x, y in top], 5, METAL)
            for x in xs[1:-1:2]:
                stroke([(x, row_y(k, x) - 22), (x, row_y(k, x) - 6)], 4, METAL)
    # lecturer desk in front
    poly([(560, 1500), (1040, 1500), (1060, 1560), (540, 1560)], WOOD_TOP, 5)
    poly([(550, 1560), (1050, 1560), (1040, 1760), (560, 1760)], WOOD, 5)
    stroke([(800, 1565), (800, 1755)], 3, WOOD_D)
    poly([(600, 1490), (700, 1484), (706, 1500), (604, 1506)], WHITE, 3)
    shape([(930, 1460), (970, 1460), (966, 1502), (934, 1502)], (0.85, 0.3, 0.25), 4, smooth=False)
    stroke([(970, 1470), (984, 1480), (968, 1492)], 4)
    # floor
    poly([(-200, 1560), (540, 1560), (560, 1800), (-200, 1900)], (0.55, 0.58, 0.50), 4)
    poly([(1050, 1560), (1800, 1560), (1800, 1900), (1040, 1800)], (0.55, 0.58, 0.50), 4)


def cam_wide(t):
    f = ease2(t / 7.0)
    return 800, lerp(380, 1150, f), lerp(1.05, 0.86, f)


# =================================================================== frame pipeline
def make_paper():
    rng = np.random.default_rng(3)
    def noise(sw, sh, sx, sy):
        a = rng.random((sh, sw)).astype(np.float32)
        im = Image.fromarray((a * 255).astype(np.uint8)).resize((sx, sy), Image.BICUBIC)
        return np.asarray(im, np.float32) / 255.0
    low = noise(16, 9, W, H)
    mid = noise(160, 90, W, H)
    fib = noise(640, 90, W, H)
    fine = rng.random((H, W)).astype(np.float32)
    tex = 1.0 - 0.05 * low - 0.045 * mid - 0.03 * fib - 0.025 * fine
    yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
    d = ((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2
    vig = 1.0 - 0.22 * np.clip(d - 0.25, 0, None)
    return (tex * vig)[..., None]


def grade(arr, paper, i):
    rng = np.random.default_rng(10000 + i)
    a = arr * 0.88 + 0.075
    lum = a.mean(axis=2, keepdims=True)
    a = a * 0.88 + lum * 0.12
    a *= np.array([1.035, 1.0, 0.88], np.float32)
    a *= paper
    a *= 1.0 + rng.normal(0, 0.012)
    a += rng.normal(0, 0.018, (H, W, 1)).astype(np.float32)
    return np.clip(a, 0, 1)


def film_dirt(c, i):
    rng = np.random.default_rng(20000 + i)
    for _ in range(rng.integers(0, 4)):
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        dot(x, y, rng.uniform(1, 3.5), (0.12, 0.08, 0.06), 0.6)
    if rng.random() < 0.18:
        x, y = rng.uniform(0, W), rng.uniform(0, H)
        ink.stroke([(x, y), (x + rng.uniform(-30, 30), y + rng.uniform(10, 40)),
                    (x + rng.uniform(-30, 30), y + rng.uniform(30, 60))], 1.6, (0.12, 0.08, 0.06), alpha=0.5)
    if rng.random() < 0.12:
        x = rng.uniform(0, W)
        c.set_source_rgba(1, 1, 0.95, 0.25)
        c.set_line_width(1.5)
        c.move_to(x, 0)
        c.line_to(x + rng.uniform(-4, 4), H)
        c.stroke()


def iris(c, cx, cy, r):
    c.new_path()
    c.set_fill_rule(cairo.FILL_RULE_EVEN_ODD)
    c.rectangle(-10, -10, W + 20, H + 20)
    if r > 0:
        c.arc(cx, cy, r, 0, 2 * math.pi)
    c.set_source_rgb(0.06, 0.04, 0.03)
    c.fill()
    c.set_fill_rule(cairo.FILL_RULE_WINDING)


def render_frame(i, surf, c, paper):
    t = i / FPS
    G["t"] = t
    G["rng"] = np.random.default_rng(i)
    G["ctx"] = c
    c.save()
    c.set_source_rgb(*BEIGE)
    c.paint()
    if t < 7.0:
        cx, cy, z = cam_wide(t)
        scene = wide
    else:
        cx, cy, z = cam_closeup(t)
        scene = closeup
    wr = np.random.default_rng(5000 + i)
    c.translate(W / 2 + wr.normal(0, 0.7), H / 2 + wr.normal(0, 0.7))
    c.scale(z, z)
    c.translate(-cx, -cy)
    c.set_line_join(cairo.LINE_JOIN_ROUND)
    c.set_line_cap(cairo.LINE_CAP_ROUND)
    scene(t)
    c.restore()
    film_dirt(c, i)
    # iris in / iris out
    if t < 1.0:
        iris(c, W / 2, H / 2, ease(t / 1.0) * 800)
    if t > 40.0:
        # centre on the juice glass
        jx = (UX[-1] + 10 - cx) * z + W / 2
        jy = (Y_U - 80 - cy) * z + H / 2
        r = 800 * (1 - ease((t - 40.0) / 1.5))
        if t > 40.9 and t < 41.5:
            r = max(r, 95)
        iris(c, jx, jy, r)
    surf.flush()
    buf = np.frombuffer(surf.get_data(), np.uint8).reshape(H, surf.get_stride() // 4, 4)[:, :W, :3]
    rgb = buf[..., ::-1].astype(np.float32) / 255.0
    out = grade(rgb, paper, i)
    return (out * 255).astype(np.uint8)


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else "out/video.mp4"
    only = None
    if len(sys.argv) > 2:
        only = [int(x) for x in sys.argv[2].split(",")]
    surf = cairo.ImageSurface(cairo.FORMAT_RGB24, W, H)
    c = cairo.Context(surf)
    c.set_antialias(cairo.ANTIALIAS_GOOD)
    paper = make_paper()
    if only is not None:
        for i in only:
            img = render_frame(i, surf, c, paper)
            Image.fromarray(img).save(f"{out}_{i:04d}.png")
        return
    n = int(DUR * FPS)
    ff = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-vf", "fps=24",
                           "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
                           out], stdin=subprocess.PIPE)
    for i in range(n):
        ff.stdin.write(render_frame(i, surf, c, paper).tobytes())
        if i % 60 == 0:
            print(i, n, flush=True)
    ff.stdin.close()
    ff.wait()


if __name__ == "__main__":
    main()
