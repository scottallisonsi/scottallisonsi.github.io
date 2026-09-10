"""Import public Goodreads RSS shelves without credentials or publisher blurbs."""
import argparse
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
import json
from pathlib import Path
import urllib.request
import urllib.parse
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
PROFILE = '17702968'
SHELVES = ['read', 'to-read', 'currently-reading', 'did-not-finish']

def date(value):
    if not value or not value.strip():
        return None
    try:
        return parsedate_to_datetime(value).astimezone(timezone.utc).date().isoformat()
    except (TypeError, ValueError):
        return None

def integer(value):
    try:
        return int(value) or None
    except (TypeError, ValueError):
        return None

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cached-dir', type=Path, help='Read saved SHELF.xml files instead of fetching.')
    args = parser.parse_args()
    books = {}
    for shelf in SHELVES:
        page = 1
        seen = set()
        while True:
            if args.cached_dir:
                path = args.cached_dir / (f'{shelf}.xml' if page == 1 else f'{shelf}-{page}.xml')
                feed = path.read_bytes()
            else:
                query = urllib.parse.urlencode({'shelf': shelf, 'per_page': 200, 'page': page})
                request = urllib.request.Request(f'https://www.goodreads.com/review/list_rss/{PROFILE}?{query}', headers={'User-Agent': 'ScottPersonalLibrary/1.0'})
                with urllib.request.urlopen(request, timeout=40) as response:
                    feed = response.read()
            root = ET.fromstring(feed)
            if root.tag != 'rss' or root.find('channel') is None:
                raise ValueError('Unexpected feed format; previous library left intact.')
            items = root.findall('./channel/item')
            for item in items:
                book_id = item.findtext('book_id', '')
                if not book_id.isdigit() or book_id in seen:
                    raise ValueError('Missing or repeated book ID; previous library left intact.')
                seen.add(book_id)
                if book_id in books:
                    raise ValueError('A book appears on multiple exclusive shelves; previous library left intact.')
                cover = item.findtext('book_large_image_url') or item.findtext('book_medium_image_url') or ''
                if cover and (urllib.parse.urlparse(cover).hostname not in ['i.gr-assets.com', 'images.gr-assets.com'] or not cover.startswith('https://')):
                    raise ValueError('Unexpected cover host.')
                title = item.findtext('title', '').strip()
                author = item.findtext('author_name', '').strip()
                if not title or not author:
                    raise ValueError('Missing title or author.')
                rating = integer(item.findtext('user_rating'))
                if rating is not None and rating not in range(1, 6):
                    raise ValueError('Invalid user rating.')
                books[book_id] = {
                    'id': book_id, 'title': title, 'author': author, 'shelf': shelf,
                    'rating': rating, 'pages': integer(item.findtext('book/num_pages')),
                    'published': integer(item.findtext('book_published')),
                    'added': date(item.findtext('user_date_added')),
                    'read': date(item.findtext('user_read_at')),
                    'url': f'https://www.goodreads.com/book/show/{book_id}',
                    'coverSource': cover,
                }
            if len(items) < 200:
                break
            page += 1
            if page > 100:
                raise ValueError('Pagination limit exceeded.')
    if not books:
        raise ValueError('Empty library; previous library left intact.')
    output = {
        'profileUrl': 'https://www.goodreads.com/scottsi',
        'updated': datetime.now(timezone.utc).date().isoformat(),
        'source': 'Public Goodreads shelf RSS feeds',
        'books': sorted(books.values(), key=lambda book: book['added'] or '', reverse=True),
    }
    path = ROOT / 'content/books.json'
    temporary = path.with_suffix('.json.tmp')
    temporary.write_text(json.dumps(output, ensure_ascii=True, indent=2) + '\n')
    temporary.replace(path)
    print(f"Imported {len(books)} books. Next: cache covers and run node scripts/build.mjs.")

if __name__ == '__main__':
    main()
