import json
import os
from utils import dedup_key, event_id_from_key, derive_genre, is_non_music
from datetime import datetime

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def merge():
    sources = [
        "/root/bkk-music-guide/data/ticketmelon_raw.json",
        "/root/bkk-music-guide/data/ttm_raw.json",
        "/root/bkk-music-guide/data/lnt_raw.json",
        "/root/bkk-music-guide/data/allevents_raw.json",
        "/root/bkk-music-guide/data/eventpop_raw.json",
    ]
    all_events = []
    for src in sources:
        evs = load_json(src)
        print(f"  {os.path.basename(src)}: {len(evs)} events")
        all_events.extend(evs)

    print(f"Total raw events: {len(all_events)}")

    seen = {}
    merged = []
    for ev in all_events:
        key = dedup_key(ev.get("title"), ev.get("date", {}).get("startDate"), ev.get("venueName"))
        if key in seen:
            existing = seen[key]
            existing["sourceIds"].extend(ev.get("sourceIds", []))
            if not existing.get("images", {}).get("poster") and ev.get("images", {}).get("poster"):
                existing["images"]["poster"] = ev["images"]["poster"]
            p1 = existing.get("pricing", {}).get("fromPrice")
            p2 = ev.get("pricing", {}).get("fromPrice")
            if p2 and (p1 is None or p2 < p1):
                existing["pricing"]["fromPrice"] = p2
            # Merge genres
            for g in ev.get("genres", []):
                if g not in existing.get("genres", []):
                    existing.setdefault("genres", []).append(g)
            continue
        seen[key] = ev
        merged.append(ev)

    # Filter non-music
    merged = [ev for ev in merged if not is_non_music(ev.get("title", ""), ev.get("description", ""))]

    # Sort by date
    merged.sort(key=lambda x: x.get("date", {}).get("startDate") or "9999-99-99")
    print(f"Merged unique events: {len(merged)}")

    # Build venues
    venues = {}
    for ev in merged:
        vid = ev.get("venueId")
        vname = ev.get("venueName", "")
        if not vid and vname:
            vid = "ven-" + event_id_from_key(vname)[:10]
            ev["venueId"] = vid
        if vid and vid not in venues:
            venues[vid] = {
                "id": vid,
                "name": vname,
                "type": "other",
                "address": {"street": "", "district": "", "city": "Bangkok", "mapsUrl": ""},
                "transport": {"bts": [], "mrt": [], "notes": ""},
                "description": "",
                "capacity": None,
                "amenities": [],
                "images": {"hero": None, "gallery": [], "mapEmbed": None},
                "rating": {"score": None, "reviewCount": 0, "source": ""},
                "contact": {"website": "", "phone": "", "instagram": "", "facebook": ""},
                "upcomingEventsCount": 0,
                "pastEventsCount": 0,
                "tags": []
            }
        if vid in venues:
            venues[vid]["upcomingEventsCount"] += 1

    # Remove venueName from events
    for ev in merged:
        ev.pop("venueName", None)

    artists = {}

    with open("/root/bkk-music-guide/data/concerts.json", "w", encoding="utf-8") as f:
        json.dump(merged, f, ensure_ascii=False, indent=2)
    with open("/root/bkk-music-guide/data/venues.json", "w", encoding="utf-8") as f:
        json.dump(venues, f, ensure_ascii=False, indent=2)
    with open("/root/bkk-music-guide/data/artists.json", "w", encoding="utf-8") as f:
        json.dump(artists, f, ensure_ascii=False, indent=2)

    print("Wrote concerts.json, venues.json, artists.json")
    return merged, venues

if __name__ == "__main__":
    merge()
