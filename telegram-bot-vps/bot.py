import os
import json
import psycopg2
from psycopg2.extras import RealDictCursor
import random
import string
import hashlib
from flask import Flask, request
import requests

app = Flask(__name__)

# Конфигурация из переменных окружения
BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN')
DATABASE_URL = os.environ.get('DATABASE_URL')
WEBHOOK_URL = os.environ.get('WEBHOOK_URL')  # https://ваш-vps-домен.ru/webhook

def generate_auth_code():
    """Генерирует код регистрации в формате REG-XXXX-XXXX"""
    part1 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    part2 = ''.join(random.choices(string.ascii_uppercase + string.digits, k=4))
    return f'REG-{part1}-{part2}'

def save_telegram_user(username, chat_id, first_name):
    """Сохранение или обновление пользователя Telegram"""
    if not username:
        return
    
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor() as cur:
            cur.execute("""
                INSERT INTO telegram_users (username, chat_id, first_name)
                VALUES (%s, %s, %s)
                ON CONFLICT (username) 
                DO UPDATE SET chat_id = EXCLUDED.chat_id, 
                              first_name = EXCLUDED.first_name,
                              updated_at = CURRENT_TIMESTAMP
            """, (username, chat_id, first_name))
            conn.commit()
    finally:
        conn.close()

def send_message(chat_id, text, parse_mode='HTML', reply_markup=None):
    """Отправка сообщения в Telegram"""
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/sendMessage'
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': parse_mode
    }
    if reply_markup:
        data['reply_markup'] = json.dumps(reply_markup)
    
    response = requests.post(url, json=data)
    return response.json()

def handle_start(chat_id):
    """Обработка команды /start"""
    send_message(chat_id, 
        "👋 Привет! Я бот для регистрации команд на турнир.\n\n"
        "Используйте /register чтобы зарегистрировать команду.\n"
        "Используйте /myteam чтобы посмотреть вашу команду.\n"
        "Используйте /help для помощи."
    )

def handle_help(chat_id):
    """Обработка команды /help"""
    send_message(chat_id,
        "📋 Доступные команды:\n\n"
        "/register - Регистрация новой команды\n"
        "/myteam - Информация о вашей команде\n"
        "/cancel - Отменить регистрацию команды\n"
        "/help - Показать это сообщение"
    )

def handle_myteam(chat_id, telegram_username):
    """Показать команду пользователя"""
    if not telegram_username:
        send_message(chat_id, 
            "❌ У вас не установлен username в Telegram. "
            "Пожалуйста, установите username в настройках Telegram."
        )
        return
    
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT team_name, captain_name, members_info, status, admin_comment, auth_code
                FROM teams 
                WHERE captain_telegram = %s
            """, (f'@{telegram_username}',))
            team = cur.fetchone()
        
        if team:
            status_text = {
                'pending': '⏳ На модерации',
                'approved': '✅ Одобрена',
                'rejected': '❌ Отклонена'
            }.get(team['status'], team['status'])
            
            response = (
                f"🏆 Ваша команда: {team['team_name']}\n"
                f"👤 Капитан: {team['captain_name']}\n"
                f"📊 Статус: {status_text}\n"
                f"🔑 Код регистрации: <code>{team['auth_code']}</code>\n\n"
                f"👥 Состав:\n{team['members_info']}"
            )
            
            if team['admin_comment']:
                response += f"\n\n💬 Комментарий администратора:\n{team['admin_comment']}"
            
            send_message(chat_id, response)
        else:
            send_message(chat_id, 
                "❌ У вас нет зарегистрированной команды.\n\n"
                "Используйте /register для регистрации."
            )
    finally:
        conn.close()

def handle_register(chat_id):
    """Начало регистрации команды"""
    send_message(chat_id,
        "📝 <b>Регистрация команды</b>\n\n"
        "Для удобства регистрации, пожалуйста, перейдите на сайт:\n"
        "https://ce876244.tw1.ru/\n\n"
        "Там вы сможете заполнить форму регистрации с полным составом команды."
    )

@app.route('/webhook', methods=['POST'])
def webhook():
    """Обработка webhook от Telegram"""
    if not BOT_TOKEN or not DATABASE_URL:
        return {'error': 'Configuration error'}, 500
    
    update = request.get_json()
    
    if 'message' not in update:
        return {'ok': True}
    
    message = update['message']
    chat_id = message['chat']['id']
    text = message.get('text', '')
    telegram_username = message['from'].get('username', '')
    first_name = message['from'].get('first_name', '')
    
    # Сохраняем пользователя при любом взаимодействии
    if telegram_username:
        save_telegram_user(telegram_username, chat_id, first_name)
    
    # Обработка команд
    if text.startswith('/start'):
        handle_start(chat_id)
    elif text.startswith('/help'):
        handle_help(chat_id)
    elif text.startswith('/myteam'):
        handle_myteam(chat_id, telegram_username)
    elif text.startswith('/register'):
        handle_register(chat_id)
    
    return {'ok': True}

@app.route('/notify-captain', methods=['POST'])
def notify_captain():
    """Отправка уведомления капитану команды"""
    data = request.get_json()
    
    captain_telegram = data.get('captain_telegram', '').lstrip('@')
    message_text = data.get('message')
    
    if not captain_telegram or not message_text:
        return {'error': 'Missing captain_telegram or message'}, 400
    
    conn = psycopg2.connect(DATABASE_URL)
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT chat_id FROM telegram_users 
                WHERE username = %s
            """, (captain_telegram,))
            user = cur.fetchone()
        
        if user:
            send_message(user['chat_id'], message_text)
            return {'success': True, 'sent': True}
        else:
            return {'success': True, 'sent': False, 'reason': 'User not found'}
    finally:
        conn.close()

@app.route('/health', methods=['GET'])
def health():
    """Проверка здоровья бота"""
    return {'status': 'ok', 'bot': 'running'}

@app.route('/setup-webhook', methods=['GET'])
def setup_webhook():
    """Настройка webhook (вызывается один раз)"""
    if not WEBHOOK_URL:
        return {'error': 'WEBHOOK_URL not configured'}, 400
    
    url = f'https://api.telegram.org/bot{BOT_TOKEN}/setWebhook'
    response = requests.post(url, json={'url': f'{WEBHOOK_URL}/webhook'})
    return response.json()

if __name__ == '__main__':
    # Для локального тестирования
    app.run(host='0.0.0.0', port=5000, debug=True)