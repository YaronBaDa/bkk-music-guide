import requests
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
from utils import derive_genre, is_non_music, event_id_from_key, dedup_key

BASE_URL = "https://www.livenation.co.th"

def parse_date(date_str):
    """Parse various date formats to ISO"""
    if not date_str:
        return None
    date_str = date_str.strip()
    # Try common formats
    for fmt in ["%d %b %Y", "%d %B %Y", "%Y-%m-%d", "%d/%m/%Y", "%b %d, %Y", "%B %d, %Y"]:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def scrape_lnt():
    events = []
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        # Scrape homepage for event links, then individual pages
        resp = requests.get("https://www.livenationtero.co.th/", headers=headers, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Find all event links on homepage
        links = soup.find_all("a", href=True)
        event_urls = []
        for l in links:
            href = l["href"]
            if "/event/" in href and href != "/event/allevents":
                full = href if href.startswith("http") else f"https://www.livenationtero.co.th{href}"
                title = l.get_text(strip=True)
                if title and full not in [u for u, _ in event_urls]:
                    event_urls.append((full, title))

        print(f"LNT homepage events found: {len(event_urls)}")

        for url, title in event_urls[:20]:
            try:
                # Try to get date from URL or title if possible
                start_date = None
                venue_name = ""
                image_url = ""
                
                # Quick scrape of event page for more details
                er = requests.get(url, headers=headers, timeout=15)
                if er.status_code == 200:
                    esoup = BeautifulSoup(er.text, "html.parser")
                    # Look for date
                    date_el = esoup.select_one("[class*=date], time, .event-date")
                    if date_el:
                        start_date = parse_date(date_el.get_text(strip=True))
                    # Look for venue
                    venue_el = esoup.select_one("[class*=venue], .venue")
                    if venue_el:
                        venue_name = venue_el.get_text(strip=True)
                    # Image
                    img_el = esoup.select_one("img[class*=hero], img[class*=banner], img[class*=poster]")
                    if img_el:
                        image_url = img_el.get("src") or img_el.get("data-src", "")

                if is_non_music(title):
                    continue

                key = dedup_key(title, start_date, venue_name)
                event_id = event_id_from_key(key)

                events.append({
                    "id": event_id,
                    "title": title,
                    "date": {
                        "startDate": start_date or datetime.now().strftime("%Y-%m-%d"),
                        "endDate": start_date,
                        "doorTime": None,
                        "dateStatus": "confirmed" if start_date else "tbc",
                        "recurrence": None,
                    },
                    "venueId": None,
                    "venueName": venue_name,
                    "artists": [],
                    "lineup": [],
                    "genres": [derive_genre(title)],
                    "sceneTags": [],
                    "pricing": {"currency": "THB", "fromPrice": None, "toPrice": None, "tiers": [], "notes": ""},
                    "ticketUrl": url,
                    "ticketSource": "livenationtero",
                    "images": {"poster": image_url, "banner": None, "gallery": [], "dominantColor": None},
                    "status": "upcoming",
                    "sourceIds": [{"source": "livenationtero", "id": url}],
                    "metadata": {
                        "createdAt": datetime.now().strftime("%Y-%m-%d"),
                        "updatedAt": datetime.now().strftime("%Y-%m-%d"),
                        "scrapedAt": datetime.now().isoformat(),
                        "isInternational": False,
                    },
                    "description": "",
                })
            except Exception:
                continue
    except Exception as e:
        print(f"LNT scrape error: {e}")

    print(f"LNT events found: {len(events)}")
    with open("/root/bkk-music-guide/data/lnt_raw.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    return events

if __name__ == "__main__":
    scrape_lnt()
