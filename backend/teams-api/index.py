import json
import os
import hashlib
import secrets
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any, Optional
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления регистрацией команд турнира
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: HTTP response с данными команд, настройками или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    # Подключение к БД
    dsn = os.environ.get('DATABASE_URL')
    if not dsn:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'DATABASE_URL not configured'})
        }
    
    conn = psycopg2.connect(dsn)
    conn.autocommit = True
    cursor = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        if method == 'GET':
            return handle_get(event, cursor)
        elif method == 'POST':
            return handle_post(event, cursor, conn)
        elif method in ['PUT', 'PATCH']:
            return handle_put(event, cursor)
        elif method == 'DELETE':
            return handle_delete(event, cursor)
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'error': 'Method not allowed'})
            }
    finally:
        cursor.close()
        conn.close()

def handle_get(event: Dict[str, Any], cursor) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    resource = params.get('resource')
    auth_code = params.get('auth_code')
    
    # Получить настройки регистрации
    if resource == 'settings':
        cursor.execute("SELECT is_open FROM registration_settings ORDER BY updated_at DESC LIMIT 1")
        row = cursor.fetchone()
        is_open = row['is_open'] if row else True
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'is_open': is_open})
        }
    
    # Получить матчи
    if resource == 'matches':
        cursor.execute("""
            SELECT m.*, t1.team_name as team1_name, t2.team_name as team2_name
            FROM matches m
            LEFT JOIN teams t1 ON m.team1_id = t1.id
            LEFT JOIN teams t2 ON m.team2_id = t2.id
            ORDER BY m.bracket_type, m.round_number, m.match_number
        """)
        matches = cursor.fetchall()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'matches': matches}, default=str)
        }
    
    # Поиск команды по коду
    if auth_code:
        code_clean = auth_code.upper().replace('-', '').replace(' ', '').replace('REG', '')
        
        cursor.execute("""
            SELECT * FROM teams 
            WHERE REPLACE(REPLACE(REPLACE(UPPER(auth_code), 'REG', ''), '-', ''), ' ', '') = %s
        """, (code_clean,))
        team = cursor.fetchone()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'team': team, 'success': team is not None}, default=str)
        }
    
    # Получить все команды
    cursor.execute("SELECT * FROM teams ORDER BY created_at DESC")
    teams = cursor.fetchall()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'teams': teams}, default=str)
    }

def handle_post(event: Dict[str, Any], cursor, conn) -> Dict[str, Any]:
    body_str = event.get('body', '{}')
    data = json.loads(body_str) if body_str else {}
    resource = data.get('resource')
    
    # Аутентификация админа
    if resource == 'auth':
        username = data.get('username', '')
        password = data.get('password', '')
        
        cursor.execute("SELECT * FROM admin_users WHERE username = %s", (username,))
        user = cursor.fetchone()
        
        if user and hashlib.sha256(password.encode()).hexdigest() == user['password_hash']:
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({
                    'success': True,
                    'username': user['username'],
                    'is_superadmin': user['is_superadmin']
                })
            }
        else:
            return {
                'statusCode': 401,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'isBase64Encoded': False,
                'body': json.dumps({'success': False, 'error': 'Неверный логин или пароль'})
            }
    
    # Обновить настройки регистрации
    if resource == 'settings':
        is_open = data.get('is_open', True)
        updated_by = data.get('updated_by', 'admin')
        
        cursor.execute("SELECT id FROM registration_settings ORDER BY updated_at DESC LIMIT 1")
        existing = cursor.fetchone()
        
        if existing:
            cursor.execute("""
                UPDATE registration_settings 
                SET is_open = %s, updated_by = %s, updated_at = NOW() 
                WHERE id = %s
            """, (is_open, updated_by, existing['id']))
        else:
            cursor.execute("""
                INSERT INTO registration_settings (is_open, updated_by) 
                VALUES (%s, %s)
            """, (is_open, updated_by))
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True, 'is_open': is_open})
        }
    
    # Создать команду
    auth_code = f"REG-{secrets.token_hex(2).upper()}-{secrets.token_hex(2).upper()}"
    
    cursor.execute("""
        INSERT INTO teams (team_name, captain_name, captain_telegram, members_count, members_info, auth_code, status)
        VALUES (%s, %s, %s, %s, %s, %s, 'pending')
        RETURNING id
    """, (
        data.get('team_name'),
        data.get('captain_name'),
        data.get('captain_telegram'),
        data.get('members_count'),
        data.get('members_info'),
        auth_code
    ))
    
    team_id = cursor.fetchone()['id']
    
    # Отправить уведомление через Telegram
    send_telegram_notification(team_id, auth_code, data.get('captain_telegram'))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True, 'auth_code': auth_code, 'team_id': team_id})
    }

def handle_put(event: Dict[str, Any], cursor) -> Dict[str, Any]:
    body_str = event.get('body', '{}')
    data = json.loads(body_str) if body_str else {}
    
    # Админ обновляет статус
    if 'status' in data:
        cursor.execute("UPDATE teams SET status = %s WHERE id = %s", (data['status'], data['id']))
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'success': True})
        }
    
    # Проверка открытости регистрации
    cursor.execute("SELECT is_open FROM registration_settings ORDER BY updated_at DESC LIMIT 1")
    row = cursor.fetchone()
    
    if not row or not row['is_open']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'error': 'Registration closed',
                'message': 'Регистрация завершена. Редактирование команд больше не доступно.'
            })
        }
    
    # Обновление данных команды
    members_info = data.get('members_info', '')
    members_count = len([line for line in members_info.split('\n') if line.strip()])
    
    cursor.execute("""
        UPDATE teams SET team_name = %s, captain_name = %s, captain_telegram = %s,
               members_count = %s, members_info = %s
        WHERE id = %s
    """, (
        data.get('team_name'),
        data.get('captain_name'),
        data.get('captain_telegram'),
        members_count,
        members_info,
        data.get('id')
    ))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True})
    }

def handle_delete(event: Dict[str, Any], cursor) -> Dict[str, Any]:
    params = event.get('queryStringParameters') or {}
    team_id = params.get('id')
    
    if not team_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({'error': 'Missing id parameter'})
        }
    
    # Проверка открытости регистрации
    cursor.execute("SELECT is_open FROM registration_settings ORDER BY updated_at DESC LIMIT 1")
    row = cursor.fetchone()
    
    if not row or not row['is_open']:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'isBase64Encoded': False,
            'body': json.dumps({
                'error': 'Registration closed',
                'message': 'Регистрация завершена. Удаление команд больше не доступно.'
            })
        }
    
    cursor.execute("DELETE FROM teams WHERE id = %s", (team_id,))
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({'success': True})
    }

def send_telegram_notification(team_id: int, auth_code: str, telegram_username: str):
    """Отправить код регистрации в Telegram"""
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    if not bot_token or not telegram_username:
        return
    
    import urllib.request
    import urllib.parse
    
    username_clean = telegram_username.replace('@', '')
    message = f"✅ Команда зарегистрирована!\n\n🔑 Код для редактирования: {auth_code}\n\nСохраните этот код для изменения данных команды."
    
    try:
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        data = urllib.parse.urlencode({
            'chat_id': f'@{username_clean}',
            'text': message
        }).encode()
        
        req = urllib.request.Request(url, data=data)
        urllib.request.urlopen(req, timeout=5)
    except:
        pass
