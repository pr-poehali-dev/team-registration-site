# PHP Backend для Timeweb

Конвертированные backend-функции из Python в PHP для хостинга Timeweb.

## Структура файлов

```
php-backend/
├── config/
│   └── database.php          # Настройки подключения к БД
├── api/
│   ├── teams.php             # API управления командами
│   ├── registration-settings.php  # Настройки регистрации
│   └── admin-auth.php        # Авторизация админов
├── .htaccess                 # Настройки CORS и редиректов
└── README.md                 # Эта инструкция
```

## Установка на Timeweb

### 1. Загрузи файлы
- Скопируй всю папку `php-backend` в корень сайта на Timeweb
- Путь должен быть: `public_html/php-backend/`

### 2. Настрой базу данных
Открой файл `config/database.php` и измени:
```php
$db_host = 'localhost';
$db_name = 'ce876244_dkdl';  // Твоя БД
$db_user = 'ce876244_dkdl';  // Твой пользователь
$db_pass = 'YOUR_PASSWORD';  // Твой пароль от БД
```

### 3. Обнови URL в frontend
В коде React замени URL с:
```
https://functions.poehali.dev/882c0cbc-4c6b-435e-a35d-dadbb2ac5773
```
на:
```
https://your-domain.ru/php-backend/api/teams.php
```

## API Endpoints

### Управление командами
- `GET /php-backend/api/teams.php` - Список всех команд
- `GET /php-backend/api/teams.php?auth_code=REG-XXXX-XXXX` - Поиск по коду
- `POST /php-backend/api/teams.php` - Создать команду
- `PUT /php-backend/api/teams.php` - Обновить команду
- `DELETE /php-backend/api/teams.php?id=1` - Удалить команду

### Настройки регистрации
- `GET /php-backend/api/registration-settings.php` - Получить статус
- `POST /php-backend/api/registration-settings.php` - Изменить статус

### Авторизация админов
- `POST /php-backend/api/admin-auth.php` - Вход в систему

## Проверка работы
После загрузки открой в браузере:
```
https://your-domain.ru/php-backend/api/teams.php
```

Должен вернуться JSON с командами или пустой массив.

## Настройка Telegram бота

### 1. Получи токен бота
1. Напиши @BotFather в Telegram
2. Отправь команду `/newbot`
3. Следуй инструкциям (название бота, username)
4. Скопируй полученный токен

### 2. Укажи токен в конфиге
Открой `config/telegram.php` и замени:
```php
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');
```
на:
```php
define('TELEGRAM_BOT_TOKEN', '123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
```

### 3. Настрой webhook
Открой в браузере:
```
https://ce876244.tw1.ru/php-backend/api/setup-bot.php
```

Должен вернуться JSON с `"success": true` и ссылкой на бота.

### 4. Проверь бота
Напиши боту в Telegram `/start` - он должен ответить приветствием.

## Требования
- PHP 7.4 или выше
- MySQL 5.7 или выше
- PDO extension (обычно включен по умолчанию)
- allow_url_fopen = On (для работы с Telegram API)