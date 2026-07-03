import requests
import json
import re
from datetime import datetime
from utils import derive_genre, is_non_music, event_id_from_key, dedup_key
from bs4 import BeautifulSoup

BASE_URL = "https://www.eventpop.me"
API_URL = "https://www.eventpop.me/api/events"

def parse_date_ep(date_str):
    if not date_str:
        return None
    date_str = date_str.strip()
    for fmt in ["%Y-%m-%d", "%d/%m/%Y", "%d %b %Y", "%d %B %Y"]:
        try:
            return datetime.strptime(date_str, fmt).strftime("%Y-%m-%d")
        except ValueError:
            continue
    return None

def scrape_eventpop():
    events = []
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json",
        }
        # Try their API with music category
        params = {"category": "music", "per_page": 100}
        resp = requests.get(API_URL, headers=headers, params=params, timeout=30)

        if resp.status_code == 200:
            data = resp.json()
            items = data if isinstance(data, list) else data.get("events", data.get("data", []))
        else:
            # Fallback: scrape HTML
            resp = requests.get(f"{BASE_URL}/e?category=music", headers=headers, timeout=30)
            soup = BeautifulSoup(resp.text, "html.parser")
            items = []
            cards = soup.select(".event-card, [data-event-id], .event-item")
            for card in cards:
                title_el = card.select_one("h3, .title, a")
                title = title_el.get_text(strip=True) if title_el else ""
                href = title_el.get("href", "") if title_el else ""
                items.append({"title": title, "url": href})

        for item in items:
            try:
                if isinstance(item, dict):
                    title = item.get("title", item.get("name", ""))
                    href = item.get("url", item.get("link", item.get("slug", "")))
                    if href and not href.startswith("http"):
                        href = BASE_URL + ("/e/" + href if not href.startswith("/") else href)
                    start_date = parse_date_ep(item.get("start_date", item.get("date", "")))
                    venue_name = item.get("venue", item.get("location", ""))
                    image_url = item.get("image", item.get("cover", item.get("poster", "")))
                else:
                    continue

                if not title or is_non_music(title):
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
                    "ticketSource": "eventpop",
                    "images": {"poster": image_url, "banner": None, "gallery": [], "dominantColor": None},
                    "status": "upcoming",
                    "sourceIds": [{"source": "eventpop", "id": href or event_id}],
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
        print(f"Eventpop scrape error: {e}")

    print(f"Eventpop events found: {len(events)}")
    with open("/root/bkk-music-guide/data/eventpop_raw.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
    return events

if __name__ == "__main__":
    scrape_eventpop()
