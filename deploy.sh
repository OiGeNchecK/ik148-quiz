#!/usr/bin/env bash
# Замінює вміст репозиторію OiGeNchecK/ik148-quiz на тренажер German B1
# і готує його до GitHub Pages.
#
# Запуск (у теці проєкту, поряд із package.json):
#   chmod +x deploy.sh && ./deploy.sh
#
# Автентифікація використовується ТА, ЩО ВЖЕ НАЛАШТОВАНА у твоєму git
# (credential helper / збережений токен / SSH). Скрипт нічого не вводить за тебе.

set -e

REPO_URL="https://github.com/OiGeNchecK/ik148-quiz.git"

echo "==> Перевірка, що ми в теці проєкту…"
if [ ! -f package.json ]; then
  echo "✗ Не знайдено package.json. Зайди в теку розпакованого проєкту і запусти знову."
  exit 1
fi

echo "==> Ініціалізація git…"
if [ ! -d .git ]; then
  git init
fi

echo "==> Налаштування remote → $REPO_URL"
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo "==> Коміт…"
git add .
git commit -m "Replace with German B1 grammar trainer" || echo "(нема нових змін для коміту)"
git branch -M main

echo ""
echo "==> УВАГА: наступний крок ПЕРЕЗАПИШЕ старий вміст репозиторію (--force)."
read -r -p "    Продовжити? (y/N) " ans
if [ "$ans" != "y" ] && [ "$ans" != "Y" ]; then
  echo "Скасовано. Нічого не запушено."
  exit 0
fi

echo "==> Push…"
git push -u origin main --force

echo ""
echo "✓ Готово. Тепер увімкни Pages:"
echo "  1. https://github.com/OiGeNchecK/ik148-quiz/settings/pages"
echo "  2. Source → GitHub Actions"
echo "  3. За 1–2 хв сайт буде тут:"
echo "     https://OiGeNchecK.github.io/ik148-quiz/"
