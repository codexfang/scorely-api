from PIL import Image, ImageDraw, ImageFont
import os


def generate_og():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), "#020617")
    draw = ImageDraw.Draw(img)

    gradient = Image.new("RGBA", (W, 6), (0, 0, 0, 0))
    for x in range(W):
        ratio = x / W
        r = int(6 + ratio * (139 - 6))
        g = int(182 + ratio * (92 - 182))
        b = int(212 + ratio * (246 - 212))
        for y in range(6):
            gradient.putpixel((x, y), (r, g, b, 255))
    img.paste(gradient, (0, H - 6), gradient)

    try:
        base_dir = os.path.dirname(os.path.abspath(__file__))
        font_path = os.path.join(base_dir, "..", "frontend", "public", "Inter-SemiBold.ttf")
        if not os.path.exists(font_path):
            font_path = "/System/Library/Fonts/Helvetica.ttc"
        title_font = ImageFont.truetype(font_path, 128)
        subtitle_font = ImageFont.truetype(font_path, 44)
        tag_font = ImageFont.truetype(font_path, 32)
    except (IOError, OSError):
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        tag_font = ImageFont.load_default()

    title = "Scorely"
    subtitle = "Vendor Risk Assessment API"
    tagline = "SOC 2  ·  ISO 27001  ·  Risk Scoring  ·  PDF Reports"

    bbox = draw.textbbox((0, 0), title, font=title_font)
    tw = bbox[2] - bbox[0]
    tx = (W - tw) / 2
    ty = H // 2 - 90

    for i, (char, color) in enumerate(zip(title, _gradient_colors(len(title)))):
        draw.text((tx, ty), char, fill=color, font=title_font)
        bc = draw.textbbox((0, 0), char, font=title_font)
        tx += bc[2] - bc[0]

    sb = draw.textbbox((0, 0), subtitle, font=subtitle_font)
    sw = sb[2] - sb[0]
    draw.text(((W - sw) / 2, ty + 155), subtitle, fill="#94a3b8", font=subtitle_font)

    tb = draw.textbbox((0, 0), tagline, font=tag_font)
    tw2 = tb[2] - tb[0]
    draw.text(((W - tw2) / 2, ty + 215), tagline, fill="#475569", font=tag_font)

    out_path = os.path.join(base_dir, "..", "frontend", "public", "og-image.png")
    img.save(out_path, "PNG")
    print(f"OG image saved: {out_path} ({os.path.getsize(out_path)} bytes)")


def _gradient_colors(n):
    colors = []
    for i in range(n):
        ratio = i / max(n - 1, 1)
        r = int(6 + ratio * (139 - 6))
        g = int(182 + ratio * (92 - 182))
        b = int(212 + ratio * (246 - 212))
        colors.append((r, g, b))
    return colors


if __name__ == "__main__":
    generate_og()
