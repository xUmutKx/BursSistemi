#!/bin/sh
cd "$(dirname "$0")" || exit 1
git add -A
git commit -m "guncelle $(date +%Y-%m-%d_%H:%M)" || true
git push
