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
            params = event.get('queryStringParameters', {}) or {}
            resource = params.get('resource')
            captain_telegram = params.get('captain_telegram')
            
            # Экспорт команд в CSV
            if resource == 'export':
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT team_name, captain_name, captain_telegram, 
                               members_info, status, created_at::text
                        FROM t_p68536388_team_registration_si.teams 
                        ORDER BY created_at DESC
                    """)
                    teams = cur.fetchall()
                
                csv_lines = ['Team Name,Captain Name,Captain Telegram,Status,Created At,Members Info']
                
                for team in teams:
                    members_clean = team['members_info'].replace('\n', ' | ').replace(',', ';')
                    csv_lines.append(
                        f'"{team["team_name"]}","{team["captain_name"]}","{team["captain_telegram"]}",'
                        f'"{team["status"]}","{team["created_at"]}","{members_clean}"'
                    )
                
                csv_content = '\n'.join(csv_lines)
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'csv': csv_content,
                        'total': len(teams)
                    }),
                    'isBase64Encoded': False
                }
            
            # Управление матчами
            if resource == 'matches':
                with conn.cursor(cursor_factory=RealDictCursor) as cur:
                    cur.execute("""
                        SELECT 
                            m.id, m.match_number, m.bracket_type, m.round_number,
                            m.team1_id, m.team2_id, m.team1_placeholder, m.team2_placeholder,
                            m.score1, m.score2, m.winner, m.status, m.scheduled_time,
                            t1.team_name as team1_name, t2.team_name as team2_name
                        FROM t_p68536388_team_registration_si.matches m
                        LEFT JOIN t_p68536388_team_registration_si.teams t1 ON m.team1_id = t1.id
                        LEFT JOIN t_p68536388_team_registration_si.teams t2 ON m.team2_id = t2.id
                        ORDER BY m.bracket_type, m.round_number, m.match_number
                    """)
                    matches = cur.fetchall()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'matches': [dict(match) for match in matches]
                    }, default=str),
                    'isBase64Encoded': False
                }
            
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
            body_data = json.loads(event.get('body', '{}'))
            resource = body_data.get('resource')
            
            # Обновить матч
            if resource == 'match':
                match_id = body_data.get('match_id')
                
                if not match_id:
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': False, 'message': 'match_id required'}),
                        'isBase64Encoded': False
                    }
                
                with conn.cursor() as cur:
                    cur.execute("""
                        UPDATE t_p68536388_team_registration_si.matches 
                        SET team1_id = %s, team2_id = %s, score1 = %s, score2 = %s, 
                            winner = %s, status = %s, scheduled_time = %s, updated_at = CURRENT_TIMESTAMP
                        WHERE id = %s
                    """, (
                        body_data.get('team1_id'),
                        body_data.get('team2_id'),
                        body_data.get('score1'),
                        body_data.get('score2'),
                        body_data.get('winner'),
                        body_data.get('status'),
                        body_data.get('scheduled_time'),
                        match_id
                    ))
                    conn.commit()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Match updated'}),
                    'isBase64Encoded': False
                }
            
            # Обновить статус команды (только для админа)
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
            
            action_data = {
                'team_name': team_name,
                'captain_name': captain_name,
                'captain_telegram': captain_telegram,
                'members_info': members_info
            }
            
            action_id = create_pending_action(conn, team_id, 'update', action_data)
            send_confirmation_request(conn, team_id, action_id, 'update', action_data)
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Confirmation request sent to captain'}),
                'isBase64Encoded': False
            }
        
        elif method == 'DELETE':
            # Удалить команду
            params = event.get('queryStringParameters', {})
            team_id = params.get('id')
            
            action_id = create_pending_action(conn, int(team_id), 'delete', {})
            send_confirmation_request(conn, int(team_id), action_id, 'delete', {})
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Confirmation request sent to captain'}),
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

def create_pending_action(conn, team_id: int, action_type: str, action_data: dict) -> int:
    with conn.cursor() as cur:
        cur.execute("""
            INSERT INTO t_p68536388_team_registration_si.pending_actions 
            (team_id, action_type, action_data, status)
            VALUES (%s, %s, %s, 'pending')
            RETURNING id
        """, (team_id, action_type, json.dumps(action_data)))
        action_id = cur.fetchone()[0]
        conn.commit()
        return action_id

def send_confirmation_request(conn, team_id: int, action_id: int, action_type: str, action_data: dict):
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
        
        if action_type == 'update':
            message = (
                f"⚠️ <b>Запрос на изменение команды</b>\n\n"
                f"🏆 Текущая команда: {team['team_name']}\n\n"
                f"📝 <b>Новые данные:</b>\n"
                f"Название: {action_data.get('team_name', team['team_name'])}\n"
                f"Капитан: {action_data.get('captain_name', team['captain_name'])}\n"
                f"Telegram: {action_data.get('captain_telegram', team['captain_telegram'])}\n\n"
                f"📋 Новый состав:\n{action_data.get('members_info', team['members_info'])}\n\n"
                f"Подтвердите или отклоните изменения:"
            )
        elif action_type == 'delete':
            message = (
                f"❌ <b>Запрос на удаление команды</b>\n\n"
                f"🏆 Команда: {team['team_name']}\n"
                f"👤 Капитан: {team['captain_name']}\n\n"
                f"⚠️ Это действие нельзя отменить!\n\n"
                f"Подтвердите или отклоните удаление:"
            )
        else:
            return
        
        keyboard = {
            'inline_keyboard': [[
                {'text': '✅ Подтвердить', 'callback_data': f'confirm_{action_id}'},
                {'text': '❌ Отклонить', 'callback_data': f'cancel_{action_id}'}
            ]]
        }
        
        send_message_with_keyboard(bot_token, chat_id, message, keyboard)
    except Exception as e:
        print(f"Failed to send confirmation request: {str(e)}")

def send_message_with_keyboard(bot_token: str, chat_id: int, text: str, keyboard: dict):
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'HTML',
        'reply_markup': keyboard
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