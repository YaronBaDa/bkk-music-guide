import json

with open('data/concerts.json') as f:
    concerts = json.load(f)

with open('data/venues.json') as f:
    venues = json.load(f)

def assign_scenes(concert):
    scenes = set()
    genres = [g.lower() for g in concert.get('genres', [])]
    title = concert.get('title', '').lower()
    artists = [a.lower() for a in concert.get('artists', [])]
    all_text = title + ' ' + ' '.join(artists)
    venue_id = concert.get('venueId', '') or ''
    venue = venues.get(venue_id, {})
    venue_name = venue.get('name', '').lower()
    source = concert.get('ticketSource', '').lower()
    is_intl = concert.get('metadata', {}).get('isInternational', False)
    
    # K-Pop detection
    kpop_indicators = ['k-pop', 'kpop', 'fancon', 'fan meet', 'proxie', 'blackpink', 'bts', 'twice', 'stray kids', 'exo', 'nct', 'aespa', 'ive', 'newjeans', 'g-idle', 'sandara park', 'ikon', 'winner', 'bigbang']
    if any(k in all_text for k in kpop_indicators):
        scenes.add('K-Pop')
    
    # International pop/rock acts (Western, Japanese, etc.)
    intl_indicators = ['world tour', 'live in bangkok', 'live in concert', 'tour bangkok']
    known_intl = ['zara larsson', 'fujii kaze', 'ed sheeran', 'coldplay', 'bruno mars', 'taylor swift', 'billie eilish', 'dua lipa']
    if is_intl or any(k in all_text for k in intl_indicators) or any(k in all_text for k in known_intl):
        if 'K-Pop' not in scenes:
            scenes.add('International')
    
    # Classical / Orchestra
    classical_indicators = ['orchestra', 'symphony', 'philharmonic', 'chamber music', 'concerto', 'rbso', 'thailand phil']
    if 'classical' in genres or any(k in all_text for k in classical_indicators):
        scenes.add('Jazz & Classical')
    
    # Festival
    if 'festival' in genres or 'festival' in title:
        scenes.add('Festival')
    
    # Thai Pop
    if 'pop' in genres and 'K-Pop' not in scenes and 'International' not in scenes:
        scenes.add('Thai Pop')
    
    # Indie
    if 'indie' in genres:
        scenes.add('Indie')
    
    # Electronic / Club
    if 'electronic' in genres:
        scenes.add('Electronic')
    
    # Rock & Metal
    if 'rock' in genres or 'metal' in genres:
        scenes.add('Rock & Metal')
    
    # Jazz
    if 'jazz' in genres:
        scenes.add('Jazz & Classical')
    
    # Hip-Hop
    if 'hip-hop' in genres:
        scenes.add('Hip-Hop')
    
    # Livehouse scene
    livehouse_venues = ['blueprint', 'melt livehouse', 'cloud 11 hall', '515 event hall', 'bangkok island', 
                        'speakerbox', 'stoke', 'volume livehouse', 'yaga bar', 'smeltbkk']
    if any(v in venue_name for v in livehouse_venues):
        scenes.add('Livehouse')
    
    # Infer for "other" genre events
    if 'other' in genres:
        # Fan meets
        if any(k in title for k in ['fan fest', 'fan meet', 'fan con', 'fancon']):
            if 'K-Pop' not in scenes:
                scenes.add('International')
        # Club / party events
        elif any(k in title for k in ['pool party', 'rooftop party', 't-dance', 'dj ', 'after party']):
            scenes.add('Electronic')
        # Theatre / performing arts at big venues
        elif any(k in venue_name for k in ['theatre', 'cultural centre', 'national theatre']):
            scenes.add('Jazz & Classical')
        # Livehouse events without genre
        elif any(k in venue_name for k in livehouse_venues):
            scenes.add('Livehouse')
        # Resort/hotel events are likely lifestyle/tourism - skip
        elif any(k in venue_name for k in ['resort', 'hotel ', 'hua hin', 'phuket', 'patong']):
            pass
        # LiveNationTero with no venue often = international act
        elif source == 'livenationtero' and not venue_id:
            if 'K-Pop' not in scenes:
                scenes.add('International')
    
    return sorted(scenes)

scene_counts = {}
for c in concerts:
    scenes = assign_scenes(c)
    c['sceneTags'] = scenes
    for s in scenes:
        scene_counts[s] = scene_counts.get(s, 0) + 1

print('Scene counts:')
for s, n in sorted(scene_counts.items(), key=lambda x: -x[1]):
    print(f'  {s}: {n}')

no_scene = sum(1 for c in concerts if not c['sceneTags'])
print(f'\nNo scene: {no_scene}')

with open('data/concerts.json', 'w') as f:
    json.dump(concerts, f, ensure_ascii=False, indent=2)

print('\nSaved to data/concerts.json')
