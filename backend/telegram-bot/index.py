import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import urllib.request
import urllib.parse

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram бот для регистрации команд - обработка сообщений и команд
    Args: event с httpMethod, body от Telegram; context с request_id
    Returns: HTTP response для Telegram webhook
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    db_url = os.environ.get('DATABASE_URL')
    
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': 'Bot token not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        update = json.loads(event.get('body', '{}'))
        
        if 'message' not in update:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json'},
                'body': json.dumps({'ok': True}),
                'isBase64Encoded': False
            }
        
        message = update['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        telegram_username = message['from'].get('username', '')
        first_name = message['from'].get('first_name', '')
        last_name = message['from'].get('last_name', '')
        
        if telegram_username and db_url:
            conn = psycopg2.connect(db_url)
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO t_p68536388_team_registration_si.telegram_users 
                        (username, chat_id, first_name, last_name, updated_at)
                        VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                        ON CONFLICT (username) 
                        DO UPDATE SET 
                            chat_id = EXCLUDED.chat_id,
                            first_name = EXCLUDED.first_name,
                            last_name = EXCLUDED.last_name,
                            updated_at = CURRENT_TIMESTAMP
                    """, (telegram_username, chat_id, first_name, last_name))
                    conn.commit()
            finally:
                conn.close()
        
        if text.startswith('/start'):
            send_message(bot_token, chat_id, 
                "👋 Привет! Я бот для регистрации команд на турнир.\n\n"
                "Используйте /register чтобы зарегистрировать команду.\n"
                "Используйте /myteam чтобы посмотреть вашу команду.\n"
                "Используйте /help для помощи."
            )
        
        elif text.startswith('/help'):
            send_message(bot_token, chat_id,
                "📋 Доступные команды:\n\n"
                "/register - Регистрация новой команды\n"
                "/myteam - Информация о вашей команде\n"
                "/cancel - Отменить регистрацию команды\n"
                "/help - Показать это сообщение"
            )
        
        elif text.startswith('/myteam'):
            telegram_username = message['from'].get('username', '')
            if not telegram_username:
                send_message(bot_token, chat_id, 
                    "❌ У вас не установлен username в Telegram. "
                    "Пожалуйста, установите username в настройках Telegram."
                )
            else:
                conn = psycopg2.connect(db_url)
                try:
                    with conn.cursor(cursor_factory=RealDictCursor) as cur:
                        cur.execute("""
                            SELECT team_name, captain_name, members_info, status, admin_comment
                            FROM t_p68536388_team_registration_si.teams 
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
                            f"📊 Статус: {status_text}\n\n"
                            f"👥 Состав:\n{team['members_info']}"
                        )
                        
                        if team['admin_comment']:
                            response += f"\n\n💬 Комментарий администратора:\n{team['admin_comment']}"
                        
                        send_message(bot_token, chat_id, response)
                    else:
                        send_message(bot_token, chat_id,
                            "❌ У вас нет зарегистрированной команды.\n"
                            "Используйте /register для регистрации."
                        )
                finally:
                    conn.close()
        
        elif text.startswith('/register'):
            telegram_username = message['from'].get('username', '')
            if not telegram_username:
                send_message(bot_token, chat_id, 
                    "❌ У вас не установлен username в Telegram. "
                    "Пожалуйста, установите username в настройках Telegram и попробуйте снова."
                )
            else:
                conn = psycopg2.connect(db_url)
                try:
                    with conn.cursor() as cur:
                        cur.execute("""
                            SELECT id FROM t_p68536388_team_registration_si.teams 
                            WHERE captain_telegram = %s
                        """, (f'@{telegram_username}',))
                        
                        if cur.fetchone():
                            send_message(bot_token, chat_id,
                                "⚠️ Вы уже зарегистрировали команду!\n"
                                "Используйте /myteam чтобы посмотреть информацию."
                            )
                        else:
                            website_url = "https://" + event.get('headers', {}).get('Host', 'your-site.com')
                            send_message(bot_token, chat_id,
                                f"✅ Ваш Telegram: @{telegram_username}\n\n"
                                f"Для завершения регистрации перейдите на сайт и заполните форму:\n"
                                f"{website_url}\n\n"
                                f"Важно: используйте @{telegram_username} в поле 'Telegram капитана'"
                            )
                finally:
                    conn.close()
        
        elif text.startswith('/cancel'):
            telegram_username = message['from'].get('username', '')
            if not telegram_username:
                send_message(bot_token, chat_id, 
                    "❌ У вас не установлен username в Telegram."
                )
            else:
                conn = psycopg2.connect(db_url)
                try:
                    with conn.cursor() as cur:
                        cur.execute("""
                            DELETE FROM t_p68536388_team_registration_si.teams 
                            WHERE captain_telegram = %s
                        """, (f'@{telegram_username}',))
                        
                        if cur.rowcount > 0:
                            conn.commit()
                            send_message(bot_token, chat_id,
                                "✅ Регистрация команды отменена.\n"
                                "Вы можете зарегистрироваться снова используя /register"
                            )
                        else:
                            send_message(bot_token, chat_id,
                                "❌ У вас нет зарегистрированной команды."
                            )
                finally:
                    conn.close()
        
        else:
            send_message(bot_token, chat_id,
                "❓ Неизвестная команда. Используйте /help для списка команд."
            )
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def send_message(bot_token: str, chat_id: int, text: str):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML'
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode('utf-8'),
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        with urllib.request.urlopen(req) as response:
            return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Failed to send message: {str(e)}")
        return None