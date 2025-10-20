# PHP Backend для турнира

## 🗂 Структура

```
php-backend/
├── api/
│   ├── teams.php           # Основное API (команды, админ, настройки)
│   ├── notify-captain.php  # Отправка уведомлений в Telegram
│   └── send-auth-code.php  # Отправка кода регистрации
└── db/
    ├── full-setup.sql      # 👈 НАЧНИТЕ С ЭТОГО ФАЙЛА
    ├── schema.sql          # Основная схема БД
    └── add-telegram-tables.sql  # Таблицы для Telegram
```

## 🚀 Быстрый старт

### 1. Инициализация БД

**🟢 Рекомендуется: `db/simple-setup.sql`**
- Без комментариев, чистый SQL
- Скопируйте весь файл → phpMyAdmin → Выполнить

**🟡 Если не работает: `db/step-by-step.sql`**
- С пошаговыми инструкциями
- Выполняйте команды по одной

**📖 С документацией: `db/full-setup.sql`**
- Полная версия с пояснениями

### 2. Загрузите файлы на сервер
Загрузите всю папку `php-backend/` в `public_html/`

### 3. Войдите на сайт
- Логин: `@Rywrxuna`
- Пароль: `SmirNova2468`

## 📡 API Endpoints

### Команды
- `GET /php-backend/api/teams.php` - список команд
- `GET /php-backend/api/teams.php?auth_code=REG-XXXX-XXXX` - поиск по коду
- `POST /php-backend/api/teams.php` - создать команду
- `PUT /php-backend/api/teams.php` - обновить команду
- `DELETE /php-backend/api/teams.php?id=1` - удалить команду

### Настройки
- `GET /php-backend/api/teams.php?resource=settings` - статус регистрации
- `POST /php-backend/api/teams.php` + `{resource: 'settings', is_open: true}` - изменить статус

### Авторизация
- `POST /php-backend/api/teams.php` + `{resource: 'auth', username: '', password: ''}` - вход админа

### Матчи
- `GET /php-backend/api/teams.php?resource=matches` - список матчей

## 🔑 Данные БД

```php
$host = 'localhost';
$dbname = 'ce876244_tournam';
$username = 'ce876244_tournam';
$password = 'kh5-XQi-EWE-9gS';
```

## 📋 Таблицы БД

1. **teams** - команды турнира
2. **admin_users** - администраторы
3. **registration_settings** - настройки регистрации
4. **matches** - матчи турнира
5. **telegram_users** - пользователи Telegram
6. **pending_changes** - ожидающие изменения

## 🤖 Telegram Bot

Token: `8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds`

Уведомления отправляются через `notify-captain.php`

## ⚙️ Настройка

Если нужно изменить данные БД или токен бота, отредактируйте:
- `api/teams.php` (строки 13-16)
- `api/notify-captain.php` (строки 13-17)

---

📖 Полная инструкция: `УСТАНОВКА_НА_TIMEWEB.md`