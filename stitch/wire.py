#!/usr/bin/env python3
"""Wire all Stitch pages into one navigable site.

Maps dead href="#"/href="/" anchors and CTA <button>s to their real local
pages by label text, and adds a fixed "All Pages" chip linking back to the
gallery index. Idempotent: anchors already pointing at *.html are skipped.
"""
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))
HTML = ROOT

HOME = "index.html"
KIT = "1-bedroom-kit-builder.html"
PDP = "modusofa-product-detail-page.html"
SWATCH = "free-swatch-box-material-discovery.html"
HIW = "how-it-works-craft-logistics.html"

# ordered: first match wins
RULES = [
    (r"^(MODULIV|The Flat Set)$", HOME),                      # logo
    (r"BRAND|VI|GUIDELINES", "brand.html"),
    (r"SWATCH", SWATCH),
    (r"HOW IT WORKS", HIW),
    (r"CRAFTSMANSHIP|JOURNEY", None),            # in-page sections, keep dead
    (r"MOVE-?IN BUND|^\d-BEDROOM|\bBUNDLES?\b|EXPLORE MOVE", KIT),
    (r"MODULAR SOFA|LIVING ROOM|LIVING", PDP),
    (r"BEDROOM|SURFACES|WFH|STORAGE|DINING", KIT),
    (r"^HOME$", HOME),
]
SKIP = r"CART|BUY NOW|CHECKOUT|NEWSLETTER|SUBSCRIBE"

ANCHOR = re.compile(r"<a\b[^>]*?href=(?:\"#\"|\"/\")[^>]*?>(.*?)</a>",
                    re.S | re.I)
BUTTON = re.compile(r"<button\b[^>]*?>(.*?)</button>", re.S | re.I)


def text_of(inner):
    t = re.sub(r"<[^>]+>", " ", inner)
    t = t.replace("&amp;", "&")
    return re.sub(r"\s+", " ", t).strip().upper()


def map_label(text):
    if re.search(SKIP, text):
        return None
    for pat, target in RULES:
        if re.search(pat, text):
            return target
    return None


def wire_page(fname):
    path = os.path.join(HTML, fname)
    txt = open(path).read()
    n_links = n_btns = 0

    def sub_anchor(m):
        nonlocal n_links
        target = map_label(text_of(m.group(1)))
        if not target:
            return m.group(0)
        n_links += 1
        return m.group(0).replace('href="#"', f'href="{target}"', 1) \
                         .replace('href="/"', f'href="{target}"', 1)

    # buttons: inject onclick into the opening tag (no layout change)
    def sub_button(m):
        nonlocal n_btns
        target = map_label(text_of(m.group(1)))
        if not target:
            return m.group(0)
        n_btns += 1
        open_tag = re.match(r"<button\b[^>]*>", m.group(0), re.I).group(0)
        new_tag = open_tag[:-1] + f" onclick=\"location.href='{target}'\">"
        return m.group(0).replace(open_tag, new_tag, 1)

    txt = ANCHOR.sub(sub_anchor, txt)
    txt = BUTTON.sub(sub_button, txt)

    if "wire-chip" not in txt:  # back-to-index chip
        chip = ('<a class="wire-chip" href="../index.html" style="position:fixed;'
                'left:16px;bottom:16px;z-index:9999;background:rgba(26,28,29,.85);'
                'color:#fff;padding:8px 14px;border-radius:999px;'
                "font:600 12px 'Plus Jakarta Sans',system-ui,sans-serif;"
                'text-decoration:none;letter-spacing:.02em;'
                'box-shadow:0 2px 10px rgba(0,0,0,.25)" '
                'onmouseover="this.style.background=\'#8a4725\'" '
                'onmouseout="this.style.background=\'rgba(26,28,29,.85)\'">'
                '&#9776; All Pages</a>\n')
        txt = txt.replace("</body>", chip + "</body>", 1)

    open(path, "w").write(txt)
    return n_links, n_btns


total_l = total_b = 0
for f in sorted(os.listdir(HTML)):
    if f.endswith(".html"):
        l, b = wire_page(f)
        total_l += l
        total_b += b
        print(f"  {f}: {l} links wired, {b} buttons wired")
print(f"total: {total_l} links + {total_b} buttons")
