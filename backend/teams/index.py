import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
                f"Топ: {body_data.get('top_player', '')} ({body_data.get('top_telegram', '')})",
                f"Лес: {body_data.get('jungle_player', '')} ({body_data.get('jungle_telegram', '')})",
                f"Мид: {body_data.get('mid_player', '')} ({body_data.get('mid_telegram', '')})",
                f"АДК: {body_data.get('adc_player', '')} ({body_data.get('adc_telegram', '')})",
                f"Саппорт: {body_data.get('support_player', '')} ({body_data.get('support_telegram', '')})"
            ]
            
            if body_data.get('sub1_player'):
                members_list.append(f"Запасной 1: {body_data.get('sub1_player', '')} ({body_data.get('sub1_telegram', '')})")
            if body_data.get('sub2_player'):
                members_list.append(f"Запасной 2: {body_data.get('sub2_player', '')} ({body_data.get('sub2_telegram', '')})")
            
            members_info = '\n'.join(members_list)
            
            with conn.cursor() as cur:
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
                'body': json.dumps({'id': team_id, 'message': 'Team registered successfully'}),
                'isBase64Encoded': False
            }
        
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
        
        elif method == 'DELETE':
            # Удалить команду (только для админа)
            params = event.get('queryStringParameters', {})
            team_id = params.get('id')
            
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
                    DELETE FROM t_p68536388_team_registration_si.teams 
                    WHERE id = %s
                """, (team_id,))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Team deleted successfully'}),
                'isBase64Encoded': False
            }
        
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