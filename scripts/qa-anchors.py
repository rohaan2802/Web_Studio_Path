from pathlib import Path
import re

html = Path(__file__).resolve().parents[1].joinpath("index.html").read_text(encoding="utf-8")
ids = set(re.findall(r'id="([^"]+)"', html))
hrefs = re.findall(r'href="#([^"]+)"', html)
missing = sorted({h for h in hrefs if h and h not in ids})
print("missing anchors:", missing or "none")
print("lightbox:", "lightbox" in ids)
print("seedDemo:", "seedDemo" in ids)
print("cContact:", "cContact" in ids)
