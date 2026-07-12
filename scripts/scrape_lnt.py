import requests
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
from utils import derive_genre, is_non_music, event_id_from_key, dedup_key

BASE_URL = "https://www.livenationtero.co.th"

THAI_MONTHS = {
    "ม.ค.": 1, "ก.พ.": 2, "มี.ค.": 3, "เม.ย.": 4, "พ.ค.": 5, "มิ.ย.": 6,
    "ก.ค.": 7, "ส.ค.": 8, "ก.ย.": 9, "ต.ค.": 10, "พ.ย.": 11, "ธ.ค.": 12,
}

def parse_thai_date(text):
    """Parse Thai date like '26 ธ.ค. 2569' to ISO '2026-12-26'.
    Also handles '28 ส.ค. 2569', '22 ก.ย. 2569', etc.
    Buddhist year 2569 = 2026 CE."""
    if not text:
        return None
    m = re.search(r'(\d{1,2})\s*([\w.]+\.?)\s*(\d{4})', text)
    if not m:
        return None
    day = int(m.group(1))
    month_str = m.group(2).strip()
    year = int(m.group(3))
    # Buddhist calendar (2500-2600) -> subtract 543
    if 2500 <= year <= 2600:
        year -= 543
    # Gregorian (2000-2100)
    elif 2000 <= year <= 2100:
        pass
    else:
        return None
    month = THAI_MONTHS.get(month_str)
    if not month:
        # Try full Thai month names
        full_months = {
            "มกราคม": 1, "กุมภาพันธ์": 2, "มีนาคม": 3, "เมษายน": 4,
            "พฤษภาคม": 5, "มิถุนายน": 6, "กรกฎาคม": 7, "สิงหาคม": 8,
            "กันยายน": 9, "ตุลาคม": 10, "พฤศจิกายน": 11, "ธันวาคม": 12,
        }
        month = full_months.get(month_str)
        if not month:
            return None
    try:
        dt = datetime(year, month, day)
        today = datetime.now()
        # Reject dates more than 2 years in the past (likely data error)
        if (today - dt).days > 730:
            return None
        return dt.strftime("%Y-%m-%d")
    except ValueError:
        return None


def parse_english_date(date_str):
    """Parse English date formats to ISO"""
    if not date_str:
        return None
    date_str = date_str.strip()
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
        resp = requests.get(f"{BASE_URL}/", headers=headers, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "html.parser")

        # Find all event links on homepage
        links = soup.find_all("a", href=True)
        event_urls = []
        for l in links:
            href = l["href"]
            if "/event/" in href and href != "/event/allevents":
                full = href if href.startswith("http") else f"{BASE_URL}{href}"
                title = l.get_text(strip=True)
                if title and full not in [u for u, _ in event_urls]:
                    event_urls.append((full, title))

        print(f"LNT homepage events found: {len(event_urls)}")

        # Pre-compute date mapping by looking for Thai dates in link text
        # The upcoming-shows section on the listing has dates embedded in the link titles
        date_map = {}
        for url, title in event_urls:
            # Try to find Thai date in the full link text
            thai_date = parse_thai_date(title)
            if thai_date:
                date_map[url] = thai_date

        for url, title in event_urls[:20]:
            try:
                start_date = date_map.get(url)
                venue_name = ""
                image_url = ""

                # Visit detail page for venue, image, and date fallback
                er = requests.get(url, headers=headers, timeout=15)
                if er.status_code == 200:
                    esoup = BeautifulSoup(er.text, "html.parser")
                    
                    # Try to find date on detail page if not already found
                    if not start_date:
                        # Look for Thai date in meta description
                        meta_desc = esoup.select_one("meta[name=description]")
                        if meta_desc:
                            desc = meta_desc.get("content", "")
                            thai_date = parse_thai_date(desc)
                            if thai_date:
                                start_date = thai_date
                        
                        # Try CSS selectors
                        if not start_date:
                            date_el = esoup.select_one("[class*=date], time, .event-date, [class*=Date], [class*=time]")
                            if date_el:
                                txt = date_el.get_text(strip=True)
                                start_date = parse_english_date(txt) or parse_thai_date(txt)
                    
                    # Look for venue
                    venue_el = esoup.select_one("[class*=venue], .venue, [class*=Venue], [class*=location]")
                    if venue_el:
                        venue_name = venue_el.get_text(strip=True)
                    
                    # Image
                    img_el = esoup.select_one("img[class*=hero], img[class*=banner], img[class*=poster], img[class*=event]")
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
