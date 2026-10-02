#!/bin/sh
# Termux / proot Ubuntu / Linux / Mac – tak çalıştır. Sunucuyu başlatır ve tarayıcıda açar.
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8080}"; export PORT
URL="http://localhost:$PORT"
if [ "$(uname -o 2>/dev/null)" = "Android" ]; then
  command -v node >/dev/null 2>&1 || { echo "Node kuruluyor (Termux)…"; pkg install -y nodejs; }
  command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock
  N=node
else
  case "$(uname -m)" in x86_64|amd64) A=linux-x64;; aarch64|arm64) A=linux-arm64;; *) A=none;; esac
  if [ -x "runtime/$A/node" ] && "runtime/$A/node" -v >/dev/null 2>&1; then N="runtime/$A/node"
  elif command -v node >/dev/null 2>&1; then N=node
  elif command -v apt-get >/dev/null 2>&1; then echo "Node kuruluyor (apt)…"; (apt-get update -y && apt-get install -y nodejs) >/dev/null 2>&1; N=node
  else echo "Node bulunamadı. Mac: brew install node"; exit 1; fi
fi
# eski sunucu portu tutuyorsa kapat (yoksa eski arayüz görünür)
for p in /proc/[0-9]*; do n=${p#/proc/}; [ "$n" = "$$" ] && continue; if tr '\0' ' ' < "$p/cmdline" 2>/dev/null | grep -q "server.js"; then kill "$n" 2>/dev/null; fi; done; sleep 1
echo "E-Burs Portalı: $URL   (durdurmak için Ctrl+C)"
(sleep 2; (termux-open-url "$URL" || xdg-open "$URL" || open "$URL") >/dev/null 2>&1) &
exec "$N" server.js
