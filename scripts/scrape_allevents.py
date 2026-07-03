import requests
import json
import re
from datetime import datetime
from bs4 import BeautifulSoup
from utils import derive_genre, is_non_music, event_id_from_key, dedup_key

BASE_URL = "https://allevents.in"

def parse_date_ae(date_str):
    if not date_str:
        return None
    date_str = date_str.strip()
    for fmt in ["%d %b %Y", "%d %B %Y", "%Y-%m-%d", "%b %d, %Y", "%B %d, %Y", "%a %b %d %Y"]:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    # Try to extract date from text like "Jul 15, 2026"
    m = re.search(r"([A-Za-z]{3,9})\s+(\d{1,2}),?\s*(\d{4})", date_str)
    if m:
        try:
            return datetime.strptime(f"{m.group(2)} {m.group(1)} {m.group(3)}", "%d %B %Y").strftime("%Y-%m-%d")
        except ValueError:
            try:
                return datetime.strptime(f"{m.group(2)} {m.group(1)} {m.group(3)}", "%d %b %Y").strftime("%Y-%m-%d")
            except ValueError:
                pass
    return None

def scrape_allevents():
    events = []
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        }
        # Try Bangkok music events
        urls = [
            "https://allevents.in/bangkok/music",
            "https://allevents.in/bangkok/concerts",
        ]
        for url in urls:
            resp = requests.get(url, headers=headers, timeout=30)
            if resp.status_code != 200:
                continue
            soup = BeautifulSoup(resp.text, "html.parser")

            # AllEvents uses li with event-card class
            cards = soup.select("li.event-card, .event-card, [data-event-id]")
            for card in cards:
                try:
                    title_el = card.select_one("h3, .title, a[itemprop=name], [class*=title]")
                    title = title_el.get_text(strip=True) if title_el else ""
                    if not title:
                        continue

                    link_el = card.select_one("a[href]")
                    href = link_el.get("href", "") if link_el else ""
                    if href and not href.startswith("http"):
                        href = BASE_URL + href

                    date_el = card.select_one(".date, .event-date, [class*=date], time")
                    date_text = date_el.get_text(strip=True) if date_el else ""
                    start_date = parse_date_ae(date_text)

                    venue_el = card.select_one(".venue, [class*=venue], [class*=location]")
                    venue_name = venue_el.get_text(strip=True) if venue_el else ""

                    img_el = card.select_one("img")
                    image_url = ""
                    if img_el:
                        image_url = img_el.get("data-src") or img_el.get("src", "")

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
                        "ticketUrl": href or BASE_URL,
                        "ticketSource": "allevents",
                        "images": {"poster": image_url, "banner": None, "gallery": [], "dominantColor": None},
                        "status": "upcoming",
                        "sourceIds": [{"source": "allevents", "id": href or event_id}],
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
        print(f"AllEvents scrape error: {e}")

    print(f"AllEvents events found: {len(events)}")
    with open("/root/bkk-music-guide/data/allevents_raw.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    return events

if __name__ == "__main__":
    scrape_allevents()
