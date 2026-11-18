"""Build a portable Pressure Atlas file with embedded assets (Python standard library)."""
import argparse
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent / "dist"

def source(name):
    return (ROOT / name).read_text(encoding="utf-8-sig")

def encoded(name):
    return base64.b64encode((ROOT / name).read_bytes()).decode("ascii")

def build(destination):
    html = source("index.html")
    css = source("style.css").replace("url(stadium.jpg)", "url(data:image/jpeg;base64," + encoded("stadium.jpg") + ")")
    html = html.replace('<link rel="stylesheet" href="style.css">', "<style>" + css + "</style>")
    html = re.sub(r'<script src="[^"]+" defer></script>', "", html)
    scripts = "\n".join(source(name) for name in ("data.js", "instruments.js", "app.js"))
    # Both report links reuse a single embedded copy. Decode only on reader request.
    pdf = encoded("report.pdf")
    download = """
    let reportUrl;
    document.querySelectorAll('a[href="report.pdf"]').forEach(link => {
      link.download = 'SupeRR-Selector-report.pdf';
      link.addEventListener('click', () => {
        if (!reportUrl) {
          const bytes = Uint8Array.from(atob('%s'), char => char.charCodeAt(0));
          reportUrl = URL.createObjectURL(new Blob([bytes], {type:'application/pdf'}));
        }
        link.href = reportUrl;
      });
    });
    """ % pdf
    destination.write_text(html.replace("</body>", "<script>" + scripts + download + "</script></body>"), encoding="utf8")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("destination", type=Path)
    build(parser.parse_args().destination)
