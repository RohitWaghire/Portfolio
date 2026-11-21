"""
Generate every placeholder image used by this portfolio.

Run from the project root:
    python scripts/generate-placeholders.py

Outputs
    public/projects/project-XX/cover.webp   15 project covers (replace with your work)
    public/avatar.webp                      avatar in the side panel
    public/icon.png, public/apple-icon.png  favicons
    public/opengraph-image.jpg              social share card (Open Graph)
    public/twitter-image.jpg                social share card (Twitter)
    public/showcase/*.webp                  before/after placeholders

Everything is deterministic: same input, same output.
"""

from __future__ import annotations

import colorsys
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
FONT_DIR = Path(os.environ.get("WINDIR", r"C:\Windows")) / "Fonts"

PAPER = (255, 255, 255)
INK = (18, 22, 29)
INK_2 = (58, 70, 86)
INK_3 = (92, 103, 121)
INK_4 = (128, 139, 156)
BLUE = (0, 132, 255)
BLUE_DEEP = (0, 116, 224)
BLUE_INK = (10, 77, 143)
STAR = (255, 128, 30)
LINE = (226, 233, 242)


# --------------------------------------------------------------------------
# helpers
# --------------------------------------------------------------------------
def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    names = (
        ["segoeuib.ttf", "arialbd.ttf", "calibrib.ttf"]
        if bold
        else ["segoeui.ttf", "arial.ttf", "calibri.ttf"]
    )
    for name in names:
        candidate = FONT_DIR / name
        if candidate.exists():
            try:
                return ImageFont.truetype(str(candidate), size)
            except OSError:
                continue
    return ImageFont.load_default(size)


def hsv(h: float, s: float, v: float, a: int | None = None):
    r, g, b = colorsys.hsv_to_rgb(h / 360.0, s, v)
    rgb = (int(r * 255), int(g * 255), int(b * 255))
    return rgb + (a,) if a is not None else rgb


def diagonal_gradient(w: int, h: int, c1, c2, tilt: float = 0.72) -> Image.Image:
    """Cheap smooth two-colour gradient: build small, upscale."""
    sw, sh = 160, 160
    yy, xx = np.mgrid[0:sh, 0:sw]
    t = (xx / (sw - 1)) * (1 - tilt) + (yy / (sh - 1)) * tilt
    t = np.clip(t, 0, 1)[..., None]
    a = np.array(c1[:3], dtype=np.float64)
    b = np.array(c2[:3], dtype=np.float64)
    arr = (a + (b - a) * t).astype(np.uint8)
    return Image.fromarray(arr, "RGB").resize((w, h), Image.Resampling.BICUBIC).convert("RGBA")


def radial_glow(size: tuple[int, int], center: tuple[float, float], radius: float,
                color, alpha: int) -> Image.Image:
    w, h = size
    layer = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    cx, cy = center[0] * w, center[1] * h
    r = radius * min(w, h)
    steps = 14
    for i in range(steps, 0, -1):
        frac = i / steps
        a = int(alpha * (1 - frac) ** 2.2)
        d.ellipse(
            [cx - r * frac, cy - r * frac, cx + r * frac, cy + r * frac],
            fill=color + (a,),
        )
    return layer.filter(ImageFilter.GaussianBlur(radius * 0.35))


def add_grain(img: Image.Image, strength: float = 5.0, seed: int = 7) -> Image.Image:
    rng = np.random.default_rng(seed)
    w, h = img.size
    sw, sh = max(2, w // 2), max(2, h // 2)
    noise = np.clip(rng.normal(128, strength * 4, (sh, sw)), 0, 255).astype(np.uint8)
    noise_img = Image.fromarray(noise, "L").resize((w, h), Image.Resampling.BICUBIC)
    return Image.blend(img, Image.merge("RGBA", (noise_img, noise_img, noise_img, img.getchannel("A"))), 0.05)


def text_size(draw: ImageDraw.ImageDraw, text: str, font) -> tuple[int, int]:
    box = draw.textbbox((0, 0), text, font=font)
    return box[2] - box[0], box[3] - box[1]


def pill(draw: ImageDraw.ImageDraw, xy, text: str, font, fg, bg, border) -> None:
    x, y = xy
    w, h = text_size(draw, text, font)
    pad_x, pad_y = int(font.size * 0.85), int(font.size * 0.55)
    draw.rounded_rectangle(
        [x, y, x + w + pad_x * 2, y + h + pad_y * 2],
        radius=(h + pad_y * 2) // 2,
        fill=bg,
        outline=border,
        width=2,
    )
    draw.text((x + pad_x, y + pad_y - 1), text, font=font, fill=fg)


# --------------------------------------------------------------------------
# project covers
# --------------------------------------------------------------------------
PROJECTS = [
    ("project-01", "Project One", 1600, 899),
    ("project-02", "Project Two", 1334, 1600),
    ("project-03", "Project Three", 1600, 803),
    ("project-04", "Project Four", 1600, 998),
    ("project-05", "Project Five", 1600, 894),
    ("project-06", "Project Six", 1600, 914),
    ("project-07", "Project Seven", 1600, 796),
    ("project-08", "Project Eight", 1600, 898),
    ("project-09", "Project Nine", 1256, 1600),
    ("project-10", "Project Ten", 1600, 804),
    ("project-11", "Project Eleven", 1600, 1002),
    ("project-12", "Project Twelve", 1600, 798),
    ("project-13", "Project Thirteen", 1600, 804),
    ("project-14", "Project Fourteen", 1600, 828),
    ("project-15", "Project Fifteen", 1600, 904),
]

TOTAL = len(PROJECTS)


def make_cover(path: Path, title: str, index: int, w: int, h: int) -> None:
    hue = (10 + index * 24) % 360
    img = diagonal_gradient(w, h, (226, 238, 253), (252, 254, 255))
    img = Image.alpha_composite(
        img, radial_glow((w, h), (0.78, 0.16), 0.8, BLUE, 54)
    )
    img = Image.alpha_composite(
        img, radial_glow((w, h), (0.12, 0.96), 0.9, hsv(hue, 0.35, 0.95), 30)
    )
    img = add_grain(img, strength=2.5, seed=index + 3)

    unit = min(w, h)
    pad = int(unit * 0.062)
    inset = int(unit * 0.035)

    # Everything translucent goes on its own layer, then gets composited,
    # otherwise the alpha is baked into the pixels and saved as solid colour.
    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    d.rounded_rectangle(
        [inset, inset, w - inset, h - inset],
        radius=int(unit * 0.045),
        outline=(18, 22, 29, 20),
        width=2,
    )

    # faint design grid + rings so an empty tile still reads as composed
    for i in range(1, 12):
        x = int(w * i / 12)
        d.line([x, inset + 30, x, h - inset - 30], fill=(18, 22, 29, 8), width=1)
    for k in (0.20, 0.30, 0.40):
        r = unit * k
        cx, cy = w * 0.82, h * 0.26
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  outline=(0, 132, 255, 32), width=2)

    chip_font = load_font(max(15, int(unit * 0.019)), bold=True)
    pill(
        d,
        (pad, pad),
        "P L A C E H O L D E R",
        chip_font,
        BLUE_INK + (255,),
        (255, 255, 255, 215),
        (0, 132, 255, 80),
    )

    meta_font = load_font(max(14, int(unit * 0.018)), bold=True)
    d.text(
        (w - pad, pad + int(chip_font.size * 0.78)),
        f"{index + 1:02d} / {TOTAL:02d}",
        font=meta_font,
        fill=INK_4 + (255,),
        anchor="rs",
    )

    title_font = load_font(int(min(132, max(52, unit * 0.078))), bold=True)
    sub_font = load_font(max(20, int(unit * 0.030)))
    category_font = load_font(max(14, int(unit * 0.018)), bold=True)

    sub_str = "Your work goes here"
    sub_ascent, sub_descent = sub_font.getmetrics()
    title_ascent, title_descent = title_font.getmetrics()
    cat_ascent, cat_descent = category_font.getmetrics()
    gap = int(unit * 0.016)

    sub_baseline = h - int(unit * 0.105)
    sub_top = sub_baseline - sub_ascent
    title_baseline = sub_top - gap - title_descent
    cat_baseline = (title_baseline - title_ascent) - gap - cat_descent

    d.text((pad, cat_baseline), "CATEGORY · YEAR", font=category_font,
           fill=INK_3 + (255,), anchor="ls")
    d.text((pad, title_baseline), title, font=title_font,
           fill=INK + (255,), anchor="ls")
    d.text((pad, sub_baseline), sub_str, font=sub_font,
           fill=INK_4 + (255,), anchor="ls")

    # small warm brand accent
    d.ellipse([w - pad - 10, h - pad - 10, w - pad, h - pad], fill=STAR + (200,))

    img = Image.alpha_composite(img, overlay)

    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, "WEBP", quality=88, method=4)


# --------------------------------------------------------------------------
# identity / social images
# --------------------------------------------------------------------------
def make_avatar(path: Path) -> None:
    size = 320
    img = diagonal_gradient(size, size, (96, 177, 255), (0, 116, 224))
    img = Image.alpha_composite(img, radial_glow((size, size), (0.42, 0.32), 1.0,
                                                (255, 255, 255), 80))
    img = add_grain(img, strength=2.5, seed=11)
    overlay = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    font = load_font(120, bold=True)
    d.text((size / 2, size / 2), "YN", font=font, fill=(255, 255, 255, 245), anchor="mm")
    d.ellipse([6, 6, size - 6, size - 6], outline=(255, 255, 255, 90), width=3)
    img = Image.alpha_composite(img, overlay)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=92, method=4)


def make_icon(path: Path, size: int) -> None:
    scale = 4
    s = size * scale
    grad = diagonal_gradient(s, s, (0, 132, 255), (0, 116, 224))
    mask = Image.new("L", (s, s), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, s - 1, s - 1], radius=int(s * 0.23), fill=255
    )
    img = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    img.paste(grad, (0, 0), mask)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(
        [int(s * 0.03)] * 2 + [s - int(s * 0.03)] * 2,
        radius=int(s * 0.2),
        outline=(255, 255, 255, 60),
        width=max(1, scale),
    )
    font = load_font(int(s * 0.56), bold=True)
    d.text((s / 2, s / 2 - s * 0.02), "Y", font=font, fill=(255, 255, 255, 250), anchor="mm")
    img.resize((size, size), Image.Resampling.LANCZOS).save(path, "PNG")


def make_social_card(path: Path, w: int = 2400, h: int = 1260) -> None:
    img = diagonal_gradient(w, h, (255, 255, 255), (232, 243, 255))
    img = Image.alpha_composite(img, radial_glow((w, h), (0.84, 0.14), 0.85, BLUE, 58))
    img = Image.alpha_composite(img, radial_glow((w, h), (0.1, 0.9), 0.8, (49, 154, 255), 34))
    img = add_grain(img, strength=2.5, seed=23)

    overlay = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    pad = int(h * 0.135)
    chip_font = load_font(30, bold=True)
    pill(d, (pad, pad), "P O R T F O L I O", chip_font,
         BLUE_INK + (255,), (255, 255, 255, 220), (0, 132, 255, 90))

    title_font = load_font(176, bold=True)
    sub_font = load_font(62)
    small_font = load_font(34)

    d.text((pad, h * 0.39), "Your Name", font=title_font, fill=INK + (255,))
    d.text((pad, h * 0.62), "Your headline goes here", font=sub_font,
           fill=INK_3 + (255,))
    d.text((pad, h * 0.77),
           "Placeholder card, replace it in scripts/generate-placeholders.py",
           font=small_font, fill=INK_4 + (255,))

    for i in range(1, 12):
        x = int(w * i / 12)
        d.line([x, int(h * 0.05), x, h - int(h * 0.05)],
               fill=(18, 22, 29, 7), width=1)
    for k in (0.24, 0.36, 0.48):
        r = h * k
        cx, cy = w * 0.86, h * 0.22
        d.ellipse([cx - r, cy - r, cx + r, cy + r],
                  outline=(0, 132, 255, 30), width=3)

    # warm brand accent
    d.ellipse([w - pad - 26, pad + 6, w - pad, pad + 32], fill=STAR + (235,))

    d.rounded_rectangle(
        [int(h * 0.045)] * 2 + [w - int(h * 0.045), h - int(h * 0.045)],
        radius=int(h * 0.045),
        outline=(18, 22, 29, 22),
        width=3,
    )

    img = Image.alpha_composite(img, overlay)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.convert("RGB").save(path, "JPEG", quality=90, optimize=True)


# --------------------------------------------------------------------------
# before / after case study screens
# --------------------------------------------------------------------------
AFTER_BG = (247, 250, 255)
AFTER_PANEL = (255, 255, 255)
AFTER_INK = (18, 22, 29)
AFTER_MUTED = (92, 103, 121)
AFTER_LINE = (226, 233, 242)
AFTER_ACCENT = (0, 116, 224)

BEFORE_BG = (236, 234, 229)
BEFORE_PANEL = (222, 220, 213)
BEFORE_INK = (128, 125, 119)
BEFORE_MUTED = (150, 147, 141)
BEFORE_LINE = (200, 197, 190)
BEFORE_ACCENT = (47, 111, 235)


def make_dashboard(path: Path, after: bool) -> None:
    w = h = 1600
    bg = AFTER_BG if after else BEFORE_BG
    panel = AFTER_PANEL if after else BEFORE_PANEL
    ink = AFTER_INK if after else BEFORE_INK
    muted = AFTER_MUTED if after else BEFORE_MUTED
    line = AFTER_LINE if after else BEFORE_LINE
    accent = AFTER_ACCENT if after else BEFORE_ACCENT

    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    m = 90
    r = 22 if after else 4
    sidebar_w = 300

    # sidebar
    d.rounded_rectangle([m, m, m + sidebar_w, h - m], radius=r, fill=panel if after else (214, 212, 205))
    logo_font = load_font(34, bold=True)
    d.ellipse([m + 32, m + 32, m + 32 + 34, m + 32 + 34], fill=accent)
    d.text((m + 82, m + 34), "Dashboard", font=logo_font, fill=ink)
    nav_font = load_font(27)
    for i, label in enumerate(["Overview", "Reports", "Settings", "Team"]):
        y = m + 120 + i * 62
        if after and i == 0:
            d.rounded_rectangle([m + 20, y - 12, m + sidebar_w - 20, y + 40],
                                radius=14, fill=(accent[0], accent[1], accent[2]))
            d.text((m + 40, y - 1), label, font=nav_font, fill=(255, 252, 245))
        else:
            d.text((m + 40, y - 1), label, font=nav_font, fill=muted)

    content_left = m + sidebar_w + (40 if after else 18)
    content_right = w - m

    # header
    head_font = load_font(48, bold=True)
    d.text((content_left, m + 6), "Overview", font=head_font, fill=ink)
    btn_w, btn_h = 200, 62
    bx = content_right - btn_w
    d.rounded_rectangle([bx, m + 8, bx + btn_w, m + 8 + btn_h],
                        radius=btn_h // 2 if after else 2, fill=accent)
    d.text((bx + btn_w / 2, m + 8 + btn_h / 2), "New report" if after else "Submit",
           font=load_font(25, bold=True), fill=(255, 252, 245), anchor="mm")

    # stat cards
    top = m + 118
    card_h = 210
    if after:
        gap = 28
        card_w = (content_right - content_left - gap * 2) / 3
        xs = [content_left + i * (card_w + gap) for i in range(3)]
        widths = [card_w] * 3
    else:
        widths = [300, 250, 330]
        xs = [content_left, content_left + 315, content_left + 590]
    labels = ["Revenue", "Active users", "Conversion"]
    values = ["$24,180", "1,284", "4.6%"]
    for i, (x, cw) in enumerate(zip(xs, widths)):
        d.rounded_rectangle([x, top, x + cw, top + card_h], radius=r, fill=panel)
        d.text((x + 28, top + 28), labels[i] if after else "Lorem ipsum",
               font=load_font(24, bold=after), fill=muted)
        d.text((x + 28, top + 74), values[i] if after else "111",
               font=load_font(52, bold=True), fill=ink)
        d.text((x + 28, top + 152), "+12% this month" if after else "some text",
               font=load_font(21), fill=accent if after else muted)

    # chart panel
    chart_top = top + card_h + 42
    chart_bottom = h - m - 330
    d.rounded_rectangle([content_left, chart_top, content_right, chart_bottom],
                        radius=r, fill=panel)
    if after:
        d.text((content_left + 36, chart_top + 34), "Revenue over time",
               font=load_font(26, bold=True), fill=muted)
        bars = [0.42, 0.58, 0.5, 0.72, 0.64, 0.86, 0.78, 0.94]
        area_h = (chart_bottom - chart_top) - 170
        bw = 46
        start = content_left + 60
        for i, v in enumerate(bars):
            x = start + i * (bw + 34)
            bh = int(area_h * v)
            d.rounded_rectangle([x, chart_bottom - 50 - bh, x + bw, chart_bottom - 50],
                                radius=10, fill=(158, 205, 255))
    else:
        widths = [28, 56, 34, 62, 30, 50, 44, 58]
        for i, bw in enumerate(widths):
            x = content_left + 40 + i * 86 + (i % 3) * 6
            bh = int((chart_bottom - chart_top) * (0.45 + ((i * 37) % 40) / 100))
            d.rectangle([x, chart_bottom - 40 - bh, x + bw, chart_bottom - 40],
                        fill=(206, 204, 197))

    # table
    t_top = chart_bottom + 42
    d.rounded_rectangle([content_left, t_top, content_right, h - m], radius=r, fill=panel)
    row_font = load_font(23)
    for i in range(3):
        y = t_top + 40 + i * 62
        d.text((content_left + 30, y), f"Placeholder row {i + 1}" if after else "row item",
               font=row_font, fill=ink if after else muted)
        d.text((content_right - 180, y), "View all" if after else "link",
               font=load_font(21, bold=after), fill=accent if after else muted)
        if i < 2:
            d.line([content_left + 30, y + 46, content_right - 30, y + 46],
                   fill=line, width=2)

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=88, method=4)


def make_hero(path: Path, after: bool) -> None:
    w, h = 2400, 1349
    bg = AFTER_BG if after else BEFORE_BG
    panel = AFTER_PANEL if after else BEFORE_PANEL
    ink = AFTER_INK if after else BEFORE_INK
    muted = AFTER_MUTED if after else BEFORE_MUTED
    accent = AFTER_ACCENT if after else BEFORE_ACCENT

    img = Image.new("RGB", (w, h), bg)
    d = ImageDraw.Draw(img)
    m = 150
    r = 30 if after else 3

    # nav
    d.text((m, m - 10), "Your Product" if after else "product", font=load_font(40, bold=True), fill=ink)
    nav_font = load_font(26)
    labels = ["Product", "Pricing", "Docs", "Contact"]
    if after:
        xs = [w * 0.47, w * 0.55, w * 0.62, w * 0.685]
        for x, label in zip(xs, labels):
            d.text((x, m + 2), label, font=nav_font, fill=muted)
        d.rounded_rectangle([w - m - 190, m - 22, w - m, m + 42], radius=32, fill=accent)
        d.text((w - m - 95, m + 9), "Get started", font=load_font(24, bold=True),
               fill=(255, 252, 245), anchor="mm")
    else:
        for i, label in enumerate(labels):
            d.text((w * 0.5 + i * 120, m), label, font=nav_font, fill=muted)
        d.rectangle([w - m - 160, m - 20, w - m, m + 40], fill=accent)
        d.text((w - m - 80, m + 8), "Sign up", font=load_font(22, bold=True),
               fill=(255, 255, 255), anchor="mm")

    # headline block
    head_font = load_font(76 if after else 52, bold=True)
    sub_font = load_font(32 if after else 22)
    head_y = int(h * 0.28)
    head1 = "Your product headline" if after else "Lorem ipsum dolor sit"
    head2 = "goes right here" if after else "amet consectetur"
    if after:
        d.text((m, head_y), head1, font=head_font, fill=ink)
        d.text((m, head_y + 96), head2, font=head_font, fill=ink)
        d.text((m, head_y + 226), "A short supporting line that explains the value.",
               font=sub_font, fill=muted)
        by = head_y + 360
        d.rounded_rectangle([m, by, m + 250, by + 74], radius=37, fill=accent)
        d.text((m + 125, by + 37), "Get started", font=load_font(28, bold=True),
               fill=(255, 252, 245), anchor="mm")
        d.rounded_rectangle([m + 276, by, m + 520, by + 74], radius=37,
                            outline=AFTER_LINE, width=3)
        d.text((m + 398, by + 37), "Learn more", font=load_font(28, bold=True),
               fill=ink, anchor="mm")
    else:
        d.text((m, head_y), head1, font=head_font, fill=ink)
        d.text((m, head_y + 50), "amet consectetur adipiscing elit sed do", font=load_font(20), fill=muted)
        d.text((m, head_y + 76), head2, font=head_font, fill=ink)
        by = head_y + 150
        d.rectangle([m, by, m + 170, by + 52], fill=accent)
        d.text((m + 85, by + 26), "Sign up", font=load_font(20, bold=True),
               fill=(255, 255, 255), anchor="mm")
        d.rectangle([m + 190, by, m + 340, by + 52], outline=muted, width=2)
        d.text((m + 265, by + 26), "click here", font=load_font(20), fill=muted, anchor="mm")

    # media block
    mw, mh = (w - m) - (w * 0.48), int(h * 0.34)
    mx = int(w * 0.48)
    my = int(h * 0.30)
    if after:
        d.rounded_rectangle([mx, my, mx + mw, my + mh], radius=36, fill=panel)
        d.rounded_rectangle([mx + 10, my + 10, mx + mw - 10, my + mh - 10],
                            radius=28, fill=(238, 246, 255))
        d.text((mx + mw / 2, my + mh / 2), "Product screenshot", font=load_font(30, bold=True),
               fill=muted, anchor="mm")
    else:
        d.rectangle([mx, my, mx + mw, my + mh], fill=panel, outline=BEFORE_LINE, width=2)
        d.text((mx + mw / 2, my + mh / 2), "image", font=load_font(28), fill=muted, anchor="mm")

    # logo strip
    if after:
        d.text((m, h - m - 20), "Trusted by teams you know", font=load_font(24), fill=muted)
        for i in range(4):
            d.rounded_rectangle([m + 340 + i * 150, h - m - 34, m + 460 + i * 150, h - m + 10],
                                radius=12, fill=(238, 244, 252))

    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, "WEBP", quality=88, method=4)


# --------------------------------------------------------------------------
# main
# --------------------------------------------------------------------------
def main() -> None:
    for i, (slug, title, w, h) in enumerate(PROJECTS):
        make_cover(PUBLIC / "projects" / slug / "cover.webp", title, i, w, h)
        print(f"  cover  {slug}  {w}x{h}")

    make_avatar(PUBLIC / "avatar.webp")
    print("  avatar public/avatar.webp")
    make_icon(PUBLIC / "icon.png", 96)
    make_icon(PUBLIC / "apple-icon.png", 180)
    print("  icons  public/icon.png, public/apple-icon.png")
    make_social_card(PUBLIC / "opengraph-image.jpg")
    make_social_card(PUBLIC / "twitter-image.jpg")
    print("  social public/opengraph-image.jpg, public/twitter-image.jpg")

    make_dashboard(PUBLIC / "showcase" / "dashboard-before.webp", after=False)
    make_dashboard(PUBLIC / "showcase" / "dashboard-after.webp", after=True)
    make_hero(PUBLIC / "showcase" / "hero-before.webp", after=False)
    make_hero(PUBLIC / "showcase" / "hero-after.webp", after=True)
    print("  case   public/showcase/{dashboard,hero}-{before,after}.webp")

    print("\nDone. Replace any of these files with your own images (same names).")


if __name__ == "__main__":
    main()
