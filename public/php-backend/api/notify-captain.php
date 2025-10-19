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
function sendMessage($bot_token, $chat_id, $text, $parse_mode = 'HTML', $reply_markup = null) {
    $url = "https://api.telegram.org/bot{$bot_token}/sendMessage";
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => $parse_mode
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = $reply_markup;
    }
    
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
    $action = $data['action'] ?? 'change_request'; // change_request, status_update, admin_comment, send_auth_code
    $changes = $data['changes'] ?? [];
    $old_values = $data['old_values'] ?? [];
    $new_status = $data['new_status'] ?? null;
    $comment = $data['comment'] ?? null;
    
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
        echo json_encode(['success' => false, 'error' => 'Captain not found in Telegram']);
        exit;
    }
    
    $chat_id = $user['chat_id'];
    
    // Отправить уведомление в зависимости от действия
    if ($action === 'change_request') {
        // Сохранить изменения в pending_changes
        $stmt = $pdo->prepare(
            "INSERT INTO pending_changes (team_id, changes, old_values, created_at) 
             VALUES (?, ?, ?, NOW())"
        );
        $stmt->execute([
            $team_id,
            json_encode($changes),
            json_encode($old_values)
        ]);
        
        // Сформировать текст с изменениями
        $changes_text = "";
        $field_names = [
            'team_name' => 'Название команды',
            'captain_name' => 'Имя капитана',
            'captain_telegram' => 'Telegram капитана',
            'members_info' => 'Состав команды'
        ];
        
        foreach ($changes as $field => $new_value) {
            $field_label = $field_names[$field] ?? $field;
            $old_value = $old_values[$field] ?? 'не указано';
            
            if ($field === 'members_info') {
                $changes_text .= "\n\n<b>{$field_label}:</b>\n";
                $changes_text .= "Старый:\n<code>{$old_value}</code>\n\n";
                $changes_text .= "Новый:\n<code>{$new_value}</code>";
            } else {
                $changes_text .= "\n\n<b>{$field_label}:</b>\n";
                $changes_text .= "Было: <code>{$old_value}</code>\n";
                $changes_text .= "Стало: <code>{$new_value}</code>";
            }
        }
        
        $message = 
            "⚠️ <b>Запрос на изменение данных команды</b>\n\n" .
            "Команда: <b>{$team['team_name']}</b>\n" .
            $changes_text . "\n\n" .
            "Вы подтверждаете эти изменения?";
        
        $keyboard = [
            'inline_keyboard' => [
                [
                    ['text' => '✅ Подтвердить', 'callback_data' => "approve_change_{$team_id}"],
                    ['text' => '❌ Отклонить', 'callback_data' => "reject_change_{$team_id}"]
                ]
            ]
        ];
        
        sendMessage($bot_token, $chat_id, $message, 'HTML', $keyboard);
        echo json_encode(['success' => true, 'message' => 'Notification sent']);
    }
    
    elseif ($action === 'status_update') {
        $status_emoji = [
            'approved' => '✅',
            'rejected' => '❌',
            'pending' => '⏳'
        ];
        
        $status_text = [
            'approved' => 'одобрена',
            'rejected' => 'отклонена',
            'pending' => 'на модерации'
        ];
        
        $emoji = $status_emoji[$new_status] ?? '📊';
        $status = $status_text[$new_status] ?? $new_status;
        
        $message = 
            "{$emoji} <b>Статус вашей команды изменён</b>\n\n" .
            "Команда: <b>{$team['team_name']}</b>\n" .
            "Новый статус: <b>" . ucfirst($status) . "</b>";
        
        if ($comment) {
            $message .= "\n\n💬 <b>Комментарий администратора:</b>\n{$comment}";
        }
        
        sendMessage($bot_token, $chat_id, $message);
        echo json_encode(['success' => true, 'message' => 'Status notification sent']);
    }
    
    elseif ($action === 'admin_comment') {
        $message = 
            "💬 <b>Новый комментарий администратора</b>\n\n" .
            "Команда: <b>{$team['team_name']}</b>\n\n" .
            "<i>{$comment}</i>";
        
        sendMessage($bot_token, $chat_id, $message);
        echo json_encode(['success' => true, 'message' => 'Comment notification sent']);
    }
    
    elseif ($action === 'send_auth_code') {
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
        
        sendMessage($bot_token, $chat_id, $message);
        echo json_encode(['success' => true, 'message' => 'Auth code sent to captain']);
    }
    
    else {
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action']);
    }
}
?>