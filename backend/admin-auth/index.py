import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor
from typing import Dict, Any
import hashlib

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Управление администраторами - авторизация, получение списка, удаление
    Args: event с httpMethod, body с username и password; context с request_id
    Returns: HTTP response с результатом операции
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Username',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'message': 'Database not configured'}),
            'isBase64Encoded': False
        }
    
    if method == 'GET':
        admin_username = event.get('headers', {}).get('X-Admin-Username', '')
        
        if admin_username != '@Rywrxuna':
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'message': 'Access denied'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute("""
                    SELECT id, username, telegram_id, created_at, last_login, is_active 
                    FROM t_p68536388_team_registration_si.admin_users 
                    ORDER BY created_at DESC
                """)
                admins = cur.fetchall()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True, 
                    'admins': [dict(admin) for admin in admins]
                }, default=str),
                'isBase64Encoded': False
            }
        finally:
            conn.close()
    
    if method == 'DELETE':
        admin_username = event.get('headers', {}).get('X-Admin-Username', '')
        
        if admin_username != '@Rywrxuna':
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'message': 'Access denied'}),
                'isBase64Encoded': False
            }
        
        body_data = json.loads(event.get('body', '{}'))
        admin_id = body_data.get('admin_id')
        
        if not admin_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'message': 'admin_id required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        try:
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                cur.execute(f"""
                    SELECT username FROM t_p68536388_team_registration_si.admin_users 
                    WHERE id = {admin_id}
                """)
                admin = cur.fetchone()
                
                if admin and admin['username'] == '@Rywrxuna':
                    return {
                        'statusCode': 400,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': False, 'message': 'Cannot delete superadmin'}),
                        'isBase64Encoded': False
                    }
                
                cur.execute(f"""
                    DELETE FROM t_p68536388_team_registration_si.admin_users 
                    WHERE id = {admin_id}
                """)
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': True, 'message': 'Admin deleted'}),
                'isBase64Encoded': False
            }
        finally:
            conn.close()
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        username = body_data.get('username', '')
        password = body_data.get('password', '')
        
        if not username or not password:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'message': 'Username and password required'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(db_url)
        try:
            password_hash = hashlib.sha256(password.encode()).hexdigest()
            
            with conn.cursor(cursor_factory=RealDictCursor) as cur:
                username_escaped = username.replace("'", "''")
                cur.execute(f"""
                    SELECT id, username, is_active 
                    FROM t_p68536388_team_registration_si.admin_users 
                    WHERE username = '{username_escaped}' AND password_hash = '{password_hash}'
                """)
                admin = cur.fetchone()
            
            if admin and admin['is_active']:
                with conn.cursor() as cur:
                    cur.execute(f"""
                        UPDATE t_p68536388_team_registration_si.admin_users 
                        SET last_login = CURRENT_TIMESTAMP 
                        WHERE id = {admin['id']}
                    """)
                    conn.commit()
                
                is_superadmin = admin['username'] == '@Rywrxuna'
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True, 
                        'message': 'Authorization successful',
                        'username': admin['username'],
                        'is_superadmin': is_superadmin
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 401,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': False, 'message': 'Invalid username or password'}),
                    'isBase64Encoded': False
                }
        finally:
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }