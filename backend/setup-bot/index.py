import json
import os
import urllib.request
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Автоматическая настройка и остановка webhook для Telegram бота
    Args: event с queryStringParameters (action=start|stop); context с request_id
    Returns: Результат настройки или остановки webhook
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'TELEGRAM_BOT_TOKEN не настроен',
                'instruction': 'Добавьте токен бота в секреты проекта'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters', {})
    action = params.get('action', 'start')
    
    webhook_url = 'https://functions.poehali.dev/efa0cbb2-68dd-40bd-8794-6060b8390af2'
    
    try:
        if action == 'stop':
            api_url = f'https://api.telegram.org/bot{bot_token}/deleteWebhook'
            
            with urllib.request.urlopen(api_url) as response:
                result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'success': True,
                        'message': 'Бот остановлен',
                        'action': 'stopped'
                    }, ensure_ascii=False),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 500,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'error': 'Ошибка остановки бота',
                        'details': result
                    }, ensure_ascii=False),
                    'isBase64Encoded': False
                }
        
        api_url = f'https://api.telegram.org/bot{bot_token}/setWebhook?url={webhook_url}'
        
        with urllib.request.urlopen(api_url) as response:
            result = json.loads(response.read().decode('utf-8'))
        
        if result.get('ok'):
            info_url = f'https://api.telegram.org/bot{bot_token}/getWebhookInfo'
            with urllib.request.urlopen(info_url) as response:
                webhook_info = json.loads(response.read().decode('utf-8'))
            
            me_url = f'https://api.telegram.org/bot{bot_token}/getMe'
            with urllib.request.urlopen(me_url) as response:
                bot_info = json.loads(response.read().decode('utf-8'))
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': True,
                    'message': 'Бот успешно настроен!',
                    'bot_username': bot_info.get('result', {}).get('username', ''),
                    'webhook_url': webhook_url,
                    'webhook_info': webhook_info.get('result', {}),
                    'bot_link': f"https://t.me/{bot_info.get('result', {}).get('username', '')}"
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'error': 'Ошибка настройки webhook',
                    'details': result
                }, ensure_ascii=False),
                'isBase64Encoded': False
            }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'message': 'Проверьте правильность токена бота'
            }, ensure_ascii=False),
            'isBase64Encoded': False
        }