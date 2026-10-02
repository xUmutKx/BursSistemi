#!/bin/sh
# Termux tek komut kurulum:  sh kur.sh
# BursSistemi*.zip dosyasını bulur, ~/BursSistemi içine açar (data/ klasörüne dokunmaz),
# sunucuyu başlatır ve tarayıcıda otomatik açar.
ZIP=""
for d in "$PWD" "$HOME/storage/downloads" "$HOME/downloads" /sdcard/Download "$HOME"; do
  f=$(ls -t "$d"/BursSistemi*.zip 2>/dev/null | head -n1)
  [ -n "$f" ] && ZIP="$f" && break
done
[ -z "$ZIP" ] && { echo "BursSistemi.zip bulunamadı. Termux'ta önce:  termux-setup-storage"; exit 1; }
command -v unzip >/dev/null 2>&1 || { pkg install -y unzip 2>/dev/null || apt-get install -y unzip; }
echo "Açılıyor: $ZIP"
unzip -o -q "$ZIP" -d "$HOME" || exit 1
cd "$HOME/BursSistemi" && exec sh baslat.sh
