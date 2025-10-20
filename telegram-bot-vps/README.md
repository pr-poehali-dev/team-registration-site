# 🤖 Telegram бот для турнира

Бот для приёма регистраций команд, уведомлений капитанов и управления турниром.

## 📁 Файлы в папке

| Файл | Описание |
|------|----------|
| `bot.py` | Основной код бота (PostgreSQL) |
| `bot-mysql.py` | Версия для MySQL/MariaDB |
| `requirements.txt` | Зависимости для PostgreSQL |
| `requirements-mysql.txt` | Зависимости для MySQL |
| `.env.example` | Пример настроек для PostgreSQL |
| `.env.mysql.example` | Пример настроек для MySQL |
| `SETUP.md` | Инструкция установки (PostgreSQL) |
| `SETUP-MYSQL.md` | Инструкция установки (MySQL) |
| `start.sh` | Скрипт запуска бота |

## 🎯 Выбор версии

### Используй `bot.py` (PostgreSQL) если:
- ✅ У тебя отдельная PostgreSQL база
- ✅ Бот и база на одном сервере
- ✅ Нужна производительность

### Используй `bot-mysql.py` (MySQL) если:
- ✅ База на Timeweb хостинге (MySQL)
- ✅ Бот на отдельном VPS
- ✅ Уже используешь MySQL

## 🚀 Быстрый старт

### Вариант 1: PostgreSQL
```bash
# Следуй инструкции
cat SETUP.md
```

### Вариант 2: MySQL (Timeweb)
```bash
# Следуй инструкции
cat SETUP-MYSQL.md
```

## 🔧 Функции бота

### Команды для пользователей:
- `/start` - Приветствие и помощь
- `/register` - Регистрация команды (перенаправление на сайт)
- `/myteam` - Показать свою команду
- `/help` - Список команд

### API эндпоинты:

#### `POST /webhook`
Приём обновлений от Telegram

#### `POST /notify-captain`
Отправка уведомления капитану
```json
{
  "captain_telegram": "username",
  "message": "Ваша команда одобрена!"
}
```

#### `GET /health`
Проверка работоспособности
```json
{"status": "ok", "bot": "running"}
```

#### `GET /setup-webhook`
Настройка webhook (вызывается один раз при установке)

## 📊 База данных

Бот использует таблицу `telegram_users`:

```sql
CREATE TABLE telegram_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    chat_id BIGINT NOT NULL,
    first_name VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

Автоматически сохраняет пользователей при первом взаимодействии с ботом.

## 🔐 Переменные окружения

### PostgreSQL версия:
```env
TELEGRAM_BOT_TOKEN=your_token
DATABASE_URL=postgresql://user:pass@localhost/db
WEBHOOK_URL=https://your-domain.ru
```

### MySQL версия:
```env
TELEGRAM_BOT_TOKEN=your_token
DB_HOST=localhost
DB_USER=username
DB_PASSWORD=password
DB_NAME=database
WEBHOOK_URL=https://your-domain.ru
```

## 📝 Логирование

Просмотр логов (если установлен как systemd сервис):
```bash
journalctl -u tournament-bot -f
```

## 🛠 Разработка

Локальный запуск для тестирования:
```bash
# Установи зависимости
pip3 install -r requirements.txt

# Создай .env
cp .env.example .env
# Заполни переменные

# Запусти
python3 bot.py
```

Бот запустится на `http://localhost:5000`

Для тестирования webhook используй ngrok:
```bash
ngrok http 5000
# Укажи URL от ngrok в WEBHOOK_URL
```

## 📖 Интеграция с PHP backend

Бот автоматически сохраняет пользователей в `telegram_users`.

PHP может отправлять уведомления через API:
```php
$url = 'https://bot.yourdomain.ru/notify-captain';
$data = [
    'captain_telegram' => 'username',
    'message' => 'Ваша команда одобрена!'
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);
```

## ⚙️ Systemd сервис

Автозапуск и перезапуск при сбоях:
```bash
systemctl enable tournament-bot
systemctl start tournament-bot
systemctl status tournament-bot
```

## 🔍 Отладка

Проверка webhook:
```bash
curl https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo
```

Должен показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-domain.ru/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

## 📞 Поддержка

При проблемах проверь:
1. ✅ Бот запущен: `systemctl status tournament-bot`
2. ✅ Webhook настроен: `/setup-webhook`
3. ✅ База доступна: проверь подключение
4. ✅ SSL работает: `https://your-domain.ru/health`
5. ✅ Логи: `journalctl -u tournament-bot -n 50`

## 🚀 Готово!

Бот готов к работе и будет автоматически:
- Сохранять пользователей при первом контакте
- Показывать информацию о командах
- Принимать уведомления через API
- Работать 24/7 с автоперезапуском
