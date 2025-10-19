# Установка Telegram бота на VPS Timeweb

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

Загрузи все файлы из папки `telegram-bot-vps` на VPS (через SCP или FileZilla).

## 5. Установи Python зависимости

```bash
pip3 install -r requirements.txt
```

## 6. Настрой переменные окружения

```bash
cp .env.example .env
nano .env
```

Заполни:
- `TELEGRAM_BOT_TOKEN` - токен от @BotFather
- `DATABASE_URL` - подключение к БД (замени на MySQL формат)
- `WEBHOOK_URL` - домен твоего VPS

Сохрани (Ctrl+O, Enter, Ctrl+X).

## 7. Настрой Nginx

```bash
nano /etc/nginx/sites-available/bot
```

Вставь:

```nginx
server {
    listen 80;
    server_name your-vps-domain.ru;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Активируй:

```bash
ln -s /etc/nginx/sites-available/bot /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 8. Получи SSL сертификат

```bash
certbot --nginx -d your-vps-domain.ru
```

## 9. Создай systemd сервис

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

[Install]
WantedBy=multi-user.target
```

## 10. Запусти бота

```bash
systemctl daemon-reload
systemctl enable tournament-bot
systemctl start tournament-bot
systemctl status tournament-bot
```

## 11. Настрой webhook

Открой в браузере:
```
https://your-vps-domain.ru/setup-webhook
```

Должен вернуть: `{"ok": true, "result": true}`

## 12. Проверь бота

Напиши боту `/start` в Telegram - должен ответить!

## Полезные команды

Проверить статус:
```bash
systemctl status tournament-bot
```

Посмотреть логи:
```bash
journalctl -u tournament-bot -f
```

Перезапустить:
```bash
systemctl restart tournament-bot
```

## Готово! 🚀

Бот работает и принимает команды!
