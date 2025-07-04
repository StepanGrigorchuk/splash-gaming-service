# Полезные Git команды для работы с проектом SPLASH

## Основные команды:

### Проверка статуса
git status

### Добавление файлов
git add .                    # Добавить все файлы
git add index.html          # Добавить конкретный файл

### Коммит изменений
git commit -m "Описание изменений"

### Отправка на GitHub
git push origin main

### Получение изменений
git pull origin main

## Работа с ветками:

### Создание новой ветки
git checkout -b feature/new-game

### Переключение между ветками
git checkout main
git checkout gh-pages

### Слияние веток
git merge feature/new-game

## Обновление GitHub Pages:

### Вариант 1: Через слияние
git checkout gh-pages
git merge main
git push origin gh-pages

### Вариант 2: Через Actions (рекомендуется)
# Настройте GitHub Actions для автоматического деплоя

## Полезные алиасы:

git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit

## Откат изменений:

### Отменить последний коммит (но оставить изменения)
git reset --soft HEAD~1

### Отменить изменения в файле
git checkout -- filename

### Посмотреть историю коммитов
git log --oneline
