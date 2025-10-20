# 🚀 Установка Frontend на Timeweb

## 📋 Что нужно

- ✅ Хостинг Timeweb с доступом к файловому менеджеру
- ✅ Код проекта (скачанный из poehali.dev)
- ✅ PHP Backend уже установлен и работает

## 🎯 Вариант 1: Автоматическая публикация (Рекомендуется)

### В редакторе poehali.dev:

1. **Нажмите "Опубликовать"** в правом верхнем углу
2. Проект автоматически соберётся и разместится
3. Готово! Сайт доступен по ссылке от poehali.dev

**Преимущества:**
- ✅ Автоматическая сборка и публикация
- ✅ Бесплатный SSL сертификат
- ✅ Быстрая загрузка через CDN
- ✅ Обновления одним кликом

---

## 🎯 Вариант 2: Ручная загрузка на Timeweb

Если нужно разместить на собственном домене Timeweb.

### Шаг 1: Скачай код проекта

1. В редакторе poehali.dev нажми **"Скачать → Скачать билд"**
2. Сохрани архив `build.zip` на компьютер
3. Распакуй архив - внутри будет папка `dist`

### Шаг 2: Подготовь файлы

В папке `dist` будут:
```
dist/
├── index.html          ← Главная страница
├── assets/             ← CSS, JS файлы
│   ├── index-xxx.js
│   └── index-xxx.css
└── vite.svg            ← Иконка
```

### Шаг 3: Настрой API подключение

**ВАЖНО!** Проверь что в файлах правильный API URL.

Создай файл `dist/config.js`:
```javascript
window.API_BASE_URL = 'https://ce876244.tw1.ru/php-backend';
```

### Шаг 4: Загрузи на Timeweb

#### Вариант А: Через Файловый менеджер

1. Войди в панель Timeweb
2. Открой **"Файловый менеджер"**
3. Перейди в папку **`public_html`**
4. **Загрузи все файлы** из папки `dist`:
   - `index.html`
   - Папка `assets/`
   - `vite.svg`
   - `config.js` (если создал)

**Результат:**
```
public_html/
├── index.html           ← Frontend
├── assets/              ← JS и CSS
├── php-backend/         ← Backend (уже был)
└── config.js            ← Конфиг API
```

#### Вариант Б: Через FTP (FileZilla)

1. Скачай [FileZilla](https://filezilla-project.org/)
2. Подключись к Timeweb (данные FTP в панели)
3. Перетащи все файлы из `dist/` в `public_html/`

### Шаг 5: Настрой .htaccess для SPA

Создай файл `public_html/.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  
  # Если это не файл и не директория - перенаправить на index.html
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/php-backend
  RewriteRule ^ index.html [L]
</IfModule>

# Кэширование для статических файлов
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/svg+xml "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/font-woff "access plus 1 year"
  ExpiresByType application/font-woff2 "access plus 1 year"
</IfModule>

# Gzip сжатие
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>
```

### Шаг 6: Проверь работу

Открой в браузере: `https://ce876244.tw1.ru/`

**Должно работать:**
- ✅ Главная страница загружается
- ✅ Форма регистрации отображается
- ✅ Можно создать команду (проверь в админке)
- ✅ Турнирная сетка показывается

**Проверь консоль браузера (F12):**
- ❌ Не должно быть ошибок CORS
- ❌ Не должно быть 404 ошибок
- ✅ Запросы к API должны быть успешны (200 OK)

---

## 🔧 Настройка API URL

Если API находится на другом домене, обнови конфиг.

### Способ 1: Через config.js (рекомендуется)

Создай `public_html/config.js`:
```javascript
window.API_BASE_URL = 'https://ваш-домен.ru/php-backend';
```

И добавь в `index.html` (перед остальными скриптами):
```html
<script src="/config.js"></script>
```

### Способ 2: Через переменные окружения (для сборки)

В файле `.env` в проекте:
```env
VITE_API_URL=https://ce876244.tw1.ru/php-backend
```

Пересобери проект:
```bash
npm run build
```

---

## 🌐 Подключение собственного домена

### Шаг 1: Добавь домен в Timeweb

1. Панель Timeweb → **"Домены"**
2. **"Добавить домен"**
3. Укажи свой домен (например, `tournament.ru`)

### Шаг 2: Настрой DNS

У регистратора домена создай A-запись:
```
A  @  IP-адрес-timeweb
```

IP можно узнать в панели Timeweb.

### Шаг 3: Получи SSL сертификат

В панели Timeweb:
1. **"SSL сертификаты"**
2. **"Получить Let's Encrypt"**
3. Выбери свой домен
4. Дождись выпуска (1-5 минут)

### Шаг 4: Открой сайт

Теперь доступен по адресу: `https://ваш-домен.ru`

---

## 🐛 Решение проблем

### Проблема: Белый экран

**Причины:**
1. Неправильный путь к файлам
2. JS файлы не загрузились

**Решение:**
1. Открой консоль браузера (F12)
2. Посмотри ошибки в разделе "Console"
3. Проверь что файлы в папке `assets/` загружены
4. Проверь путь в `index.html` к JS файлам

### Проблема: CORS ошибка

**Решение:**
Проверь `public_html/php-backend/config.php`:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
```

### Проблема: 404 при переходе по ссылкам

**Решение:**
Проверь что файл `.htaccess` создан и содержит правила для SPA.

### Проблема: Не сохраняются команды

**Решение:**
1. Проверь что PHP Backend работает: `https://ce876244.tw1.ru/php-backend/api/health.php`
2. Проверь консоль браузера на ошибки API
3. Проверь что база данных настроена

### Проблема: Старая версия сайта

**Решение:**
Очисти кэш браузера:
- Chrome/Edge: Ctrl + Shift + Delete
- Firefox: Ctrl + Shift + Delete
- Safari: Cmd + Option + E

Или открой в режиме инкогнито для проверки.

---

## 📊 Структура проекта на сервере

```
public_html/
├── index.html                    ← Frontend (React)
├── assets/
│   ├── index-abc123.js          ← Собранный JS
│   └── index-abc123.css         ← Собранный CSS
├── config.js                     ← API конфиг
├── .htaccess                     ← Правила роутинга
└── php-backend/                  ← Backend API
    ├── api/
    │   ├── register.php
    │   ├── teams.php
    │   └── ...
    ├── db/
    │   └── simple-setup.sql
    └── config.php
```

---

## ✅ Контрольный чеклист

После загрузки проверь:

- [ ] Главная страница открывается
- [ ] Форма регистрации работает
- [ ] Команды сохраняются в БД
- [ ] Админка доступна
- [ ] Турнирная сетка отображается
- [ ] Нет ошибок в консоли (F12)
- [ ] API запросы возвращают 200 OK
- [ ] SSL сертификат работает (https://)
- [ ] Переходы между страницами работают
- [ ] Редактирование команд работает

---

## 🎯 Обновление сайта

Когда нужно обновить frontend:

### Через poehali.dev:
1. Внеси изменения в редакторе
2. Нажми **"Опубликовать"**
3. Готово!

### Вручную:
1. Скачай новый билд: **"Скачать → Скачать билд"**
2. Удали старые файлы `index.html` и `assets/` на сервере
3. Загрузи новые файлы из `dist/`
4. Очисти кэш браузера

---

## 📞 Поддержка

При проблемах:
1. Проверь логи PHP: Панель Timeweb → "Логи" → "Логи PHP"
2. Проверь консоль браузера (F12)
3. Проверь что Backend работает: `/php-backend/api/health.php`
4. Напиши в сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy

---

## 🚀 Готово!

Frontend установлен и работает на Timeweb!

**Доступ к сайту:** https://ce876244.tw1.ru/  
**Админка:** https://ce876244.tw1.ru/php-backend/api/admin-login.php
