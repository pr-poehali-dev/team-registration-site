import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления заявками команд - создание, получение списка, обновление статуса
    Args: event с httpMethod, body, queryStringParameters; context с request_id
    Returns: HTTP response с списком команд или результатом операции
    '''
    method: str = event.get('httpMethod', 'GET')
    
    # Handle CORS OPTIONS
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    conn = psycopg2.connect(db_url)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            captain_telegram = params.get('captain_telegram')
            
            if captain_telegram:
                # Найти команду по Telegram капитана
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, team_name, captain_name, captain_telegram, 
                               members_count, members_info, status, admin_comment, 
                               created_at::text
                        FROM t_p68536388_team_registration_si.teams 
                        WHERE captain_telegram = %s
                    """, (captain_telegram,))
                    team = cur.fetchone()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'team': team}),
                    'isBase64Encoded': False
                }
            else:
                # Получить список всех команд
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT id, team_name, captain_name, captain_telegram, 
                               members_count, members_info, status, admin_comment, 
                               created_at::text
                        FROM t_p68536388_team_registration_si.teams 
                        ORDER BY created_at DESC
                    """)
                    teams = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'teams': teams}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            # Создать новую заявку
            body_data = json.loads(event.get('body', '{}'))
            
            # Формируем members_info из всех полей
            members_list = [
                f"Топ: {body_data.get('top_player', '')} - Телеграм: {body_data.get('top_telegram', '')}",
                f"Лес: {body_data.get('jungle_player', '')} - Телеграм: {body_data.get('jungle_telegram', '')}",
                f"Мид: {body_data.get('mid_player', '')} - Телеграм: {body_data.get('mid_telegram', '')}",
                f"АДК: {body_data.get('adc_player', '')} - Телеграм: {body_data.get('adc_telegram', '')}",
                f"Саппорт: {body_data.get('support_player', '')} - Телеграм: {body_data.get('support_telegram', '')}"
            ]
            
            if body_data.get('sub1_player'):
                members_list.append(f"Запасной 1: {body_data.get('sub1_player', '')} - Телеграм: {body_data.get('sub1_telegram', '')}")
            if body_data.get('sub2_player'):
                members_list.append(f"Запасной 2: {body_data.get('sub2_player', '')} - Телеграм: {body_data.get('sub2_telegram', '')}")
            
            members_info = '\n'.join(members_list)
            
            try:
                with conn.cursor() as cur:
                    # Проверка на существующего капитана
                    cur.execute("""
                        SELECT id FROM t_p68536388_team_registration_si.teams 
                        WHERE captain_telegram = %s
                    """, (body_data['captain_telegram'],))
                    
                    existing_team = cur.fetchone()
                    if existing_team:
                        return {
                            'statusCode': 409,
                            'headers': {
                                'Content-Type': 'application/json',
                                'Access-Control-Allow-Origin': '*'
                            },
                            'body': json.dumps({'error': 'Вы уже зарегистрировали команду. Один человек может зарегистрировать только одну команду.'}),
                            'isBase64Encoded': False
                        }
                    
                    cur.execute("""
                        INSERT INTO t_p68536388_team_registration_si.teams 
                        (team_name, captain_name, captain_telegram, members_count, members_info, captain_email)
                        VALUES (%s, %s, %s, %s, %s, %s)
                        RETURNING id
                    """, (
                        body_data['team_name'],
                        body_data['captain_name'],
                        body_data['captain_telegram'],
                        5,
                        members_info,
                        body_data.get('captain_email', 'no-email@provided.com')
                    ))
                    team_id = cur.fetchone()[0]
                    conn.commit()
                
                return {
                    'statusCode': 201,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'id': team_id, 
                        'message': 'Team registered successfully'
                    }),
                    'isBase64Encoded': False
                }
            except Exception as e:
                if 'duplicate key' in str(e).lower() or 'unique' in str(e).lower():
                    return {
                        'statusCode': 409,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'error': 'Вы уже зарегистрировали команду. Один человек может зарегистрировать только одну команду.'}),
                        'isBase64Encoded': False
                    }
                raise
        
        elif method == 'PUT':
            # Обновить статус команды (только для админа)
            body_data = json.loads(event.get('body', '{}'))
            team_id = body_data.get('id')
            new_status = body_data.get('status')
            admin_comment = body_data.get('admin_comment', '')
            
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE t_p68536388_team_registration_si.teams 
                    SET status = %s, admin_comment = %s, updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (new_status, admin_comment, team_id))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Team status updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'PATCH':
            # Обновить команду
            body_data = json.loads(event.get('body', '{}'))
            team_id = body_data.get('id')
            team_name = body_data.get('team_name')
            captain_name = body_data.get('captain_name')
            captain_telegram = body_data.get('captain_telegram')
            members_info = body_data.get('members_info')
            
            if not team_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Team ID is required'}),
                    'isBase64Encoded': False
                }
            
            with conn.cursor() as cur:
                cur.execute("""
                    UPDATE t_p68536388_team_registration_si.teams 
                    SET team_name = %s, 
                        captain_name = %s, 
                        captain_telegram = %s,
                        members_info = %s, 
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (team_name, captain_name, captain_telegram, members_info, team_id))
                conn.commit()
            
            send_telegram_notification(conn, team_id, 'updated')
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Team updated'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить команду
            params = event.get('queryStringParameters', {})
            team_id = params.get('id')
            
            send_telegram_notification(conn, team_id, 'deleted')
            
            with conn.cursor() as cur:
                cur.execute("""
                    DELETE FROM t_p68536388_team_registration_si.teams WHERE id = %s
                """, (team_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Team deleted'}),
                'isBase64Encoded': False
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Method not allowed'}),
                'isBase64Encoded': False
            }
    
    finally:
        conn.close()

def send_telegram_notification(conn, team_id: int, action: str):
    try:
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        if not bot_token:
            return
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT team_name, captain_name, captain_telegram, members_info
                FROM t_p68536388_team_registration_si.teams 
                WHERE id = %s
            """, (team_id,))
            team = cur.fetchone()
        
        if not team or not team['captain_telegram']:
            return
        
        telegram = team['captain_telegram']
        if not telegram.startswith('@'):
            return
        
        username = telegram[1:]
        
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT chat_id FROM t_p68536388_team_registration_si.telegram_users 
                WHERE username = %s
            """, (username,))
            user = cur.fetchone()
        
        if not user:
            return
        
        chat_id = user['chat_id']
        
        if action == 'updated':
            message = (
                f"⚠️ <b>Ваша команда была изменена администратором</b>\n\n"
                f"🏆 Команда: {team['team_name']}\n"
                f"👤 Капитан: {team['captain_name']}\n\n"
                f"📋 Новый состав:\n{team['members_info']}\n\n"
                f"Используйте /myteam для просмотра деталей"
            )
        elif action == 'deleted':
            message = (
                f"❌ <b>Ваша команда была удалена администратором</b>\n\n"
                f"🏆 Команда: {team['team_name']}\n"
                f"👤 Капитан: {team['captain_name']}\n\n"
                f"Вы можете зарегистрироваться снова используя /register"
            )
        else:
            return
        
        send_message(bot_token, chat_id, message)
    except Exception as e:
        print(f"Failed to send notification: {str(e)}")

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