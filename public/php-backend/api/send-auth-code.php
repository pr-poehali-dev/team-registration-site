<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Конфигурация
$bot_token = '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds';
$db_host = 'localhost';
$db_name = 'ce876244_tournam';
$db_user = 'ce876244_tournam';
$db_pass = 'kh5-XQi-EWE-9gS';

// Подключение к БД
try {
    $pdo = new PDO("mysql:host=$db_host;dbname=$db_name;charset=utf8mb4", $db_user, $db_pass);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

// Функция отправки сообщения в Telegram
function sendMessage($bot_token, $chat_id, $text, $parse_mode = 'HTML') {
    $url = "https://api.telegram.org/bot{$bot_token}/sendMessage";
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => $parse_mode
    ];
    
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    return json_decode($result, true);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $team_id = $data['team_id'] ?? null;
    
    if (!$team_id) {
        http_response_code(400);
        echo json_encode(['error' => 'team_id required']);
        exit;
    }
    
    // Получить данные команды
    $stmt = $pdo->prepare("SELECT * FROM teams WHERE id = ?");
    $stmt->execute([$team_id]);
    $team = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$team) {
        http_response_code(404);
        echo json_encode(['error' => 'Team not found']);
        exit;
    }
    
    // Получить chat_id капитана
    $captain_username = str_replace('@', '', $team['captain_telegram']);
    $stmt = $pdo->prepare("SELECT chat_id FROM telegram_users WHERE username = ?");
    $stmt->execute([$captain_username]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user || !$user['chat_id']) {
        echo json_encode([
            'success' => false, 
            'error' => 'Captain not found in Telegram. Капитан должен написать боту /start'
        ]);
        exit;
    }
    
    $chat_id = $user['chat_id'];
    
    // Отправить код регистрации
    $message = 
        "🎉 <b>Команда успешно зарегистрирована!</b>\n\n" .
        "Название: <b>{$team['team_name']}</b>\n" .
        "Капитан: <b>{$team['captain_name']}</b>\n\n" .
        "🔑 <b>Ваш код регистрации:</b>\n" .
        "<code>{$team['auth_code']}</code>\n\n" .
        "📋 <b>Что дальше?</b>\n" .
        "• Сохраните этот код\n" .
        "• Ожидайте проверки заявки администратором\n" .
        "• Используйте /myteam для просмотра статуса\n\n" .
        "Статус: ⏳ На модерации";
    
    $result = sendMessage($bot_token, $chat_id, $message);
    
    if ($result && isset($result['ok']) && $result['ok']) {
        echo json_encode(['success' => true, 'message' => 'Auth code sent to captain']);
    } else {
        echo json_encode(['success' => false, 'error' => 'Failed to send message']);
    }
}
?>
