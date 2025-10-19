# Установка Telegram бота для MySQL (Timeweb)

## ⚠️ Важно
Эта инструкция для случая, когда база данных MySQL находится на Timeweb хостинге, а бот работает на отдельном VPS.

## 1. Подготовка VPS

Закажи VPS на Timeweb (от 200₽/мес):
- https://timeweb.cloud/vps
- Выбери Ubuntu 22.04
- Минимальная конфигурация подойдёт

## 2. Подключись к VPS

```bash
ssh root@your-vps-ip
```

## 3. Установи Python и зависимости

```bash
apt update
apt install -y python3 python3-pip nginx certbot python3-certbot-nginx
```

## 4. Создай директорию и загрузи файлы

```bash
mkdir -p /opt/tournament-bot
cd /opt/tournament-bot
```

Загрузи файлы через SCP:
```bash
# С твоего компьютера
scp bot-mysql.py requirements-mysql.txt .env.mysql.example root@your-vps-ip:/opt/tournament-bot/
```

## 5. Переименуй файлы

```bash
cd /opt/tournament-bot
mv bot-mysql.py bot.py
mv requirements-mysql.txt requirements.txt
mv .env.mysql.example .env
```

## 6. Установи Python зависимости

```bash
pip3 install -r requirements.txt
```

## 7. Настрой переменные окружения

```bash
nano .env
```

Заполни данными от Timeweb хостинга:
```env
TELEGRAM_BOT_TOKEN=7891234567:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw
DB_HOST=localhost
DB_USER=ce876244_tournam
DB_PASSWORD=ваш_пароль_от_mysql
DB_NAME=ce876244_tournam
WEBHOOK_URL=https://bot.yourdomain.ru
```

**Где взять данные MySQL:**
1. Зайди в панель Timeweb
2. "Базы данных" → выбери свою БД
3. Там будут: Имя БД, Пользователь, Пароль
4. Хост обычно `localhost` или указан в панели

Сохрани (Ctrl+O, Enter, Ctrl+X).

## 8. Настрой Nginx

```bash
nano /etc/nginx/sites-available/bot
```

Вставь:

```nginx
server {
    listen 80;
    server_name bot.yourdomain.ru;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Активируй:

```bash
ln -s /etc/nginx/sites-available/bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 9. Получи SSL сертификат

**Важно:** Сначала настрой DNS запись A для `bot.yourdomain.ru` → IP твоего VPS

Затем:
```bash
certbot --nginx -d bot.yourdomain.ru
```

## 10. Создай systemd сервис

```bash
nano /etc/systemd/system/tournament-bot.service
```

Вставь:

```ini
[Unit]
Description=Tournament Telegram Bot
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/tournament-bot
EnvironmentFile=/opt/tournament-bot/.env
ExecStart=/usr/local/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 bot:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

## 11. Запусти бота

```bash
systemctl daemon-reload
systemctl enable tournament-bot
systemctl start tournament-bot
systemctl status tournament-bot
```

Должен показать: `Active: active (running)`

## 12. Настрой webhook

Открой в браузере:
```
https://bot.yourdomain.ru/setup-webhook
```

Должен вернуть: 
```json
{"ok": true, "result": true, "description": "Webhook was set"}
```

## 13. Проверь бота

Напиши боту `/start` в Telegram - должен ответить!

## Проверка подключения к БД

Проверь, что бот может подключиться к MySQL на Timeweb:

```bash
# На VPS выполни:
python3 -c "
import pymysql
import os

# Загрузи .env вручную
conn = pymysql.connect(
    host='localhost',  # или IP от Timeweb
    user='ce876244_tournam',
    password='твой_пароль',
    database='ce876244_tournam'
)
print('✅ Подключение успешно!')
conn.close()
"
```

Если ошибка подключения - проверь:
1. Разрешён ли удалённый доступ к MySQL в панели Timeweb
2. Правильно ли указан хост (может быть не localhost, а IP)
3. Открыт ли порт 3306 в файрволле

## Полезные команды

Проверить статус:
```bash
systemctl status tournament-bot
```

Посмотреть логи:
```bash
journalctl -u tournament-bot -f
```

Посмотреть последние 50 строк:
```bash
journalctl -u tournament-bot -n 50
```

Перезапустить:
```bash
systemctl restart tournament-bot
```

Остановить:
```bash
systemctl stop tournament-bot
```

## API бота

### Отправка уведомления капитану

```bash
curl -X POST https://bot.yourdomain.ru/notify-captain \
  -H "Content-Type: application/json" \
  -d '{
    "captain_telegram": "username",
    "message": "Ваша команда одобрена!"
  }'
```

### Проверка здоровья

```bash
curl https://bot.yourdomain.ru/health
```

## Готово! 🚀

Бот работает и принимает команды!
