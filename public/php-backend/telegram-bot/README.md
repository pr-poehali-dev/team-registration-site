# 🤖 PHP Telegram Bot для Timeweb

PHP версия бота для работы на обычном хостинге **БЕЗ VPS**.

---

## 🎯 Возможности

### Для капитанов команд:
- ✅ Получение кода регистрации после создания команды
- ✅ Команда `/myteam` - просмотр своей команды
- ✅ Подтверждение изменений команды через кнопки
- ✅ Подтверждение удаления команды через кнопки
- ✅ Уведомления об изменении статуса (одобрена/отклонена)

### Команды бота:
- `/start` - Приветствие и главное меню
- `/register` - Инструкция по регистрации
- `/myteam` - Показать мою команду
- `/help` - Справка по боту

---

## 📦 Установка

### Шаг 1: Загрузите файлы на Timeweb

Загрузите папку `telegram-bot/` в `public_html/php-backend/`:

```
public_html/
└── php-backend/
    └── telegram-bot/
        ├── webhook.php              ← Обработчик webhook
        ├── set-webhook.php          ← Установка webhook
        ├── send-notification.php    ← Отправка уведомлений
        └── README.md                ← Эта инструкция
```

### Шаг 2: Установите webhook

1. Откройте в браузере:
   ```
   https://ce876244.tw1.ru/php-backend/telegram-bot/set-webhook.php
   ```

2. Должно показать:
   ```
   ✅ Webhook успешно установлен!
   URL: https://ce876244.tw1.ru/php-backend/telegram-bot/webhook.php
   ```

3. Проверьте статус webhook на этой же странице

### Шаг 3: Проверьте работу

1. Откройте бота: [@TournamentWR_bot](https://t.me/TournamentWR_bot)
2. Отправьте команду `/start`
3. Бот должен ответить приветствием

---

## 🔧 Настройка

### Изменение токена бота

В файлах `webhook.php`, `set-webhook.php`, `send-notification.php` измените:

```php
define('BOT_TOKEN', 'ВАШ_ТОКЕН_БОТА');
```

### Изменение URL

В файле `set-webhook.php` измените:

```php
define('WEBHOOK_URL', 'https://ваш-домен.ru/php-backend/telegram-bot/webhook.php');
```

---

## 🔄 Интеграция с основным API

### Отправка кода регистрации

При создании команды в `teams.php`:

```php
// После создания команды
$team_id = $pdo->lastInsertId();

// Отправить код капитану
$notify_url = 'https://ce876244.tw1.ru/php-backend/telegram-bot/send-notification.php';
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

### Запрос на подтверждение изменений

При редактировании команды в `teams.php`:

```php
// Сохранить изменения в pending_changes
$stmt = $pdo->prepare("
    INSERT INTO pending_changes (team_id, changes, old_values) 
    VALUES (?, ?, ?)
");
$stmt->execute([
    $team_id,
    json_encode($changes),
    json_encode($old_values)
]);

// Отправить запрос на подтверждение
$notify_data = [
    'team_id' => $team_id,
    'action' => 'confirm_edit'
];

// ... отправка через file_get_contents
```

### Запрос на подтверждение удаления

При удалении команды в `teams.php`:

```php
// Отправить запрос на подтверждение
$notify_data = [
    'team_id' => $team_id,
    'action' => 'confirm_delete'
];

// ... отправка через file_get_contents
```

### Уведомление об изменении статуса

При модерации заявки:

```php
// После изменения статуса
$notify_data = [
    'team_id' => $team_id,
    'action' => 'notify_status'
];

// ... отправка через file_get_contents
```

---

## 📊 Как это работает

### Архитектура

```
Telegram Servers
       ↓
   webhook.php (обработка сообщений/кнопок)
       ↓
   MySQL Database (teams, pending_changes)
       ↑
   teams.php (основной API)
       ↓
send-notification.php (отправка уведомлений)
       ↓
   Telegram API
       ↓
  Капитан получает сообщение
```

### Процесс регистрации команды

1. **Капитан** заполняет форму на сайте
2. **API** создаёт команду в БД
3. **API** вызывает `send-notification.php` с `action=send_auth_code`
4. **Бот** отправляет код регистрации капитану в Telegram
5. **Капитан** получает сообщение с кодом

### Процесс редактирования команды

1. **Капитан** редактирует команду на сайте
2. **API** сохраняет изменения в `pending_changes`
3. **API** вызывает `send-notification.php` с `action=confirm_edit`
4. **Бот** отправляет запрос с кнопками подтверждения
5. **Капитан** нажимает кнопку "✅ Подтвердить"
6. **Webhook** применяет изменения и удаляет из `pending_changes`

### Процесс удаления команды

1. **Капитан** удаляет команду на сайте
2. **API** вызывает `send-notification.php` с `action=confirm_delete`
3. **Бот** отправляет запрос с кнопками подтверждения
4. **Капитан** нажимает кнопку "✅ Да, удалить"
5. **Webhook** удаляет команду из БД

---

## 🐛 Отладка

### Проверка webhook

Откройте в браузере:
```
https://api.telegram.org/bot<ВАШ_ТОКЕН>/getWebhookInfo
```

Должно показать:
```json
{
  "ok": true,
  "result": {
    "url": "https://ce876244.tw1.ru/php-backend/telegram-bot/webhook.php",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

### Логирование

В `webhook.php` уже есть логирование:
```php
error_log("Telegram Update: " . $content);
```

Логи находятся:
- Панель Timeweb → **Логи** → **Логи PHP**
- Или в `/var/log/php_errors.log`

### Тестовая отправка

Создайте файл `test-send.php`:

```php
<?php
require_once __DIR__ . '/../config.php';

$notify_url = 'https://ce876244.tw1.ru/php-backend/telegram-bot/send-notification.php';

$data = [
    'team_id' => 1,  // ID существующей команды
    'action' => 'send_auth_code'
];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($notify_url, false, $context);

echo "Результат: " . $result;
```

Откройте: `https://ce876244.tw1.ru/php-backend/telegram-bot/test-send.php`

---

## ⚠️ Важные моменты

### 1. Chat ID vs Username

Бот пытается найти `chat_id` капитана в таблице `telegram_users`.

Если не найден - отправляет сообщение через username:
```php
$chat_id = '@username';
```

**Важно:** Капитан должен хотя бы раз написать боту `/start`, чтобы его `chat_id` сохранился в БД.

### 2. Сохранение chat_id

Добавьте в `webhook.php` при обработке `/start`:

```php
if ($text === '/start') {
    // Сохранить chat_id в БД
    $stmt = $pdo->prepare("
        INSERT INTO telegram_users (chat_id, username, first_name, last_name) 
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE chat_id = ?, first_name = ?, last_name = ?
    ");
    
    $stmt->execute([
        $chat_id,
        $username,
        $message['from']['first_name'] ?? '',
        $message['from']['last_name'] ?? '',
        $chat_id,
        $message['from']['first_name'] ?? '',
        $message['from']['last_name'] ?? ''
    ]);
    
    // Отправить приветствие
    // ...
}
```

### 3. Timeout уведомлений

Используем `@file_get_contents` с timeout 5 секунд:

```php
@file_get_contents($notify_url, false, $context);
```

Символ `@` подавляет ошибки, чтобы основной API не падал если бот недоступен.

### 4. Асинхронная отправка

Для больших нагрузок используйте очередь:

```php
// Вместо прямой отправки
$stmt = $pdo->prepare("
    INSERT INTO notification_queue (team_id, action, created_at) 
    VALUES (?, ?, NOW())
");
$stmt->execute([$team_id, 'send_auth_code']);
```

И cron для обработки:
```bash
*/5 * * * * php /path/to/process-queue.php
```

---

## 🔒 Безопасность

### Проверка IP Telegram

Добавьте в начало `webhook.php`:

```php
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

function cidr_match($ip, $range) {
    list($subnet, $bits) = explode('/', $range);
    $ip = ip2long($ip);
    $subnet = ip2long($subnet);
    $mask = -1 << (32 - $bits);
    return ($ip & $mask) == ($subnet & $mask);
}
```

### Secret Token (рекомендуется)

При установке webhook:

```php
$data = [
    'url' => WEBHOOK_URL,
    'secret_token' => 'ваш-секретный-токен-32-символа'
];
```

И в `webhook.php`:

```php
$secret = $_SERVER['HTTP_X_TELEGRAM_BOT_API_SECRET_TOKEN'] ?? '';

if ($secret !== 'ваш-секретный-токен-32-символа') {
    http_response_code(403);
    exit('Invalid secret');
}
```

---

## ✅ Контрольный чеклист

Установка завершена если:

- [ ] Файлы загружены в `php-backend/telegram-bot/`
- [ ] Webhook установлен (зелёная галочка в `set-webhook.php`)
- [ ] Бот отвечает на `/start`
- [ ] Команда `/myteam` показывает команду
- [ ] После регистрации капитан получает код
- [ ] Кнопки подтверждения работают
- [ ] Логи не показывают ошибок

---

## 📞 Поддержка

**Сообщество:** https://t.me/+QgiLIa1gFRY4Y2Iy

**При проблемах:**
1. Проверь webhook: `getWebhookInfo`
2. Проверь логи PHP в панели Timeweb
3. Протестируй `send-notification.php` напрямую
4. Напиши в сообщество

---

## 🔄 Обновление

Чтобы обновить бота:

1. Замени файлы на сервере
2. Заново установи webhook: `set-webhook.php`
3. Проверь работу: `/start` в боте

---

**Версия:** 1.0 (PHP Webhook Edition)  
**Дата:** 2025-10-20  
**Требования:** PHP 7.4+, MySQL 5.7+, HTTPS
