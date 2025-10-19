# 🤖 Telegram Bot для турнирной системы (PHP версия)

PHP версия бота для обычного хостинга Timeweb без необходимости в VPS.

## ✨ Возможности

- ✅ Привязка Telegram к команде капитана
- ✅ Просмотр информации о команде
- ✅ Просмотр расписания матчей
- ✅ Автоматические уведомления о событиях
- ✅ Интерактивная клавиатура
- ✅ Работает на обычном хостинге (без VPS)

## 📋 Требования

- PHP 7.4 или выше
- MySQL база данных (уже настроена)
- Токен Telegram бота
- HTTPS хостинг (для webhook)

## 🚀 Быстрая установка

### Шаг 1: Создайте бота в Telegram

1. Найдите `@BotFather` в Telegram
2. Отправьте команду `/newbot`
3. Укажите имя бота (например, "LoL Tournament Bot")
4. Укажите username бота (например, "lol_tournament_bot")
5. Получите токен вида `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`

### Шаг 2: Настройте переменные окружения

**Способ А: Через файл .env** (если хостинг поддерживает)

Создайте файл `.env` в корне проекта:
```env
TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_WEBHOOK_URL=https://ce876244.tw1.ru/telegram-bot/bot.php
```

**Способ Б: Через панель Timeweb**

1. Панель управления → PHP
2. Найдите раздел "Переменные окружения"
3. Добавьте:
   - `TELEGRAM_BOT_TOKEN` = ваш токен
   - `TELEGRAM_WEBHOOK_URL` = `https://ce876244.tw1.ru/telegram-bot/bot.php`

**Способ В: Прямо в коде** (не рекомендуется)

Отредактируйте `bot.php` в начале файла:
```php
$BOT_TOKEN = 'ваш_токен_бота';
$WEBHOOK_URL = 'https://ce876244.tw1.ru/telegram-bot/bot.php';
```

### Шаг 3: Загрузите файлы на хостинг

Загрузите папку `telegram-bot/` в `public_html/`:

```
public_html/
└── telegram-bot/
    ├── bot.php          ← Основной файл бота
    ├── setup.php        ← Страница настройки
    ├── notify.php       ← API уведомлений
    └── README.md        ← Эта инструкция
```

### Шаг 4: Установите webhook

Откройте в браузере:
```
https://ce876244.tw1.ru/telegram-bot/setup.php
```

Нажмите кнопку **"🔗 Установить webhook"**

Должно появиться: ✅ Webhook успешно установлен!

### Шаг 5: Проверьте работу бота

1. Найдите своего бота в Telegram
2. Нажмите **Start**
3. Должно прийти приветственное сообщение

✅ Готово! Бот работает.

---

## 📱 Команды бота

### Для пользователей:

- `/start` - Начать работу с ботом
- `/link @ник` - Привязать Telegram к команде
- `/team` - Информация о команде
- `/matches` - Расписание матчей
- `/help` - Справка

### Интерактивные кнопки:

- 👥 Моя команда - Состав и статус
- 🎯 Матчи - Расписание игр
- 📊 Турнирная сетка - Ссылка на сетку
- ℹ️ Помощь - Справка

---

## 🔔 Автоматические уведомления

Бот отправляет уведомления капитанам о:

### 1. Одобрении команды
```
✅ Команда одобрена!

Поздравляем! Ваша команда допущена к участию в турнире.
```

### 2. Новом матче
```
🎯 Новый матч!

Ваша команда играет:
⚔️ Team A vs Team B
🏅 Раунд: 1/8 финала
```

### 3. Результате матча
```
📊 Результат матча

⚔️ Team A vs Team B
Счёт: 2 - 0

🏆 Победа! Поздравляем!
```

---

## 🔧 Интеграция с админ-панелью

### Отправка уведомлений из PHP

```php
// Одобрение команды
$notification = [
    'type' => 'team_approved',
    'team_id' => 123,
    'data' => [
        'team_name' => 'Team Phoenix'
    ]
];

$ch = curl_init('https://ce876244.tw1.ru/telegram-bot/notify.php');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($notification));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_exec($ch);
curl_close($ch);
```

### Типы уведомлений:

**1. Одобрение команды:**
```php
[
    'type' => 'team_approved',
    'team_id' => 123,
    'data' => ['team_name' => 'Team Name']
]
```

**2. Отклонение команды:**
```php
[
    'type' => 'team_rejected',
    'team_id' => 123,
    'data' => [
        'team_name' => 'Team Name',
        'reason' => 'Причина отклонения'
    ]
]
```

**3. Новый матч:**
```php
[
    'type' => 'match_created',
    'team_id' => 123,
    'data' => [
        'team_name' => 'Team Name',
        'team1' => 'Team A',
        'team2' => 'Team B',
        'round' => '1/8 финала',
        'date' => '20.10.2025 15:00'
    ]
]
```

**4. Результат матча:**
```php
[
    'type' => 'match_updated',
    'team_id' => 123,
    'data' => [
        'team1' => 'Team A',
        'team2' => 'Team B',
        'score1' => 2,
        'score2' => 0,
        'is_winner' => true
    ]
]
```

**5. Произвольное сообщение:**
```php
[
    'type' => 'custom',
    'team_id' => 123,
    'message' => 'Ваше сообщение капитану'
]
```

---

## 🗄️ Структура базы данных

Используется таблица `telegram_users`:

```sql
CREATE TABLE IF NOT EXISTS telegram_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    telegram_id VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(100),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_telegram_id (telegram_id)
);
```

И поле в таблице `teams`:

```sql
ALTER TABLE teams ADD COLUMN captain_telegram_id VARCHAR(50);
```

---

## 📝 Как пользователь привязывает Telegram

1. Капитан регистрирует команду на сайте, указывая свой Telegram (например, `@phoenix_captain`)
2. Администратор одобряет команду
3. Капитан находит бота в Telegram и пишет:
   ```
   /link @phoenix_captain
   ```
4. Бот привязывает Telegram ID к команде
5. Теперь капитан получает уведомления

---

## 🐛 Решение проблем

### Бот не отвечает

**Проверьте:**
1. Правильность токена бота
2. Установлен ли webhook: `/telegram-bot/setup.php`
3. Логи webhook: создайте файл для логов в `bot.php`

**Включить логирование:**
```php
// В bot.php раскомментируйте строку:
file_put_contents(__DIR__ . '/webhook.log', date('Y-m-d H:i:s') . "\n" . $content . "\n\n", FILE_APPEND);
```

### Уведомления не приходят

**Проверьте:**
1. Привязан ли Telegram ID капитана (`captain_telegram_id` в таблице `teams`)
2. Используется ли правильный `team_id` при отправке уведомления
3. Откройте `/telegram-bot/notify.php` в браузере - должно быть `{"status":"ok"}`

### Ошибка webhook

Откройте `/telegram-bot/setup.php` и нажмите **"ℹ️ Проверить webhook"**

Если есть ошибки, они будут отображены с описанием.

### HTTPS требуется

Telegram требует HTTPS для webhook. Убедитесь что:
- Ваш сайт использует HTTPS
- SSL сертификат действителен
- В Timeweb панель → SSL → Включить Let's Encrypt

---

## 🔒 Безопасность

### Рекомендации:

1. **Не храните токен в коде** - используйте переменные окружения
2. **Ограничьте доступ** к файлам бота через `.htaccess`:
   ```apache
   <FilesMatch "^(webhook\.log)$">
       Require all denied
   </FilesMatch>
   ```
3. **Проверяйте входящие данные** - бот уже имеет базовую валидацию
4. **Логируйте ошибки** но не логируйте токены

---

## 📊 Мониторинг

### Проверка здоровья бота:

```bash
curl https://ce876244.tw1.ru/telegram-bot/notify.php
```

Ответ:
```json
{
  "status": "ok",
  "message": "Notification API работает",
  "bot_configured": true
}
```

### Информация о webhook:

Откройте: `https://ce876244.tw1.ru/telegram-bot/setup.php`

Нажмите **"ℹ️ Проверить webhook"**

---

## 🆚 PHP vs Python версия

| Возможность | PHP | Python (VPS) |
|------------|-----|--------------|
| Установка | ✅ Простая | ❌ Сложная |
| Хостинг | ✅ Обычный | ❌ Нужен VPS |
| Стоимость | ✅ Бесплатно | ❌ Платно |
| Webhook | ✅ Авто | ⚠️ Настройка |
| Скорость | ⚠️ Средняя | ✅ Высокая |

**Вывод:** PHP версия идеальна для обычного хостинга!

---

## 📞 Поддержка

**Сообщество:** https://t.me/+QgiLIa1gFRY4Y2Iy

**При проблемах:**
1. Проверьте `/telegram-bot/setup.php`
2. Посмотрите логи webhook
3. Проверьте переменные окружения
4. Напишите в сообщество

---

## 🎯 Быстрые ссылки

| Что | URL |
|-----|-----|
| Настройка бота | `https://ce876244.tw1.ru/telegram-bot/setup.php` |
| API уведомлений | `https://ce876244.tw1.ru/telegram-bot/notify.php` |
| Webhook endpoint | `https://ce876244.tw1.ru/telegram-bot/bot.php` |

---

## ✅ Контрольный чеклист

После установки проверьте:

- [ ] Токен бота установлен в переменные окружения
- [ ] Webhook установлен через setup.php
- [ ] Бот отвечает на команду /start
- [ ] Можно привязать команду через /link
- [ ] Уведомления приходят капитанам
- [ ] Клавиатура работает
- [ ] notify.php возвращает {"status":"ok"}

---

**Версия:** 1.0 (PHP)  
**Платформа:** Timeweb обычный хостинг  
**Дата:** 2025-10-20
