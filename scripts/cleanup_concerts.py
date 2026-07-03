#!/usr/bin/env python3
"""
Clean up concert data:
1. Remove tbc concerts that are duplicates of confirmed ones
2. Parse Thai Buddhist calendar dates from titles
3. Clean "More Info" artifacts from titles
"""

import json
import re
from difflib import SequenceMatcher
from datetime import datetime

THAI_MONTHS = {
    'ม.ค.': 1, 'ก.พ.': 2, 'มี.ค.': 3, 'เม.ย.': 4, 'พ.ค.': 5, 'มิ.ย.': 6,
    'ก.ค.': 7, 'ส.ค.': 8, 'ก.ย.': 9, 'ต.ค.': 10, 'พ.ย.': 11, 'ธ.ค.': 12,
    'มกราคม': 1, 'กุมภาพันธ์': 2, 'มีนาคม': 3, 'เมษายน': 4, 'พฤษภาคม': 5,
    'มิถุนายน': 6, 'กรกฎาคม': 7, 'สิงหาคม': 8, 'กันยายน': 9, 'ตุลาคม': 10,
    'พฤศจิกายน': 11, 'ธันวาคม': 12,
}


def clean_title(title: str) -> str:
    """Remove scraping artifacts from title."""
    # Remove "More Info" and variations
    title = re.sub(r'More Info\s*', '', title, flags=re.IGNORECASE)
    # Remove trailing whitespace
    title = title.strip()
    return title


def parse_thai_date(title: str) -> str | None:
    """Try to extract a Gregorian date from Thai Buddhist calendar text in title."""
    # Pattern: digits (optional space) Thai month abbr (optional space) Buddhist year
    pattern = r'(\d{1,2})\s*(' + '|'.join(re.escape(k) for k in THAI_MONTHS if '.' in k) + r')\s*(\d{4})'
    m = re.search(pattern, title)
    if m:
        day = int(m.group(1))
        thai_month = m.group(2)
        buddhist_year = int(m.group(3))
        greg_year = buddhist_year - 543
        month = THAI_MONTHS.get(thai_month, 0)
        if month and 2025 <= greg_year <= 2030:
            try:
                dt = datetime(greg_year, month, day)
                return dt.strftime('%Y-%m-%d')
            except ValueError:
                return None
    return None


def title_similarity(a: str, b: str) -> float:
    """Compare cleaned titles for similarity."""
    a_clean = clean_title(a).lower()
    b_clean = clean_title(b).lower()
    return SequenceMatcher(None, a_clean, b_clean).ratio()


def main():
    with open('data/concerts.json', 'r', encoding='utf-8') as f:
        concerts = json.load(f)

    original_count = len(concerts)
    removed_ids = []
    updated_ids = []

    # Find tbc concerts on the scrape date (today) that have confirmed duplicates
    today = '2026-07-03'
    tbc_today = [c for c in concerts if c['date']['dateStatus'] == 'tbc' and c['date']['startDate'] == today]

    # Build lookup by cleaned title for confirmed concerts
    confirmed = [c for c in concerts if c['date']['dateStatus'] == 'confirmed']

    for tbc in tbc_today:
        tbc_title_clean = clean_title(tbc['title'])

        # Check for confirmed duplicate
        has_duplicate = False
        for c in confirmed:
            sim = title_similarity(tbc['title'], c['title'])
            if sim >= 0.7:
                has_duplicate = True
                removed_ids.append((tbc['id'], tbc['title'][:60], c['date']['startDate'], c['title'][:60]))
                break

        if has_duplicate:
            continue

        # Try to parse date from title
        parsed_date = parse_thai_date(tbc['title'])
        if parsed_date and parsed_date != today:
            tbc['date']['startDate'] = parsed_date
            tbc['date']['dateStatus'] = 'parsed_from_title'
            tbc['title'] = clean_title(tbc['title'])
            updated_ids.append((tbc['id'], tbc['title'][:60], parsed_date))
        else:
            # Just clean the title
            tbc['title'] = clean_title(tbc['title'])

    # Remove duplicates
    keep_ids = {c['id'] for c in concerts}
    for rid, _, _, _ in removed_ids:
        keep_ids.discard(rid)

    cleaned = [c for c in concerts if c['id'] in keep_ids]

    # Also clean titles for ALL concerts (remove More Info everywhere)
    for c in cleaned:
        c['title'] = clean_title(c['title'])

    with open('data/concerts.json', 'w', encoding='utf-8') as f:
        json.dump(cleaned, f, ensure_ascii=False, indent=2)

    print(f"Original: {original_count} concerts")
    print(f"Removed:  {len(removed_ids)} duplicate tbc concerts")
    print(f"Updated:  {len(updated_ids)} tbc concerts with parsed dates")
    print(f"Final:    {len(cleaned)} concerts")
    print()
    if removed_ids:
        print("Removed duplicates:")
        for rid, tbc_title, conf_date, conf_title in removed_ids:
            print(f"  {tbc_title}")
            print(f"    -> confirmed on {conf_date}: {conf_title}")
    if updated_ids:
        print("\nUpdated with parsed dates:")
        for uid, title, date in updated_ids:
            print(f"  {date} | {title}")


if __name__ == '__main__':
    main()
