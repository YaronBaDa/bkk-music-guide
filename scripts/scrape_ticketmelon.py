
import requests
import re
import json
from utils import slugify, derive_genre, is_non_music, event_id_from_key, dedup_key
from datetime import datetime
import time

BASE = "https://www.ticketmelon.com"
SITEMAPS = [f"{BASE}/sitemap-event{i}.xml" for i in range(1, 7)]

BANGKOK_KEYWORDS = [
    "bangkok", "bkk", "krungthep", "sukhumvit", "silom", "sathorn",
    "ratchada", " RCA", "thonglor", "ekkamai", "ari", "ladprao",
    "impact arena", "thunder dome", "union hall", "live arena",
    "lido connect", "de commune", "horn", "mr.fox", "cloud 11",
    "blueprint", "melt livehouse", "speakerbox", "bangkok island",
    "thailand", "thai", "voice space", "515 victory", "street hall",
    "uob live", "siam", "pic-ganesha", "dear friends", "havana",
    "ticc", "thailand cultural", "central world", "emsphere", "emquartier",
    "khlong toei", "khlong tan", "phra khanong", "rama", "ratchathewi",
    "pratunam", "ratchaprasong", "chulalongkorn", "thong lo", "ekkamai",
    "on nut", "bang na", " Srinakarin", " lasalle", "bang kapi",
    "huai khwang", "rama 9", "rama ix", "phetchaburi", "ratchadaphisek",
    "lat phrao", "chatuchak", "mo chit", "ari", "victory monument",
    "saphan kwai", "sanam pao", "senanikom", "kasetsart", "bang sue",
    "tao poon", "bang phlat", "bangkoknoi", "bangkok yai", "thonburi",
    "wongwian yai", "talat phlu", "chuachuen", "ratchaburi", "phetchaburi",
    "hua hin", "pattaya", "chiang mai", "phuket",
]

def fetch_sitemap_urls():
    urls = []
    for sm in SITEMAPS:
        try:
            r = requests.get(sm, headers={"User-Agent":"Mozilla/5.0"}, timeout=30)
            if r.status_code != 200:
                continue
            found = re.findall(r"<loc>(.*?)</loc>", r.text)
            urls.extend(found)
        except Exception as e:
            print(f"Sitemap error {sm}: {e}")
    return list(set(urls))

def ms_to_iso(ms):
    if not ms or ms == 0:
        return None
    try:
        return datetime.fromtimestamp(int(ms) / 1000).isoformat()
    except:
        return None

def is_bangkok_event(event_data, page_text):
    name_val = event_data.get("name", "")
    title = str(name_val) if not isinstance(name_val, str) else name_val
    venue = ""
    v = event_data.get("venue", {})
    if isinstance(v, dict):
        venue = str(v.get("name", "")) + " " + str(v.get("address", ""))
    tz = event_data.get("timezone", {})
    tz_str = ""
    if isinstance(tz, dict):
        tz_str = tz.get("country", "")
    elif isinstance(tz, str):
        tz_str = tz
    combined = (title + " " + venue + " " + tz_str + " " + page_text).lower()
    return any(k in combined for k in BANGKOK_KEYWORDS)

def parse_event_page(url):
    try:
        r = requests.get(url, headers={"User-Agent":"Mozilla/5.0"}, timeout=30)
        if r.status_code != 200:
            return None
        m = re.search(r'<script id="__NEXT_DATA__"[^>]*>({.*?})</script>', r.text, re.S)
        if not m:
            return None
        data = json.loads(m.group(1))
        event = data.get("props", {}).get("pageProps", {}).get("event", {})
        if not event:
            return None
        if not is_bangkok_event(event, r.text):
            return None
        name_val = event.get("name", "")
        title = str(name_val) if not isinstance(name_val, str) else name_val
        start = ms_to_iso(event.get("show_starttime"))
        end = ms_to_iso(event.get("show_endtime"))
        if not start:
            return None
        venue_name = ""
        venue_id = ""
        v = event.get("venue", {})
        if isinstance(v, dict):
            venue_name = str(v.get("name", ""))
            venue_id = slugify(venue_name) if venue_name else ""
        image = ""
        img = event.get("img_poster", "")
        if isinstance(img, str):
            image = img
        elif isinstance(img, dict):
            image = img.get("url", "")
        ticket_url = f"{BASE}/{event.get('eo_slug','')}/{event.get('slug','')}" if event.get('eo_slug') and event.get('slug') else url
        description = event.get("description", "") or ""
        event_obj = {
            "id": event_id_from_key(dedup_key(title, start[:10] if start else None, venue_name)),
            "title": title,
            "date": {"startDate": start[:10] if start else None, "endDate": end[:10] if end else None, "doorTime": start if start else None, "dateStatus": "confirmed", "recurrence": None},
            "venueId": venue_id,
            "venueName": venue_name,
            "artists": [],
            "lineup": [],
            "genres": [derive_genre(title, description)],
            "sceneTags": [],
            "pricing": {"currency": "THB", "fromPrice": None, "toPrice": None, "tiers": [], "notes": ""},
            "ticketUrl": ticket_url,
            "ticketSource": "ticketmelon",
            "images": {"poster": image, "banner": None, "gallery": [], "dominantColor": None},
            "status": "upcoming",
            "sourceIds": [{"source": "ticketmelon", "id": url}],
            "metadata": {"createdAt": start[:10] if start else None, "updatedAt": start[:10] if start else None, "scrapedAt": datetime.now().isoformat(), "isInternational": False},
            "description": description,
        }
        if is_non_music(title, description):
            return None
        return event_obj
    except Exception as e:
        print(f"Parse error {url}: {e}")
        return None

def scrape():
    urls = fetch_sitemap_urls()
    print(f"Ticketmelon: found {len(urls)} URLs")
    events = []
    for i, url in enumerate(urls):
        ev = parse_event_page(url)
        if ev:
            events.append(ev)
        if (i+1) % 50 == 0:
            print(f"  processed {i+1}/{len(urls)}, found {len(events)} events")
        time.sleep(0.3)
    print(f"Ticketmelon: total events {len(events)}")
    return events

if __name__ == "__main__":
    events = scrape()
    with open("/root/bkk-music-guide/data/ticketmelon_raw.json", "w", encoding="utf-8") as f:
        json.dump(events, f, ensure_ascii=False, indent=2)
