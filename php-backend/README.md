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

## Требования
- PHP 7.4 или выше
- MySQL 5.7 или выше
- PDO extension (обычно включен по умолчанию)
