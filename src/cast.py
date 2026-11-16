"""The cast and what each of them does over time."""
import math
from ink import (G, INK, shape, stroke, tube, ell, oval, dot, poly, star, lerp, ease,
                 ease2, mix, darker, ctx, rect_pts)
from people import person, body_xform, head_center, WHITE, SKIN

PAPER = (0.98, 0.96, 0.88)
TROUSERS = (0.22, 0.24, 0.33)


def blink(t, period=3.3, off=0.0):
    return 1.0 if ((t + off) % period) < 0.17 else 0.0


# ------------------------------------------------------------------ people
NIKOLAI = person(name="Nikolai", hair="slick", hair_col=(0.18, 0.13, 0.11), beard=True,
                 W=142, R=86, clothes="blazer_vest", brows="calm", freckles=False)
KOLYA = person(name="Kolya", hair="curtains", hair_col=(0.64, 0.47, 0.30),
               clothes="blazer_sweater", brows="calm")
KOLENKA = person(name="Kolenka", hair="buzz", hair_col=(0.24, 0.19, 0.16), sh=200, W=92,
                 clothes="vneck", brows="sly", eyes="squint", mouth="crooked")
YARIK = person(name="Yarik", hair="mop", hair_col=(0.95, 0.82, 0.46), clothes="polo",
               brows="sly", mouth="smirk")
DENIS = person(name="Denis", hair="bowl", hair_col=(0.17, 0.13, 0.11), W=100, ears=1.5,
               clothes="halfzip_beige", brows="smug", mouth="smirk")
ILYAS = person(name="Ilyas", hair="wave", hair_col=(0.47, 0.31, 0.19), clothes="check",
               brows="busy")
KIRILL = person(name="Kirill", hair="curls", hair_col=(0.68, 0.50, 0.32), curl_r=0.34,
                clothes="knitgrey", mouth="laugh")
NIKITA = person(name="Nikita", hair="curls", hair_col=(0.16, 0.12, 0.10), curl_r=0.25,
                glasses="clear", clothes="halfzip_white", mouth="grin")
IGOR = person(name="Igor", hair="bangs", hair_col=(0.80, 0.76, 0.62), clothes="hoodie",
              mouth="grin", mouth_wide=1.55)
AMAN = person(name="Aman", hair="longdark", hair_col=(0.14, 0.11, 0.10), clothes="cardigan",
              W=124)
DIMA = person(name="Dima", hair="quiff", hair_col=(0.45, 0.30, 0.19), glasses="gold",
              clothes="tee_tied", brows="tired")
SERYOZHA = person(name="Seryozha", hair="side", hair_col=(0.17, 0.13, 0.11), glasses="black",
                  clothes="sweatshirt_olive", big_eye=1.25, brows="busy", mouth="line")

GIRLS = [
    person(name="g1", lashes=True, hair="pigtails", hair_col=(0.86, 0.45, 0.20), bow=(0.92, 0.30, 0.30),
           clothes="girl", top_col=(0.85, 0.35, 0.30), W=100, R=80),
    person(name="g2", lashes=True, hair="bob", hair_col=(0.20, 0.14, 0.11), bow=(0.95, 0.85, 0.35),
           clothes="girl", top_col=(0.30, 0.55, 0.55), W=98, R=80),
    person(name="g3", lashes=True, hair="ponytail", hair_col=(0.93, 0.80, 0.48), bow=(0.35, 0.55, 0.85),
           clothes="girl", top_col=(0.90, 0.70, 0.30), W=98, R=80),
    person(name="g4", lashes=True, hair="pigtails", hair_col=(0.50, 0.30, 0.17), bow=(0.95, 0.95, 0.95),
           clothes="girl", top_col=(0.88, 0.55, 0.62), W=100, R=80),
]


# ------------------------------------------------------------------ props
def notebook(x0, x1, scribble=0.0, seed=0):
    poly([(x0, -26), (x1, -26), (x1 + 10, 14), (x0 - 10, 14)], PAPER, 4)
    stroke([((x0 + x1) / 2, -26), ((x0 + x1) / 2 + 1, 14)], 3, darker(PAPER, 0.75))
    n = int(4 * min(1.0, scribble)) + 1
    for i in range(n):
        y = -18 + i * 8
        xs = [x0 + 8 + k * (x1 - x0 - 16) / 6 for k in range(7)]
        pts = [(xx, y + (3 if k % 2 else -1)) for k, xx in enumerate(xs)]
        stroke(pts, 2, (0.35, 0.40, 0.65))


def pen_spin(hx, hy, t):
    a = t * 9.0
    dx, dy = 40 * math.cos(a), 14 * math.sin(a)
    stroke([(hx - dx, hy - dy - 20), (hx + dx, hy + dy - 20)], 8, (0.85, 0.25, 0.2))
    stroke([(hx + dx * 0.85, hy + dy * 0.85 - 20), (hx + dx, hy + dy - 20)], 8, INK)
    # little spin arcs
    for k in range(3):
        aa = a - 0.6 - k * 0.35
        x, y = hx + 52 * math.cos(aa), hy - 20 + 20 * math.sin(aa)
        dot(x, y, 3, INK, 0.6 - k * 0.18)


def spanish_book(t):
    red, yel = (0.80, 0.22, 0.17), (0.95, 0.78, 0.28)
    for s in (-1, 1):
        pts = [(0, -10), (s * 118, -22), (s * 112, -168), (0, -150)]
        sv = shape(pts, red, 5, smooth=False)
        c = ctx()
        c.save()
        from ink import clip_to
        clip_to(sv)
        poly([(-130, -115), (130, -125), (130, -62), (-130, -52)], yel, 0, ink=None)
        c.restore()
        shape(pts, None, 5, smooth=False)
    stroke([(0, -10), (0, -150)], 6)
    # page edges peeking above
    stroke([(-104, -172), (0, -156), (104, -172)], 3, PAPER)


def flashcards(t):
    for i, (x, y, r) in enumerate([(-175, -6, -0.2), (-140, 2, 0.15), (150, -4, 0.25)]):
        c = ctx()
        c.save()
        c.translate(x, y)
        c.rotate(r)
        poly([(-30, -14), (30, -14), (30, 14), (-30, 14)], WHITE, 3.5)
        stroke([(-18, -2), (-6, -5), (4, 1), (16, -3)], 2.5, (0.75, 0.25, 0.25))
        c.restore()


def laptop(t):
    poly([(-128, -18), (128, -18), (140, 6), (-140, 6)], (0.55, 0.56, 0.6), 4.5)
    poly([(-112, -22), (112, -22), (106, -150), (-106, -150)], (0.70, 0.72, 0.76), 5)
    # screen glow spilling over the top
    oval(0, -158, 100, 12, (1.0, 0.98, 0.75), 0, alpha=0.45, ink=None)


def sparkles(t, seed=0):
    for k in range(9):
        ph = (t * 0.9 + k / 9.0) % 1.0
        ang = -math.pi / 2 + (k - 4) * 0.33 + 0.15 * math.sin(k * 3.1)
        r = 30 + 230 * ph
        x = r * math.cos(ang) * 1.2
        y = -158 + r * math.sin(ang) * 0.9
        size = 16 * math.sin(math.pi * ph) + 3
        col = [(1.0, 0.92, 0.35), (0.6, 0.9, 1.0), (1.0, 0.6, 0.75)][k % 3]
        star(x, y, size, col, rot=t * 3 + k, lw=3)


def phone(t):
    c = ctx()
    poly([(-30, -128), (30, -128), (28, -40), (-28, -40)], (0.18, 0.18, 0.22), 4.5)
    dot(-14, -114, 5, (0.4, 0.4, 0.45))
    # glow
    oval(0, -138, 40, 10, (0.75, 0.9, 1.0), 0, alpha=0.4, ink=None)


def juice(t):
    c = ctx()
    # glass
    shape([(-30, -120), (30, -120), (24, 0), (-24, 0)], (0.85, 0.95, 1.0), 4.5, smooth=False,
          alpha=0.6)
    poly([(-28, -92), (28, -92), (24, -2), (-24, -2)], (0.98, 0.62, 0.15), 0, ink=None)
    shape([(-30, -120), (30, -120), (24, 0), (-24, 0)], None, 4.5, smooth=False)
    stroke([(-28, -92), (28, -92)], 3, (0.85, 0.45, 0.1))
    # straw
    stroke([(8, -60), (20, -150), (42, -172)], 9, (0.95, 0.35, 0.40))
    stroke([(8, -60), (20, -150), (42, -172)], 3, WHITE)
    stroke([(-16, -110), (-14, -40)], 4, WHITE, alpha=0.8)


def cobweb(x, y, s=1.0):
    col = (0.97, 0.97, 0.95)
    for k in range(5):
        a = math.pi * 0.0 + k * (math.pi / 2) / 4
        stroke([(x, y), (x + 110 * s * math.cos(a), y + 110 * s * math.sin(a))], 2.5, col)
    for ring in (30, 55, 80, 105):
        pts = []
        for k in range(5):
            a = k * (math.pi / 2) / 4
            rr = ring * s * (0.92 if k % 2 else 1.0)
            pts.append((x + rr * math.cos(a), y + rr * math.sin(a)))
        stroke(pts, 2.2, col)
    # tiny spider
    sy = y + 95 * s + 10 * math.sin(G.get("t", 0) * 1.3)
    stroke([(x + 70 * s, y + 70 * s), (x + 70 * s, sy)], 1.5, col)
    oval(x + 70 * s, sy + 6, 7, 8, INK, 0, ink=None)


def tumbleweed(x, y, t, r=82):
    col = (0.62, 0.45, 0.24)
    rot = t * 5.0
    c = ctx()
    c.save()
    c.translate(x, y)
    c.rotate(rot)
    for k in range(9):
        a0 = k * 0.7
        pts = [(r * math.cos(a0 + j * 0.9) * (0.6 + 0.4 * ((j + k) % 2)),
                r * math.sin(a0 + j * 0.9) * (0.6 + 0.4 * ((j * 3 + k) % 2))) for j in range(7)]
        stroke(pts, 5.5, darker(col, 0.7) if k % 2 else col)
    shape(ell(0, 0, r, r, n=12), None, 5, ink=darker(col, 0.5))
    c.restore()


# ------------------------------------------------------------------ actions
def act_girl(i):
    ph = i * 1.7
    sp = 13 + i * 2.5

    def f(t):
        return dict(eyes="open", look=(0.2 * math.sin(t + ph), 1.0), lid=0.35,
                    mouth="smile", hy=10 + 2 * math.sin(t * 2 + ph), hrot=4 * math.sin(t * 1.3 + ph),
                    arms=[dict(side=1, pts=[(128, -40), (55 + 16 * math.sin(t * sp + ph),
                                                         -6 + 4 * math.sin(t * sp * 2))], hand="pen"),
                          dict(side=-1, pts=[(-128, -30), (-52, 0)])],
                    props=lambda t: notebook(-80, 100, 1.0))
    return f


def act_nikolai(t):
    cyc = (t - 7.0) % 2.8
    up = 1.0 if cyc < 1.15 else 0.0
    nod = math.sin(cyc / 1.15 * math.pi * 3) if up else 0.0
    if up:
        hand = (40, -8)
    else:
        hand = (40 + 22 * ((cyc * 0.9) % 1.0), -6 + 3 * math.sin(cyc * 18))
    return dict(eyes="happy" if up else "open", look=(0, 0.8), lid=0.12,
                mouth="smile", hy=(-4 + 10 * max(0, nod)) if up else 12, hrot=2 * nod,
                arms=[dict(side=1, pts=[(165, -40), hand], hand="pen"),
                      dict(side=-1, pts=[(-165, -30), (-70, 2)])],
                props=lambda t: notebook(-100, 110, 0.8))


def act_kolya(t):
    return dict(eyes="open", look=(0.15 * math.sin(t * 0.7), 0.15), lid=max(0.1, blink(t, 3.1, 0.4)),
                mouth="smile", hy=-6, hrot=1.5 * math.sin(t * 0.8),
                arms=[dict(side=1, pts=[(132, -36), (62, -10)], hand="pen"),
                      dict(side=-1, pts=[(-132, -30), (-60, 0)])],
                props=lambda t: notebook(-90, 95, 0.4))


def act_kolenka(t):
    return dict(head_front=True, by=72, hy=196, hx=-10 + 4 * math.sin(t * 0.9),
                hrot=-6 + 3 * math.sin(t * 0.9), eyes="squint", look=(0.8, 0), mouth="crooked",
                arms=[dict(side=-1, pts=[(-150, -24), (-80, -14)]),
                      dict(side=1, pts=[(150, -40), (112, -30)])],
                props_after=lambda t: pen_spin(132, -30, t))


def act_yarik(t):
    sway = math.sin(t * 1.7)
    pose = dict(brot=6 * sway, hrot=4 * math.sin(t * 1.7 + 0.6), lid=0.55, eyes="open",
                look=(0.3, 0.2), mouth="smirk")
    P = YARIK
    f = body_xform(pose)
    hcx, hcy = head_center(P, pose)
    cx, cy = f(hcx, hcy + P["R"] * 1.05)
    pose["arms"] = [dict(side=-1, pts=[(-80, -12), (cx - 14, cy + 14)]),
                    dict(side=1, pts=[(80, -12), (cx + 14, cy + 14)])]
    return pose


def act_denis(t):
    return dict(hy=-12, hrot=-5 + 1.5 * math.sin(t * 0.8), brot=-2, eyes="open",
                look=(0.2, -0.8), lid=0.45, brows="smug", mouth="smirk",
                arms=[dict(side=-1, pts=[(-185, -270), (-70, -345)], hand="none", layer="back",
                           cuff=False),
                      dict(side=1, pts=[(185, -270), (70, -345)], hand="none", layer="back",
                           cuff=False)])


def act_ilyas(t):
    m = int(t * 7) % 4
    mouth = ["o", "talk", "o", "line"][m]
    flip = (t * 0.8) % 1.0
    lift = math.sin(math.pi * min(1, flip / 0.4)) * 60 if flip < 0.4 else 0
    return dict(hy=26, look=(0.1 * math.sin(t * 3), 1), lid=0.3, mouth=mouth,
                mouth_amt=0.5 + 0.3 * (m % 2), brows="busy", brow_raise=0.03,
                hrot=3 * math.sin(t * 2.3),
                props=lambda t: flashcards(t),
                arms=[dict(side=-1, pts=[(-150, -60), (-112, -95)]),
                      dict(side=1, pts=[(165, -40), (140, -20 - lift)])],
                props_after=lambda t: (spanish_book(t), _card(140, -20 - lift, t)))


def _card(x, y, t):
    c = ctx()
    c.save()
    c.translate(x + 30, y - 10)
    c.rotate(-0.4 + 0.2 * math.sin(t * 6))
    poly([(-28, -16), (28, -16), (28, 16), (-28, 16)], WHITE, 3.5)
    stroke([(-16, 0), (-4, -4), (8, 2), (18, -2)], 2.5, (0.75, 0.25, 0.25))
    c.restore()


def act_kirill(t):
    ha = abs(math.sin(t * 8.5))
    return dict(hy=-2 - 7 * ha, hrot=5 * math.sin(t * 4.2), eyes="happy", mouth="laugh",
                mouth_amt=0.8 + 0.25 * ha, brow_raise=0.05,
                arms=[dict(side=-1, pts=[(-170, -40), (-128, -16 - 12 * abs(math.sin(t * 24)))]),
                      dict(side=1, pts=[(170, -40), (128, -16 - 12 * abs(math.sin(t * 24 + 1.5)))])],
                props_after=lambda t: (laptop(t), sparkles(t)))


def act_nikita(t):
    talk = abs(math.sin(t * 13))
    return dict(brot=10, hx=18, hrot=8 + 3 * math.sin(t * 5), mouth="talk",
                mouth_amt=0.35 + 0.65 * talk, look=(1, 0), brow_raise=0.04 * math.sin(t * 6),
                arms=[dict(side=1, pts=[(190, -130), (205 + 28 * math.sin(t * 7), -240 + 22 * math.cos(t * 7))]),
                      dict(side=-1, pts=[(-30, -90), (60 + 25 * math.sin(t * 8.3 + 1), -175 + 18 * math.sin(t * 8.3))])],
)


def act_igor(t):
    nod = max(0.0, math.sin(t * 4.2))
    return dict(hy=14 + 9 * nod, hrot=-2 + 2 * nod, look=(0, 1), lid=0.35, mouth="grin",
                mouth_amt=1.0, mouth_wide=1.6,
                arms=[dict(side=-1, pts=[(-120, -30), (-34, -66)]),
                      dict(side=1, pts=[(120, -30), (34, -66)])],
                props_after=lambda t: phone(t))


def act_aman(t):
    breath = math.sin(t * 1.4)
    return dict(head_front=True, by=64 + 3 * breath, hy=170 + 2 * breath, hx=4,
                hrot=-16, eyes="closed", mouth="sleep", hair_override="spread",
                arms=[dict(side=-1, pts=[(-175, -10), (-40, -28)], w=58, hand="none"),
                      dict(side=1, pts=[(175, -10), (40, -28)], w=58, hand="none")],
                props_after=lambda t: None, bubble=6 + 16 * (0.5 + 0.5 * math.sin(t * 1.4)))


def act_dima(t):
    s = ease2((t - 29.0) / 7.0)
    pose = dict(by=70 * s, hx=12 + 18 * s, hy=10 * s, hrot=10 + 10 * s, eyes="open",
                lid=0.45 + 0.5 * s + 0.05 * math.sin(t * 2), look=(-0.2, 0.3), mouth="line",
                brows="tired")
    P = DIMA
    f = body_xform(pose)
    hcx, hcy = head_center(P, pose)
    a = math.radians(pose["hrot"])
    lx, ly = 0.78 * P["R"], 0.62 * P["R"]
    hx = hcx + lx * math.cos(a) - ly * math.sin(a)
    hy = hcy + lx * math.sin(a) + ly * math.cos(a)
    cx, cy = f(hx, hy)
    pose["arms"] = [dict(side=-1, pts=[(-120, -26), (-50, -4)]),
                    dict(side=1, pts=[(150, -14), (cx + 16, cy + 22)])]
    pose["props"] = lambda t: notebook(-110, 60, 0.3)
    return pose


def act_seryozha(t):
    hx_ = 60 + 32 * math.sin(t * 23)
    hy_ = -6 + 5 * math.sin(t * 46)

    def after(t):
        for k in range(3):
            stroke([(hx_ + 70, -60 - k * 16), (hx_ + 100, -66 - k * 16)], 3.5, INK)
    return dict(hy=20, look=(0.3 * math.sin(t * 23), 1), lid=0.2, mouth="line",
                brows="busy", hrot=2 * math.sin(t * 11),
                arms=[dict(side=1, pts=[(128, -40), (hx_, hy_)], hand="pen"),
                      dict(side=-1, pts=[(-128, -30), (-58, 0)])],
                props=lambda t: notebook(-90, 110, 1.0 + 0.0 * t), props_after=after)


UPPER = [(KOLENKA, act_kolenka), (YARIK, act_yarik), (DENIS, act_denis), (ILYAS, act_ilyas),
         (KIRILL, act_kirill), (NIKITA, act_nikita), (IGOR, act_igor), (AMAN, act_aman),
         (DIMA, act_dima), (SERYOZHA, act_seryozha), (None, None)]
LOWER = [(GIRLS[0], act_girl(0)), (NIKOLAI, act_nikolai), (KOLYA, act_kolya),
         (GIRLS[1], act_girl(1)), (GIRLS[2], act_girl(2)), (GIRLS[3], act_girl(3))]
