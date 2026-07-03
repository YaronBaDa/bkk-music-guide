
import json
import os
from utils import dedup_key, event_id_from_key
from datetime import datetime

def load_json(path):
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def merge():
    tm = load_json("/root/bkk-music-guide/data/ticketmelon_raw.json")
    ttm = load_json("/root/bkk-music-guide/data/ttm_raw.json")
    all_events = tm + ttm
    print(f"Total raw events: {len(all_events)}")

    seen = {}
    merged = []
    for ev in all_events:
        key = dedup_key(ev.get("title"), ev.get("date", {}).get("startDate"), ev.get("venueName"))
        if key in seen:
            # merge sources
            existing = seen[key]
            existing["sourceIds"].extend(ev.get("sourceIds", []))
            # prefer ticketmelon image if ttm has none
            if not existing.get("images", {}).get("poster") and ev.get("images", {}).get("poster"):
                existing["images"]["poster"] = ev["images"]["poster"]
            # prefer lower price
            p1 = existing.get("pricing", {}).get("fromPrice")
            p2 = ev.get("pricing", {}).get("fromPrice")
            if p2 and (p1 is None or p2 < p1):
                existing["pricing"]["fromPrice"] = p2
            continue
        seen[key] = ev
        merged.append(ev)

    # sort by date
    merged.sort(key=lambda x: x.get("date", {}).get("startDate") or "9999-99-99")
    print(f"Merged unique events: {len(merged)}")

    # build venues
    venues = {}
    for ev in merged:
        vid = ev.get("venueId")
        vname = ev.get("venueName", "")
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

    # remove venueName from events (keep only venueId)
    for ev in merged:
        ev.pop("venueName", None)

    # build artists (placeholder)
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
