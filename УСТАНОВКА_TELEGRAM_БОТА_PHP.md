# 🤖 Установка PHP Telegram бота на Timeweb

Простая инструкция для запуска бота **БЕЗ VPS** (работает на обычном хостинге).

---

## ⚡ Быстрый старт (5 минут)

### Шаг 1: Загрузи файлы

Загрузи папку `php-backend/telegram-bot/` на сервер Timeweb в:
```
public_html/php-backend/telegram-bot/
```

**Структура должна быть:**
```
public_html/
└── php-backend/
    └── telegram-bot/
        ├── webhook.php
        ├── set-webhook.php
        └── send-notification.php
```

### Шаг 2: Установи webhook

Открой в браузере:
```
https://ce876244.tw1.ru/php-backend/telegram-bot/set-webhook.php
```

Должно показать:
```
✅ Webhook успешно установлен!
```

### Шаг 3: Проверь работу

1. Открой бота: [@TournamentWR_bot](https://t.me/TournamentWR_bot)
2. Отправь команду: `/start`
3. Бот должен ответить приветствием

**Готово!** 🎉 Бот работает!

---

## 🎯 Как это работает

### Webhook vs Long Polling

**Long Polling** (VPS версия):
- ❌ Требует VPS сервер
- ❌ Нужен постоянно запущенный процесс
- ❌ Сложная настройка

**Webhook** (PHP версия):
- ✅ Работает на обычном хостинге
- ✅ Telegram сам вызывает ваш скрипт
- ✅ Простая установка

### Процесс работы

```
1. Пользователь пишет боту
        ↓
2. Telegram отправляет запрос на ваш webhook.php
        ↓
3. webhook.php обрабатывает сообщение
        ↓
4. Бот отвечает пользователю через Telegram API
```

---

## 📝 Интеграция с сайтом

### Отправка кода регистрации

Уже работает! В файле `teams.php` есть код:

```php
// После создания команды
$notify_url = 'https://ce876244.tw1.ru/php-backend/api/notify-captain.php';
$notify_data = [
    'team_id' => $team_id,
    'action' => 'send_auth_code'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($notify_data),
        'timeout' => 5
    ]
];

$context = stream_context_create($options);
@file_get_contents($notify_url, false, $context);
```

**Что происходит:**
1. Капитан регистрирует команду на сайте
2. API создаёт команду в БД
3. API вызывает `send-notification.php`
4. Бот отправляет код регистрации капитану в Telegram

---

## 🔧 Возможности бота

### Команды для пользователей

| Команда | Что делает |
|---------|------------|
| `/start` | Приветствие и главное меню |
| `/register` | Инструкция по регистрации |
| `/myteam` | Показать свою команду |
| `/help` | Справка по боту |

### Автоматические уведомления

| Событие | Что получает капитан |
|---------|----------------------|
| Регистрация команды | 🔑 Код регистрации (REG-XXXX-XXXX) |
| Изменение команды | ⚠️ Запрос на подтверждение с кнопками |
| Удаление команды | ⚠️ Запрос на подтверждение удаления |
| Модерация заявки | ✅/❌ Уведомление об одобрении/отклонении |

### Кнопки подтверждения

При редактировании команды капитан получает:
```
⚠️ Запрос на изменение команды

🏆 Команда: Team Name

📝 Изменения:
...

[✅ Подтвердить] [❌ Отменить]
```

---

## 📊 База данных

### Таблица telegram_users

Бот автоматически сохраняет пользователей при `/start`:

```sql
CREATE TABLE IF NOT EXISTS telegram_users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    chat_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Зачем нужна:**
- Сохраняет `chat_id` для отправки уведомлений
- Связывает Telegram username с командой
- Позволяет найти капитана для уведомлений

---

## 🐛 Решение проблем

### Проблема: Бот не отвечает

**Решение:**

1. **Проверь webhook:**
   ```
   https://api.telegram.org/bot8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds/getWebhookInfo
   ```
   
   Должно быть:
   ```json
   {
     "ok": true,
     "result": {
       "url": "https://ce876244.tw1.ru/php-backend/telegram-bot/webhook.php",
       "pending_update_count": 0
     }
   }
   ```

2. **Проверь логи:**
   - Панель Timeweb → Логи → Логи PHP
   - Ищи ошибки с `Telegram Update`

3. **Заново установи webhook:**
   - Открой `set-webhook.php`
   - Должно показать успех

### Проблема: Капитан не получает код

**Решение:**

1. **Проверь что капитан написал боту `/start`:**
   - Без этого бот не знает `chat_id` капитана
   - Попроси капитана написать `/start`

2. **Проверь таблицу telegram_users:**
   ```sql
   SELECT * FROM telegram_users WHERE username LIKE '%капитан%';
   ```
   
   Должна быть запись с его username.

3. **Проверь логи отправки:**
   - Файл `send-notification.php` логирует отправку
   - Смотри логи PHP в панели Timeweb

### Проблема: Кнопки не работают

**Решение:**

1. **Проверь что `pending_changes` создаётся:**
   ```sql
   SELECT * FROM pending_changes;
   ```

2. **Проверь callback обработку в `webhook.php`:**
   - Должна быть функция `handleCallbackQuery`
   - Проверь логи

### Проблема: SSL ошибка

**Решение:**

Telegram требует HTTPS для webhook.

1. **Проверь что у тебя SSL:**
   - Открой сайт через `https://`
   - Должен быть зелёный замок

2. **Получи SSL в Timeweb:**
   - Панель → SSL сертификаты
   - Получить Let's Encrypt (бесплатно)

---

## 🔒 Безопасность

### Защита webhook

Добавь проверку IP Telegram в начало `webhook.php`:

```php
// Telegram IP ranges
$telegram_ips = [
    '149.154.160.0/20',
    '91.108.4.0/22'
];

$client_ip = $_SERVER['REMOTE_ADDR'];
$is_telegram = false;

foreach ($telegram_ips as $ip_range) {
    if (cidr_match($client_ip, $ip_range)) {
        $is_telegram = true;
        break;
    }
}

if (!$is_telegram) {
    http_response_code(403);
    exit('Access denied');
}
```

### Secret Token

При установке webhook:

```php
// В set-webhook.php
$data = [
    'url' => WEBHOOK_URL,
    'secret_token' => 'your-32-char-secret-here'
];
```

И проверка в `webhook.php`:

```php
$secret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';
if ($secret !== 'your-32-char-secret-here') {
    http_response_code(403);
    exit('Invalid secret');
}
```

---

## 📈 Мониторинг

### Проверка статуса webhook

```bash
curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo
```

Должно показать:
- `url` - адрес вашего webhook
- `pending_update_count` - количество необработанных обновлений (должно быть 0)
- `last_error_message` - последняя ошибка (должно быть пусто)

### Логирование

Бот логирует все обновления в PHP логи:

```php
error_log("Telegram Update: " . $content);
```

Смотри логи:
- Панель Timeweb → Логи → Логи PHP
- Или `/var/log/php_errors.log`

---

## 🆚 Сравнение с VPS версией

| Функция | VPS (Python/Node) | Timeweb (PHP) |
|---------|-------------------|---------------|
| Регистрация команд | ✅ | ✅ |
| Отправка кода | ✅ | ✅ |
| Подтверждение изменений | ✅ | ✅ |
| Подтверждение удаления | ✅ | ✅ |
| Команда /start | ✅ | ✅ |
| Команда /myteam | ✅ | ✅ |
| Уведомления | ✅ | ✅ |
| Требует VPS | ❌ Да | ✅ Нет |
| Сложность установки | 🔴 Сложно | 🟢 Легко |
| Стоимость | 💰 $5-10/мес | 💰 $0 (включено) |

**Вывод:** PHP версия проще и дешевле, работает так же хорошо!

---

## ✅ Контрольный чеклист

После установки проверь:

- [ ] Файлы загружены в `php-backend/telegram-bot/`
- [ ] Webhook установлен (зелёная галочка)
- [ ] Бот отвечает на `/start`
- [ ] Команда `/myteam` работает
- [ ] После регистрации капитан получает код в Telegram
- [ ] Таблица `telegram_users` создана
- [ ] SSL сертификат активен (https://)
- [ ] Логи не показывают ошибок

---

## 🔄 Переход с VPS версии

Если у тебя уже работает VPS версия:

1. **Останови VPS бота:**
   ```bash
   pm2 stop bot
   ```

2. **Удали старый webhook:**
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/deleteWebhook
   ```

3. **Установи новый webhook:**
   - Открой `set-webhook.php`

4. **Проверь работу:**
   - Напиши боту `/start`

**Все данные в БД сохранятся!** Бот продолжит работу с существующими командами.

---

## 📞 Поддержка

**Сообщество:** https://t.me/+QgiLIa1gFRY4Y2Iy

**При проблемах:**
1. Проверь webhook: `getWebhookInfo`
2. Проверь логи PHP в панели Timeweb
3. Напиши в сообщество с описанием проблемы

---

## 📚 Документация

**Полная документация:** `public/php-backend/telegram-bot/README.md`

**Telegram Bot API:** https://core.telegram.org/bots/api

**Webhook Guide:** https://core.telegram.org/bots/webhooks

---

**Версия:** 1.0 (PHP Webhook)  
**Дата:** 2025-10-20  
**Требования:** PHP 7.4+, HTTPS, MySQL 5.7+  
**Статус:** ✅ Готов к использованию
