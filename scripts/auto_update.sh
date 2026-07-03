#!/bin/bash
set -e

REPO="/root/bkk-music-guide"
cd "$REPO"

# Ensure git credentials are available for push
export HOME=/root
export PATH="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
git config --global credential.helper store 2>/dev/null || true

# Pull latest changes
git pull origin main || true

# Install Python deps if needed
pip install requests beautifulsoup4 lxml -q 2>/dev/null || true

# Run scrapers
python3 scripts/scrape_lnt.py
python3 scripts/scrape_allevents.py
python3 scripts/scrape_eventpop.py

# Merge
python3 scripts/merge.py

# Copy data to frontend
cp data/concerts.json frontend/public/data/
cp data/venues.json frontend/public/data/

# Build frontend
cd frontend
npm install
NODE_OPTIONS='--max-old-space-size=4096' npx next build
cd ..

# Commit and push if there are changes
if [ -n "$(git status --porcelain)" ]; then
    git add -A
    git commit -m "Auto-update: daily data refresh $(date -u +%Y-%m-%d)"
    git push origin main
fi
