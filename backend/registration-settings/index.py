import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any

def verify_admin_token(event: Dict[str, Any], conn) -> bool:
    """Проверяет токен администратора"""
    headers = event.get('headers', {})
    admin_token = headers.get('X-Admin-Token', headers.get('x-admin-token', ''))
    
    if not admin_token:
        return False
    
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT is_active FROM t_p68536388_team_registration_si.admin_users 
                WHERE username = %s AND is_active = true
            """, (admin_token,))
            admin = cur.fetchone()
            return admin is not None
    except:
        return False

def handler(event: dict, context: any) -> dict:
    '''
    Business: Manage tournament registration status (open/closed)
    Args: event with httpMethod, body; context with request_id
    Returns: HTTP response with registration status
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT is_open, updated_at::text, updated_by
                    FROM t_p68536388_team_registration_si.registration_settings 
                    ORDER BY id DESC LIMIT 1
                """)
                settings = cur.fetchone()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'is_open': settings['is_open'] if settings else True}),
                'isBase64Encoded': False
            }
        
        elif method == 'POST':
            # Проверка токена для изменения настроек
            if not verify_admin_token(event, conn):
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'message': 'Unauthorized'}),
                    'isBase64Encoded': False
                }
            
            body_data = json.loads(event.get('body', '{}'))
            is_open = body_data.get('is_open')
            updated_by = body_data.get('updated_by', 'admin')
            
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO t_p68536388_team_registration_si.registration_settings 
                    (is_open, updated_by)
                    VALUES (%s, %s)
                """, (is_open, updated_by))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Registration status updated', 'is_open': is_open}),
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