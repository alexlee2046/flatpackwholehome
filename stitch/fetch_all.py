#!/usr/bin/env python3
"""Fetch every screen of a Stitch project and fully localize it for offline use.

Pulls: HTML pages, screenshots, per-screen metadata (prompt/theme/design system),
every remote image referenced in the HTML, the Tailwind Play CDN script, and all
Google Fonts (CSS + woff2). Rewrites all HTML to relative local paths.

Usage: STITCH_API_KEY=... python3 fetch_all.py [PROJECT_ID]
"""
import html as htmllib
import hashlib
import json
import os
import re
import subprocess
import sys

PROJECT_ID = sys.argv[1] if len(sys.argv) > 1 else "1318977181840355780"
ROOT = os.path.dirname(os.path.abspath(__file__))
API = f"https://stitch.googleapis.com/v1/projects/{PROJECT_ID}"
KEY = os.environ["STITCH_API_KEY"]
UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/126.0 Safari/537.36")

SHORT_NAMES = {
    "1c616d40952b4452a5d4a0077b209b3f": "asset-swatch-box-closeup",
    "83fe0d1362de435ebf67b2d85c94f0a2": "asset-boxes-to-room-split",
    "360549df99ec4392972cc65ae5d8fde8": "asset-snap-joint-exploded",
    "a60af60b1b4a4772bc5be353d4d8a843": "asset-swatch-box-hero",
}


def slugify(title, sid):
    if sid in SHORT_NAMES:
        return SHORT_NAMES[sid]
    t = title.replace("MODULIV — ", "").replace("(Desktop)", "")
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return (t or sid[:8])[:50]


def curl(url, out=None, font_ua=False):
    cmd = ["curl", "-L", "-f", "-sS", "--retry", "3", "--retry-delay", "2",
           "--max-time", "180", "--compressed"]
    if font_ua:
        cmd += ["-A", UA]
    if out:
        cmd += ["-o", out]
    cmd.append(url)
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode != 0:
        raise RuntimeError(f"curl failed: {url[:90]} -> {r.stderr.strip()[:200]}")
    if out:
        if not os.path.exists(out) or os.path.getsize(out) < 100:
            raise RuntimeError(f"empty download: {out}")
        return None
    return subprocess.run(cmd, capture_output=True).stdout


def ext_from_url(url):
    m = re.search(r"\.(png|jpe?g|webp|gif|svg|avif)(?:[?#]|$)", url, re.I)
    return (m.group(1).lower().replace("jpeg", "jpg") if m else "png")


def download(url, out):
    return curl(url, out=out)


# ---- 1. screens list (fresh if possible, cached fallback) -------------------
for attempt in range(3):
    r = subprocess.run(["curl", "-sS", "--max-time", "30", "-H",
                        f"X-Goog-Api-Key: {KEY}", f"{API}/screens",
                        "-o", "/tmp/stitch_screens.json"],
                       capture_output=True, text=True)
    if r.returncode == 0 and os.path.getsize("/tmp/stitch_screens.json") > 100:
        break
    print(f"screens list attempt {attempt + 1} failed: {r.stderr.strip()[:120]}")
screens = json.load(open("/tmp/stitch_screens.json"))["screens"]
print(f"screens: {len(screens)}")

for d in ("html", "screenshots", "meta", "assets", "vendor/fonts"):
    os.makedirs(os.path.join(ROOT, d), exist_ok=True)

manifest, guidelines = [], []


# ---- 2. per-screen raw pulls ------------------------------------------------
for s in screens:
    sid, title = s["id"], s.get("title", "")
    slug = slugify(title, sid)
    entry = {"id": sid, "slug": slug, "title": title}

    inner = (s.get("designSystem") or {}).get("designSystem") or {}
    meta = {k: s.get(k) for k in ("id", "title", "prompt", "theme",
                                  "screenMetadata", "width", "height",
                                  "generatedBy", "screenType")}
    meta["designSystem"] = inner
    with open(f"{ROOT}/meta/{slug}.json", "w") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)
    if inner.get("styleGuidelines"):
        guidelines.append(f"## {title}\n\n{inner['styleGuidelines']}\n")

    hc = s.get("htmlCode") or {}
    if hc.get("downloadUrl"):
        download(hc["downloadUrl"], f"{ROOT}/html/{slug}.html")
        entry["html"] = f"html/{slug}.html"
    sc = s.get("screenshot") or {}
    if sc.get("downloadUrl"):
        download(sc["downloadUrl"], f"{ROOT}/screenshots/{slug}.png")
        entry["screenshot"] = f"screenshots/{slug}.png"
    manifest.append(entry)
    print(f"  pulled {slug}: html={bool(entry.get('html'))} "
          f"img={bool(entry.get('screenshot'))}")

with open(f"{ROOT}/DESIGN-SYSTEM.md", "w") as f:
    f.write("# MODULIV — Stitch Design System (exported)\n\n")
    f.write(f"Style guidelines and theme tokens exported from Stitch project "
            f"{PROJECT_ID}.\n\n")
    f.write("\n".join(guidelines))


# ---- 3. vendor tailwind + fonts ---------------------------------------------
def vendor_tailwind(all_html):
    tw = {m for h in all_html
          for m in re.findall(r"https://cdn\.tailwindcss\.com[^\"'\s<)]*", h)}
    if not tw:
        return {}
    url = sorted(tw)[0]
    download(url, f"{ROOT}/vendor/tailwind.js")
    print(f"  vendored tailwind: {os.path.getsize(f'{ROOT}/vendor/tailwind.js')//1024}KB")
    return {u: "vendor/tailwind.js" for u in tw}


def vendor_fonts(all_html):
    urls = {m for h in all_html
            for m in re.findall(r"https://fonts\.googleapis\.com/css2\?[^\"'\s<)]+", h)}
    mapping = {}
    for u in sorted(urls):
        real = htmllib.unescape(u)
        css = (curl(real, font_ua=True) or b"").decode("utf-8", "replace")
        name = "fonts-" + hashlib.md5(real.encode()).hexdigest()[:8] + ".css"
        for fu in sorted(set(re.findall(r"url\((https://fonts\.gstatic\.com[^)]+)\)", css))):
            fn = ("f" + hashlib.md5(fu.encode()).hexdigest()[:10]
                  + os.path.splitext(fu.split("?")[0])[1])
            download(fu, f"{ROOT}/vendor/fonts/{fn}")
            css = css.replace(fu, fn)
        with open(f"{ROOT}/vendor/fonts/{name}", "w") as f:
            f.write(css)
        mapping[u] = "vendor/fonts/" + name
        print(f"  vendored {name}: {len(css) // 1024}KB css")
    return mapping


def localize(page, base, mapper, tw_map, font_map):
    txt = open(page).read()
    n_imgs = 0

    # remote images -> local
    urls = set()
    for m in re.findall(r"https://[^\"'\s<>)]+", txt):
        u = htmllib.unescape(m)
        host = u.split("/")[2] if "/" in u else ""
        if any(d in host for d in ("fonts.g", "cdn.tailwindcss.com")):
            continue
        if ("googleusercontent.com" in host or "storage.googleapis.com" in host
                or "stitch" in host
                or re.search(r"\.(png|jpe?g|webp|gif|svg|avif)(?:[?#]|$)", u, re.I)):
            urls.add(u)
    for u in sorted(urls):
        rel = mapper(u)                      # e.g. assets/<slug>/<file>
        local = base + rel if base else rel  # html pages need ../ prefix
        for form in {u, htmllib.escape(u, quote="")}:
            if form in txt:
                txt = txt.replace(form, local)
        n_imgs += 1

    for raw, local in tw_map.items():
        for form in {raw, raw.replace("&", "&amp;")}:
            if form in txt:
                txt = txt.replace(form, base + local if base else local)

    for raw, rel in font_map.items():
        local = base + rel if base else rel
        for form in {raw, htmllib.escape(raw, quote="")}:
            if form in txt:
                txt = txt.replace(form, local)

    open(page, "w").write(txt)
    return n_imgs


all_html = [open(f"{ROOT}/html/{e['slug']}.html").read() for e in manifest
            if e.get("html")] + [open(f"{ROOT}/index.html").read()]
tw_map = vendor_tailwind(all_html)
font_map = vendor_fonts(all_html)


def make_mapper(slug):
    def mapper(u):
        name = hashlib.md5(u.encode()).hexdigest()[:10] + "." + ext_from_url(u)
        rel = f"assets/{slug}/{name}"
        os.makedirs(f"{ROOT}/assets/{slug}", exist_ok=True)
        download(u, f"{ROOT}/{rel}")
        print(f"  img {rel}")
        return rel
    return mapper


for e in manifest:
    if e.get("html"):
        page = f"{ROOT}/html/{e['slug']}.html"
        n = localize(page, "../", make_mapper(e["slug"]), tw_map, font_map)
        print(f"  localized html/{e['slug']}.html ({n} remote images)")

n = localize(f"{ROOT}/index.html", "", make_mapper("_index"), tw_map, font_map)
print(f"  localized index.html ({n} remote images)")

with open(f"{ROOT}/fetch-manifest.json", "w") as f:
    json.dump({"projectId": PROJECT_ID, "screens": manifest},
              f, ensure_ascii=False, indent=2)
print("done")
