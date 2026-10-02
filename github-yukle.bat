@echo off
chcp 65001 >nul
cd /d "%~dp0"
where git >nul 2>nul || (echo git kurulu degil. & pause & exit /b 1)
if not exist .git (git init -q & git branch -M main)
git config user.name >nul 2>nul || git config user.name "Burs Sistemi"
git config user.email >nul 2>nul || git config user.email "burs@localhost"
git remote get-url origin >nul 2>nul || (
  set /p URL=GitHub depo adresi ^(https://github.com/KULLANICI/BursSistemi.git^): 
  git remote add origin %URL%
)
git add -A
git commit -m guncelle
git push -u origin main
echo.
echo Bittiyse: depo ^> Actions sekmesinde "Demo yayinla" yesil olmali. Acilmiyorsa Settings ^> Pages ^> Source = GitHub Actions
pause
