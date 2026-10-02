#!/bin/sh
# GitHub Pages'e yükler (ilk kurulum + sonraki güncellemeler tek komut).
cd "$(dirname "$0")" || exit 1
command -v git >/dev/null 2>&1 || { echo "git kurulu değil."; exit 1; }
[ -d .git ] || { git init -q && git branch -M main; }
git config user.name  >/dev/null 2>&1 || git config user.name  "Burs Sistemi"
git config user.email >/dev/null 2>&1 || git config user.email "burs@localhost"
if ! git remote get-url origin >/dev/null 2>&1; then
  printf "GitHub depo adresi (örn. https://github.com/KULLANICI/BursSistemi.git): "; read -r URL
  [ -n "$URL" ] || { echo "Adres girilmedi."; exit 1; }
  git remote add origin "$URL"
fi
git add -A
git commit -m "guncelle $(date +%Y-%m-%d_%H:%M)" || echo "(değişiklik yok)"
if git push -u origin main; then
  echo; echo "Yüklendi. Birkaç dakika içinde yayında:  depo > Actions sekmesinde 'Demo yayinla' yeşil olmalı."
  echo "Hâlâ açılmıyorsa: depo > Settings > Pages > Source = 'GitHub Actions' olmalı."
else
  echo; echo "Yükleme başarısız. Giriş yapılmamış olabilir:  gh auth login   (ya da GitHub kullanıcı adı + kişisel erişim anahtarı)"
  exit 1
fi
