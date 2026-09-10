"""Save Medium's latest entries as candidates without changing the curated homepage."""
import json
from pathlib import Path
import sys
from datetime import timezone
from email.utils import parsedate_to_datetime
import urllib.request
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]

def main():
    if len(sys.argv) > 1:
        feed = Path(sys.argv[1]).read_bytes()
    else:
        request = urllib.request.Request("https://slowframe.medium.com/feed", headers={"User-Agent": "ScottPersonalSite/1.0"})
        with urllib.request.urlopen(request, timeout=30) as response:
            feed = response.read()
    articles = []
    for item in ET.fromstring(feed).findall("./channel/item"):
        title = item.findtext("title", "").strip()
        url = item.findtext("link", "").split("?")[0]
        date = parsedate_to_datetime(item.findtext("pubDate")).astimezone(timezone.utc)
        if not title or not url.startswith("https://slowframe.medium.com/"):
            raise ValueError("Unexpected article data; keeping existing writing.")
        articles.append({"title": title, "url": url, "date": date.date().isoformat()})
    if not articles:
        raise ValueError("Empty feed; keeping existing writing.")
    path = ROOT / "content/latest-writing.json"
    candidates = sorted(articles, key=lambda article: article["date"], reverse=True)[:10]
    path.write_text(json.dumps(candidates, indent=2, ensure_ascii=True) + "\n")
    print(f"Saved {len(candidates)} candidates to content/latest-writing.json. Curated homepage unchanged.")

if __name__ == "__main__":
    main()
