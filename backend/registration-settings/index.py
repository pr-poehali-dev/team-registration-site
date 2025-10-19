import json
import os
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context: any) -> dict:
    '''
    Business: Tournament registration settings management
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