# 🏆 Турнирная система League of Legends

Полнофункциональная система для проведения киберспортивных турниров с регистрацией команд, админ-панелью и Telegram интеграцией.

## 📦 Что входит в проект

1. **React Frontend** - Сайт с формой регистрации и турнирной сеткой
2. **PHP Backend** - API для работы с командами и администрирования
3. **MySQL Database** - База данных с командами, матчами, настройками
4. **Telegram Bot** - Уведомления капитанам команд (опционально)

---

## 🚀 Быстрый старт

### 📥 Шаг 1: Скачай код

В редакторе poehali.dev:
- **"Скачать → Скачать код"** - для полного проекта
- **"Скачать → Скачать билд"** - для готового frontend

### ⚙️ Шаг 2: Настрой базу данных

1. Открой **phpMyAdmin** в панели Timeweb
2. Выбери базу **`ce876244_tournam`** (слева)
3. Вкладка **SQL**
4. Скопируй содержимое `public/php-backend/db/simple-setup.sql`
5. Вставь и нажми **"Выполнить"**

✅ Готово! Таблицы созданы.

### 📤 Шаг 3: Загрузи PHP Backend

1. Открой **Файловый менеджер** Timeweb
2. Перейди в **`public_html`**
3. Загрузи всю папку **`php-backend`** из скачанного архива

**Структура:**
```
public_html/
└── php-backend/
    ├── api/
    ├── db/
    └── config.php
```

### 🌐 Шаг 4: Опубликуй Frontend

**Вариант А - Автоматически (рекомендуется):**
1. В poehali.dev нажми **"Опубликовать"**
2. Готово! Сайт опубликован

**Вариант Б - Вручную на Timeweb:**
1. Скачай **"Скачать → Скачать билд"**
2. Загрузи файлы из `dist/` в `public_html/`
3. Создай `.htaccess` для SPA

---

## 📚 Подробные инструкции

### Для установки на Timeweb:
- **[УСТАНОВКА_НА_TIMEWEB.md](./УСТАНОВКА_НА_TIMEWEB.md)** - Полная инструкция
- **[УСТАНОВКА_FRONTEND_НА_TIMEWEB.md](./УСТАНОВКА_FRONTEND_НА_TIMEWEB.md)** - Только frontend

### Для базы данных:
- **`public/php-backend/db/simple-setup.sql`** 🟢 Быстрая установка
- **`public/php-backend/db/step-by-step.sql`** 🟡 Пошаговая установка
- **`public/php-backend/db/full-setup.sql`** 📖 С документацией

### Для Telegram бота:
- **`telegram-bot-vps/README.md`** - Общая информация
- **`telegram-bot-vps/SETUP-MYSQL.md`** - Установка для MySQL

### Общая документация:
- **[ПОЛНАЯ_ИНСТРУКЦИЯ.md](./ПОЛНАЯ_ИНСТРУКЦИЯ.md)** - Вся установка целиком

---

## ✅ Проверка работы

### 1. Backend API
Открой: `https://ce876244.tw1.ru/php-backend/api/health.php`

Должно показать:
```json
{"status":"ok","database":"connected","timestamp":"..."}
```

### 2. Frontend
Открой: `https://ce876244.tw1.ru/`

Должна быть видна форма регистрации команд.

### 3. База данных
В phpMyAdmin проверь наличие таблиц:
- ✅ `teams`
- ✅ `admin_users`
- ✅ `registration_settings`
- ✅ `matches`
- ✅ `telegram_users`
- ✅ `pending_changes`

---

## 🔐 Доступы

### Админ-панель
**URL:** `https://ce876244.tw1.ru/php-backend/api/admin-login.php`

**Данные:**
- Логин: `@Rywrxuna`
- Пароль: `SmirNova2468`

### База данных
- Имя: `ce876244_tournam`
- Хост: `localhost`
- Данные в панели Timeweb

---

## 🎮 Возможности

### Для участников:
- ✅ Регистрация команды (5 игроков + капитан)
- ✅ Просмотр статуса заявки
- ✅ Редактирование состава
- ✅ Отмена регистрации
- ✅ Уведомления через Telegram

### Для администратора:
- ✅ Модерация заявок команд
- ✅ Управление турнирной сеткой
- ✅ Создание матчей
- ✅ Обновление счёта
- ✅ Экспорт данных в Excel
- ✅ Открытие/закрытие регистрации
- ✅ Отправка уведомлений капитанам

---

## 🛠 Технологии

**Frontend:**
- React 18
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- React Router

**Backend:**
- PHP 7.4+
- MySQL 5.7+
- RESTful API

**Telegram Bot:**
- Python 3.11 / Node.js 22
- Flask / Express
- Webhooks

---

## 📁 Структура проекта

```
tournament/
├── public/
│   └── php-backend/           ← PHP API
│       ├── api/               ← Endpoints
│       ├── db/                ← SQL миграции
│       └── config.php         ← Настройки БД
├── telegram-bot-vps/          ← Telegram бот
│   ├── bot.py                 ← PostgreSQL версия
│   ├── bot-mysql.py           ← MySQL версия
│   └── SETUP-MYSQL.md         ← Инструкция
├── src/                       ← React код
│   ├── components/            ← Компоненты
│   ├── config/                ← Конфиг API
│   └── App.tsx                ← Главный компонент
├── УСТАНОВКА_НА_TIMEWEB.md    ← Инструкция установки
├── ПОЛНАЯ_ИНСТРУКЦИЯ.md       ← Полная документация
└── package.json               ← Зависимости
```

---

## 🐛 Решение проблем

### "База данных не выбрана"
В phpMyAdmin **слева кликни** на `ce876244_tournam` перед выполнением SQL.

### CORS ошибка
Проверь `php-backend/config.php`:
```php
header('Access-Control-Allow-Origin: *');
```

### Белый экран
1. Открой консоль (F12)
2. Проверь ошибки
3. Проверь что файлы `assets/` загружены

### 404 при переходах
Создай `.htaccess` с правилами для SPA.

---

## 📞 Поддержка

**Сообщество:** https://t.me/+QgiLIa1gFRY4Y2Iy

**При проблемах:**
1. Проверь логи PHP в панели Timeweb
2. Проверь консоль браузера (F12)
3. Проверь `/php-backend/api/health.php`
4. Напиши в сообщество

---

## 🎯 Быстрые ссылки

| Что | Где |
|-----|-----|
| Сайт | `https://ce876244.tw1.ru/` |
| Админка | `https://ce876244.tw1.ru/php-backend/api/admin-login.php` |
| Health Check | `https://ce876244.tw1.ru/php-backend/api/health.php` |
| phpMyAdmin | Панель Timeweb → Базы данных |
| Файлы | Панель Timeweb → Файловый менеджер |

---

## 📝 Лицензия

Проект создан для проведения турниров League of Legends.

---

**Версия:** 1.0  
**Дата:** 2025-10-20  
**Платформа:** poehali.dev
