
import requests
import re
import json
from bs4 import BeautifulSoup
from utils import slugify, derive_genre, is_non_music, event_id_from_key, dedup_key, THAI_MONTHS
from datetime import datetime
import time

FEED_URL = "https://www.thaiticketmajor.com/assets/event.json"
BASE_DETAIL = "https://www.thaiticketmajor.com"

MUSIC_KEYWORDS = [
    "concert", "tour", "live", "music", "festival", "fan meeting",
    "fan-con", "fan con", "showcase", "world tour", "asia tour",
]

def is_music_event(item):
    link = item.get("link", "").lower()
    title = (item.get("title_en", "") + " " + item.get("title_th", "")).lower()
    if "concert" in link:
        return True
    if "ticketmaster" in link and any(k in title for k in MUSIC_KEYWORDS):
        return True
    if any(k in title for k in MUSIC_KEYWORDS):
        return True
    return False

def parse_thai_date(date_text):
    """Parse Thai Buddhist date string like 'วันเสาร์ที่ 11 ตุลาคม 2569' -> ISO"""
    if not date_text:
        return None
    # Extract numbers and Thai month
    match = re.search(r'(\d{1,2})\s*([\u0e01-\u0e49\u0e30-\u0e39.]+)\s*(\d{4})', date_text)
    if not match:
        return None
    day, month_abbr, year_buddhist = match.groups()
    year = int(year_buddhist) - 543
    month = THAI_MONTHS.get(month_abbr.strip(), None)
    if not month:
        return None
    try:
        dt = datetime(year, month, int(day))
        return dt.strftime("%Y-%m-%d")
    except:
        return None

def fetch_feed():
    try:
        r = requests.get(FEED_URL, headers={"User-Agent":"Mozilla/5.0"}, timeout=30)
        data = r.json()
        return [item for item in data if is_music_event(item)]
    except Exception as e:
        print(f"TTM feed error: {e}")
        return []

def parse_detail_page(link):
    try:
        url = link if link.startswith("http") else f"{BASE_DETAIL}{link}"
        r = requests.get(url, headers={"User-Agent":"Mozilla/5.0"}, timeout=30)
        if r.status_code != 200:
            return None, None, None
        soup = BeautifulSoup(r.text, "html.parser")
        date_text = None
        venue = None
        price = None
        for small in soup.find_all("small"):
            txt = small.get_text(strip=True)
            if "วันที่แสดง" in txt or "วันที่" in txt:
                span = small.find_parent().find("span") if small.find_parent() else None
                if span:
                    date_text = span.get_text(strip=True)
            if "สถานที่แสดง" in txt or "สถานที่" in txt:
                span = small.find_parent().find("span") if small.find_parent() else None
                if span:
                    venue = span.get_text(strip=True)
            if "ราคา" in txt or "ราคาบัตร" in txt:
                span = small.find_parent().find("span") if small.find_parent() else None
                if span:
                    price_text = span.get_text(strip=True)
                    pm = re.search(r'(\d{1,3}(?:,\d{3})*)', price_text)
                    if pm:
                        price = int(pm.group(1).replace(",", ""))
        return date_text, venue, price
    except Exception as e:
        print(f"TTM detail error {link}: {e}")
        return None, None, None

def scrape():
    items = fetch_feed()
    print(f"TTM: {len(items)} music events in feed")
    events = []
    for i, item in enumerate(items):
        title = item.get("title_en", "") or item.get("name", "").split("|")[-1].strip()
        link = item.get("link", "")
        poster = item.get("poster", "")
        if not title or not link:
            continue
        date_text, venue, price = parse_detail_page(link)
        date_iso = parse_thai_date(date_text) if date_text else None
        if not date_iso:
            continue
        venue_name = venue or "Thailand"
        venue_id = slugify(venue_name)
        event = {
            "id": event_id_from_key(dedup_key(title, date_iso, venue_name)),
            "title": title,
            "date": {"startDate": date_iso, "endDate": None, "doorTime": None, "dateStatus": "confirmed", "recurrence": None},
            "venueId": venue_id,
            "venueName": venue_name,
            "artists": [],
            "lineup": [],
            "genres": [derive_genre(title)],
            "sceneTags": [],
            "pricing": {"currency": "THB", "fromPrice": price, "toPrice": None, "tiers": [], "notes": ""},
            "ticketUrl": link if link.startswith("http") else f"{BASE_DETAIL}{link}",
            "ticketSource": "ttm",
            "images": {"poster": poster, "banner": None, "gallery": [], "dominantColor": None},
            "status": "upcoming",
            "sourceIds": [{"source": "ttm", "id": link}],
            "metadata": {"createdAt": date_iso, "updatedAt": date_iso, "scrapedAt": datetime.now().isoformat(), "isInternational": False},
            "description": "",
        }
        if is_non_music(title):
            continue
        events.append(event)
        if (i+1) % 10 == 0:
            print(f"  processed {i+1}/{len(items)}, found {len(events)} events")
        time.sleep(1.5)
    print(f"TTM: total events {len(events)}")
    return events

if __name__ == "__main__":
    events = scrape()
    with open("/root/bkk-music-guide/data/ttm_raw.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
