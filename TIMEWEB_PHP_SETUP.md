# Настройка PHP Backend на Timeweb

Эта инструкция поможет развернуть PHP API на хостинге Timeweb для работы системы регистрации команд.

## 📋 Что нужно сделать

### 1. Подготовка файлов

Все PHP файлы уже находятся в папке `public/php-backend/`:
- `api/teams.php` - основной API для работы с командами
- `api/registration-status.php` - API статуса регистрации
- `api/send-auth-code.php` - отправка кодов авторизации
- `api/notify-captain.php` - уведомления капитанам
- `db/` - SQL скрипты для инициализации БД

### 2. Загрузка на Timeweb

**Через FTP/SFTP:**
1. Подключитесь к хостингу через FileZilla или другой FTP-клиент
2. Найдите корневую директорию сайта (обычно `public_html/` или `www/`)
3. Скопируйте папку `php-backend/` в корень:
   ```
   public_html/
   ├── php-backend/
   │   ├── api/
   │   │   ├── teams.php
   │   │   ├── registration-status.php
   │   │   ├── send-auth-code.php
   │   │   └── notify-captain.php
   │   └── db/
   │       └── init-registration-settings.sql
   └── index.html
   ```

**Через панель Timeweb:**
1. Войдите в панель управления хостингом
2. Откройте файловый менеджер
3. Загрузите папку `php-backend/` в корень сайта

### 3. Настройка базы данных

**Шаг 1: Получите данные подключения**
1. В панели Timeweb откройте раздел "Базы данных"
2. Создайте новую базу данных MySQL (если ещё нет)
3. Запишите данные:
   - **Хост**: `localhost` или IP сервера
   - **Имя БД**: `ce876244_tournam` (ваше имя)
   - **Пользователь**: логин от БД
   - **Пароль**: пароль от БД

**Шаг 2: Обновите подключение в PHP**
Отредактируйте файл `php-backend/api/teams.php` (строки 8-11):

```php
$host = 'localhost';           // или IP сервера
$dbname = 'ce876244_tournam';  // имя вашей БД
$username = 'your_db_user';    // пользователь БД
$password = 'your_db_password'; // пароль БД
```

**Шаг 3: Инициализируйте таблицы**
1. Откройте phpMyAdmin в панели Timeweb
2. Выберите вашу базу данных
3. Перейдите на вкладку "SQL"
4. Скопируйте и выполните содержимое файла `php-backend/db/init-registration-settings.sql`

### 4. Настройка прав доступа

Убедитесь, что PHP файлы имеют правильные права:
```bash
chmod 644 php-backend/api/*.php
```

### 5. Переключение фронтенда на PHP API

Отредактируйте файл `src/config/api.ts`:

```typescript
const USE_TIMEWEB_API = true;  // Включите Timeweb API
```

Обновите пути если нужно:
```typescript
export const API_CONFIG = {
  TEAMS_URL: '/php-backend/api/teams.php',
  SETTINGS_URL: '/php-backend/api/teams.php',
  AUTH_URL: '/php-backend/api/teams.php'
};
```

### 6. Проверка работы

**Тест 1: Проверка доступности API**
Откройте в браузере:
```
https://ваш-домен.ru/php-backend/api/teams.php?resource=settings
```

Должен вернуться JSON:
```json
{
  "is_open": true
}
```

**Тест 2: Проверка регистрации**
1. Откройте главную страницу сайта
2. Попробуйте зарегистрировать тестовую команду
3. Проверьте, что данные появились в БД

**Тест 3: Проверка админки**
1. Войдите в раздел "Админ"
2. Попробуйте изменить статус регистрации
3. Проверьте, что изменения сохраняются

## 🔧 Возможные проблемы

### Ошибка "Not Found"
**Причина**: PHP файлы не загружены или находятся в неправильной папке

**Решение**:
- Проверьте, что папка `php-backend/` находится в корне сайта
- Убедитесь, что путь в `api.ts` соответствует реальному расположению файлов

### Ошибка подключения к БД
**Причина**: Неверные данные подключения в `teams.php`

**Решение**:
1. Проверьте данные подключения в панели Timeweb
2. Обновите параметры в файле `teams.php`
3. Убедитесь, что пользователь БД имеет права на чтение/запись

### CORS ошибки
**Причина**: Браузер блокирует запросы с другого домена

**Решение**:
Добавьте в начало `teams.php` (уже есть в коде):
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

### Пустой ответ от API
**Причина**: PHP не включён или версия PHP устарела

**Решение**:
1. В панели Timeweb проверьте версию PHP (нужна 7.4+)
2. Включите PHP для вашего домена в настройках хостинга

## 📊 Структура базы данных

После инициализации у вас будут таблицы:

### `registration_settings`
```sql
- id (INT) - ID записи
- is_open (BOOLEAN) - Регистрация открыта?
- updated_at (TIMESTAMP) - Когда изменено
- updated_by (VARCHAR) - Кем изменено
```

### `teams`
```sql
- id (INT) - ID команды
- team_name (VARCHAR) - Название команды
- captain_name (VARCHAR) - Имя капитана
- captain_telegram (VARCHAR) - Telegram капитана
- members_count (INT) - Количество участников
- members_info (TEXT) - Информация об участниках
- status (ENUM) - Статус: pending/approved/rejected
- auth_code (VARCHAR) - Код авторизации
- created_at (TIMESTAMP) - Дата создания
```

### `admin_users`
```sql
- id (INT) - ID админа
- username (VARCHAR) - Логин
- password_hash (VARCHAR) - Хэш пароля
- is_super_admin (BOOLEAN) - Супер-админ?
- created_at (TIMESTAMP) - Дата создания
```

## 🚀 После настройки

1. Убедитесь, что `USE_TIMEWEB_API = true` в `src/config/api.ts`
2. Пересоберите фронтенд: `npm run build`
3. Загрузите обновлённые файлы на хостинг
4. Проверьте работу всех функций

## 📞 Поддержка

Если возникли проблемы:
1. Проверьте логи PHP в панели Timeweb
2. Откройте консоль браузера (F12) и проверьте ошибки сети
3. Убедитесь, что все файлы загружены корректно

---

**Создано для проекта регистрации команд**
Дата: 2025-10-20
