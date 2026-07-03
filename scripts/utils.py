
import re
from datetime import datetime, timedelta
import hashlib

THAI_MONTHS = {
    "ม.ค.": 1, "ก.พ.": 2, "มี.ค.": 3,
    "เม.ย.": 4, "พ.ค.": 5, "มิ.ย.": 6,
    "ก.ค.": 7, "ส.ค.": 8, "ก.ย.": 9,
    "ต.ค.": 10, "พ.ย.": 11, "ธ.ค.": 12,
    # Full month names
    "มกราคม": 1, "กุมภาพันธ์": 2,
    "มีนาคม": 3, "เมษายน": 4,
    "พฤษภาคม": 5, "มิถุนายน": 6,
    "กรกฎาคม": 7, "สิงหาคม": 8,
    "กันยายน": 9, "ตุลาคม": 10,
    "พฤศจิกายน": 11, "ธันวาคม": 12,
}

NON_MUSIC_KEYWORDS = [
    "comic con", "marathon", "run ", "ride ", "yoga", "workshop", "conference",
    "seminar", "expo", "fair ", "flea market", "badminton", "muay thai",
    "kickboxing", "card ", "cardgame", "tcg", "barber", "business", "sme ",
    "webinar", "bootcamp", "dance camp", "dance class", "cooking class",
    "film screening", "art battle", "runclub", "fun run", "5k", "10k",
    "muaythai", "boxing", "mma ", "fight ", "match ", "tournament",
    "football", "soccer", "basketball", "triathlon", "cycling",
    "climbing", "hiking", "market ", "bazaar", "open house",
    "career fair", "networking", "summit", "training ", "course ",
    "wine tasting", "beer tasting", "fashion show", "dog show",
    "cat expo", "magic show", "circus", "stand-up comedy",
    "poetry slam", "book club", "art exhibition", "gallery opening",
    "photo shoot", "photography", "tech ", "startup", "hackathon",
    "fitness", "gym ", "crossfit", "pilates", "health ", "wellness",
    "charity ", "fundraising", "wedding", "bridal", "birthday party",
    "game night", "board game", "quiz night", "escape room",
    "camping", "glamping", "beach clean", "volunteer",
    "graduation", "reunion", "school ", "university ", "kids ",
    "summer camp", "language ", "cooking ", "baking ",
    "ballet", "traditional dance", "cultural ", "museum ",
    "science ", "robotics", "carnival", "fun fair",
]

def normalise_title(title):
    if not title:
        return ""
    t = title.lower()
    t = re.sub(r"[^\w\s]", " ", t)
    t = re.sub(r"\bin bangkok\b|\bthailand\b|\b20\d{2}\b|\btour\b|\blive\b", "", t)
    return re.sub(r"\s+", " ", t).strip()

def normalise_venue(venue):
    if not venue:
        return ""
    v = venue.lower()
    v = re.sub(r"[^\w\s]", " ", v)
    return re.sub(r"\s+", " ", v).strip()

def dedup_key(title, date_str, venue):
    nt = normalise_title(title)
    nv = normalise_venue(venue)
    return f"{nt}::{date_str or 'TBA'}::{nv}"

def slugify(text):
    s = re.sub(r"[^\w\s-]", "", text.lower())
    s = re.sub(r"\s+", "-", s).strip("-")
    return s[:80]

def derive_genre(title, description=""):
    text = (title + " " + description).lower()
    if any(w in text for w in ["orchestra", "symphony", "violin", "recital", "philharmonic", "classical"]):
        return "classical"
    if any(w in text for w in ["dj ", "techno", "house", "edm", "electronic", "rave", "dance", "dnb", "drum and bass"]):
        return "electronic"
    if any(w in text for w in ["festival", "songkran", "waterzonic"]):
        return "festival"
    if any(w in text for w in ["k-pop", "kpop", "boy group", "girl group"]):
        return "pop"
    if any(w in text for w in ["indie", "shoegaze", "post-rock"]):
        return "indie"
    if any(w in text for w in ["metal", "punk", "hardcore", "screamo", "death metal", "black metal"]):
        return "metal"
    if any(w in text for w in ["hip hop", "hiphop", "rap", "r&b", "rnb", "trap"]):
        return "hip-hop"
    if any(w in text for w in ["jazz", "blues", "soul"]):
        return "jazz"
    if any(w in text for w in ["rock"]):
        return "rock"
    if any(w in text for w in ["pop", "t-pop", "j-pop"]):
        return "pop"
    return "other"

def is_non_music(title, description=""):
    text = (title + " " + description).lower()
    return any(kw in text for kw in NON_MUSIC_KEYWORDS)

def event_id_from_key(key):
    return hashlib.md5(key.encode()).hexdigest()[:12]
