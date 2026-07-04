#!/bin/bash
# restore-projects.sh — Recover all active projects after environment wipe
# Run this after any session restart where /root/ was cleared.
set -e

echo "=== Restoring projects from GitHub ==="

# Ensure git credentials exist
if [ ! -f ~/.git-credentials ]; then
    echo "ERROR: ~/.git-credentials missing. Run git auth setup first."
    exit 1
fi

git config --global credential.helper store 2>/dev/null || true
git config --global user.email "yaron@bada.dev"
git config --global user.name "YaronBaDa"

cd /root

# Define all active projects
# format: "dirname|repo_url|post_clone_cmd"
declare -a PROJECTS=(
    "bkk-music-guide|https://github.com/YaronBaDa/bkk-music-guide.git|pip install requests beautifulsoup4 lxml -q 2>/dev/null || true; cd frontend && npm install 2>/dev/null || true"
    "decade|https://github.com/YaronBaDa/decade.git|"
    "autocomplete-showdown|https://github.com/YaronBaDa/autocomplete-showdown.git|"
    "emoji-match|https://github.com/YaronBaDa/emoji-match.git|"
    "fade|https://github.com/YaronBaDa/fade.git|"
    "mojimath|https://github.com/YaronBaDa/mojimath.git|"
    "thai-dai|https://github.com/YaronBaDa/thai-dai.git|"
)

for proj in "${PROJECTS[@]}"; do
    IFS='|' read -r DIR URL POSTCMD <<< "$proj"
    if [ -d "$DIR" ]; then
        echo "[OK] $DIR exists — pulling latest"
        cd "$DIR"
        git pull origin main 2>/dev/null || git pull origin master 2>/dev/null || true
        cd /root
    else
        echo "[CLONE] $DIR from $URL"
        git clone "$URL" "$DIR"
        if [ -n "$POSTCMD" ]; then
            echo "[SETUP] Running post-clone for $DIR"
            cd "$DIR"
            eval "$POSTCMD" || echo "WARN: post-clone for $DIR had errors (may be expected)"
            cd /root
        fi
    fi
done

echo "=== Restore complete ==="
echo "Projects in /root/:"
ls -d /root/*/ 2>/dev/null || true
