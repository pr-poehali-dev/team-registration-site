<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/telegram.php';

if (!defined('TELEGRAM_BOT_TOKEN') || !TELEGRAM_BOT_TOKEN) {
    http_response_code(500);
    echo json_encode([
        'error' => 'TELEGRAM_BOT_TOKEN не настроен',
        'instruction' => 'Добавьте токен бота в config/telegram.php'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

$action = $_GET['action'] ?? 'start';
$webhook_url = 'https://ce876244.tw1.ru/php-backend/api/telegram-bot.php';

try {
    if ($action === 'stop') {
        $api_url = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/deleteWebhook';
        
        $response = file_get_contents($api_url);
        $result = json_decode($response, true);
        
        if ($result['ok']) {
            echo json_encode([
                'success' => true,
                'message' => 'Бот остановлен',
                'action' => 'stopped'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            http_response_code(500);
            echo json_encode([
                'error' => 'Ошибка остановки бота',
                'details' => $result
            ], JSON_UNESCAPED_UNICODE);
        }
        exit;
    }
    
    // Set webhook
    $api_url = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/setWebhook?url=' . urlencode($webhook_url);
    
    $response = file_get_contents($api_url);
    $result = json_decode($response, true);
    
    if ($result['ok']) {
        // Get webhook info
        $info_url = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/getWebhookInfo';
        $webhook_info_response = file_get_contents($info_url);
        $webhook_info = json_decode($webhook_info_response, true);
        
        // Get bot info
        $me_url = 'https://api.telegram.org/bot' . TELEGRAM_BOT_TOKEN . '/getMe';
        $bot_info_response = file_get_contents($me_url);
        $bot_info = json_decode($bot_info_response, true);
        
        $bot_username = $bot_info['result']['username'] ?? '';
        
        echo json_encode([
            'success' => true,
            'message' => 'Бот успешно настроен!',
            'bot_username' => $bot_username,
            'webhook_url' => $webhook_url,
            'webhook_info' => $webhook_info['result'] ?? [],
            'bot_link' => "https://t.me/$bot_username"
        ], JSON_UNESCAPED_UNICODE);
        
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Ошибка настройки webhook',
            'details' => $result
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage(),
        'message' => 'Проверьте правильность токена бота'
    ], JSON_UNESCAPED_UNICODE);
}
