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
        
        if 'callback_query' in update:
            return handle_callback_query(update['callback_query'], bot_token, db_url)
        
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

def handle_callback_query(callback_query: dict, bot_token: str, db_url: str):
    try:
        callback_id = callback_query['id']
        chat_id = callback_query['message']['chat']['id']
        message_id = callback_query['message']['message_id']
        data = callback_query['data']
        
        action, action_id = data.split('_', 1)
        action_id = int(action_id)
        
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT team_id, action_type, action_data, status 
                    FROM t_p68536388_team_registration_si.pending_actions 
                    WHERE id = %s
                """, (action_id,))
                pending_action = cur.fetchone()
            
            if not pending_action or pending_action['status'] != 'pending':
                answer_callback_query(bot_token, callback_id, '❌ Действие уже обработано или не найдено')
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json'},
                    'body': json.dumps({'ok': True}),
                    'isBase64Encoded': False
                }
            
            team_id = pending_action['team_id']
            action_type = pending_action['action_type']
            action_data_raw = pending_action['action_data']
            
            if isinstance(action_data_raw, str):
                action_data = json.loads(action_data_raw) if action_data_raw else {}
            elif isinstance(action_data_raw, dict):
                action_data = action_data_raw
            else:
                action_data = {}
            
            if action == 'confirm':
                if action_type == 'update':
                    with conn.cursor() as cur:
                        cur.execute("""
                            UPDATE t_p68536388_team_registration_si.teams 
                            SET team_name = %s, 
                                captain_name = %s, 
                                captain_telegram = %s,
                                members_info = %s, 
                                updated_at = CURRENT_TIMESTAMP
                            WHERE id = %s
                        """, (
                            action_data['team_name'],
                            action_data['captain_name'],
                            action_data['captain_telegram'],
                            action_data['members_info'],
                            team_id
                        ))
                        conn.commit()
                    
                    edit_message(bot_token, chat_id, message_id, 
                        '✅ <b>Изменения подтверждены и применены!</b>\n\n'
                        f'Команда "{action_data["team_name"]}" успешно обновлена.')
                    answer_callback_query(bot_token, callback_id, '✅ Изменения применены')
                
                elif action_type == 'delete':
                    with conn.cursor() as cur:
                        cur.execute("""
                            DELETE FROM t_p68536388_team_registration_si.teams WHERE id = %s
                        """, (team_id,))
                        conn.commit()
                    
                    edit_message(bot_token, chat_id, message_id,
                        '✅ <b>Удаление подтверждено!</b>\n\n'
                        'Ваша команда удалена из системы. Вы можете зарегистрироваться снова используя /register')
                    answer_callback_query(bot_token, callback_id, '✅ Команда удалена')
                
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE t_p68536388_team_registration_si.pending_actions 
                        SET status = 'confirmed' WHERE id = %s
                    """, (action_id,))
                    conn.commit()
            
            elif action == 'cancel':
                edit_message(bot_token, chat_id, message_id,
                    '❌ <b>Действие отклонено</b>\n\n'
                    'Изменения не были применены.')
                answer_callback_query(bot_token, callback_id, '❌ Действие отклонено')
                
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE t_p68536388_team_registration_si.pending_actions 
                        SET status = 'cancelled' WHERE id = %s
                    """, (action_id,))
                    conn.commit()
        
        finally:
            conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json'},
            'body': json.dumps({'ok': True}),
            'isBase64Encoded': False
        }
    
    except Exception as e:
        print(f"Error handling callback: {str(e)}")
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

def edit_message(bot_token: str, chat_id: int, message_id: int, text: str):
    url = f"https://api.telegram.org/bot{bot_token}/editMessageText"
    data = {
        'chat_id': chat_id,
        'message_id': message_id,
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
        print(f"Failed to edit message: {str(e)}")
        return None

def answer_callback_query(bot_token: str, callback_id: str, text: str):
    url = f"https://api.telegram.org/bot{bot_token}/answerCallbackQuery"
    data = {
        'callback_query_id': callback_id,
        'text': text
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
        print(f"Failed to answer callback: {str(e)}")
        return None