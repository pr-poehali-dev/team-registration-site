<?php
/**
 * API для отправки уведомлений капитанам команд
 * 
 * Вызывается из основного API когда нужно отправить:
 * - Код регистрации
 * - Запрос на подтверждение изменений
 * - Запрос на подтверждение удаления
 * - Уведомления от админа
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

define('BOT_TOKEN', '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds');
define('API_URL', 'https://api.telegram.org/bot' . BOT_TOKEN . '/');

// Только POST метод
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? null;
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

// Найти Telegram chat_id капитана
$captain_telegram = $team['captain_telegram'];
$chat_id = findChatId($captain_telegram);

if (!$chat_id) {
    // Не можем найти chat_id - отправляем через username
    $chat_id = '@' . str_replace('@', '', $captain_telegram);
}

switch ($action) {
    case 'send_auth_code':
        sendAuthCode($chat_id, $team);
        break;
        
    case 'confirm_edit':
        confirmEdit($chat_id, $team);
        break;
        
    case 'confirm_delete':
        confirmDelete($chat_id, $team);
        break;
        
    case 'notify_status':
        notifyStatus($chat_id, $team);
        break;
        
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Unknown action']);
        exit;
}

echo json_encode(['success' => true]);

/**
 * Найти chat_id по username
 */
function findChatId($username) {
    global $pdo;
    
    $username = str_replace('@', '', $username);
    
    $stmt = $pdo->prepare("SELECT chat_id FROM telegram_users WHERE username = ?");
    $stmt->execute([$username]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    
    return $result ? $result['chat_id'] : null;
}

/**
 * Отправить код регистрации
 */
function sendAuthCode($chat_id, $team) {
    $message = "✅ *Команда зарегистрирована!*\n\n";
    $message .= "🏆 *Название:* " . htmlspecialchars($team['team_name']) . "\n";
    $message .= "👤 *Капитан:* " . htmlspecialchars($team['captain_name']) . "\n\n";
    $message .= "🔑 *Ваш код регистрации:*\n";
    $message .= "`" . $team['auth_code'] . "`\n\n";
    $message .= "⚠️ *Сохраните этот код!*\n";
    $message .= "Он нужен для управления командой на сайте.\n\n";
    $message .= "📝 Управляйте командой:\n";
    $message .= "👉 https://ce876244.tw1.ru/\n\n";
    $message .= "Используйте /myteam для просмотра команды.";
    
    sendMessage($chat_id, $message);
}

/**
 * Запрос на подтверждение изменений
 */
function confirmEdit($chat_id, $team) {
    global $pdo;
    
    // Получить pending изменения
    $stmt = $pdo->prepare("SELECT * FROM pending_changes WHERE team_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$team['id']]);
    $pending = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$pending) {
        return;
    }
    
    $changes = json_decode($pending['changes'], true);
    $old_values = json_decode($pending['old_values'], true);
    
    $message = "⚠️ *Запрос на изменение команды*\n\n";
    $message .= "🏆 Команда: *" . htmlspecialchars($team['team_name']) . "*\n\n";
    $message .= "📝 *Изменения:*\n";
    
    foreach ($changes as $field => $new_value) {
        $old_value = $old_values[$field] ?? '';
        $field_name = translateField($field);
        
        $message .= "\n*$field_name:*\n";
        $message .= "Было: " . htmlspecialchars($old_value) . "\n";
        $message .= "Стало: " . htmlspecialchars($new_value) . "\n";
    }
    
    $message .= "\n⏰ Подтвердите изменения в течение 24 часов.";
    
    $keyboard = [
        'inline_keyboard' => [[
            ['text' => '✅ Подтвердить', 'callback_data' => 'confirm_edit_' . $team['id']],
            ['text' => '❌ Отменить', 'callback_data' => 'cancel_edit_' . $team['id']]
        ]]
    ];
    
    sendMessage($chat_id, $message, $keyboard);
}

/**
 * Запрос на подтверждение удаления
 */
function confirmDelete($chat_id, $team) {
    $message = "⚠️ *Запрос на удаление команды*\n\n";
    $message .= "🏆 Команда: *" . htmlspecialchars($team['team_name']) . "*\n";
    $message .= "👤 Капитан: " . htmlspecialchars($team['captain_name']) . "\n\n";
    $message .= "❗️ Это действие нельзя отменить!\n";
    $message .= "Команда будет полностью удалена из турнира.\n\n";
    $message .= "⏰ Подтвердите удаление в течение 24 часов.";
    
    $keyboard = [
        'inline_keyboard' => [[
            ['text' => '✅ Да, удалить', 'callback_data' => 'confirm_delete_' . $team['id']],
            ['text' => '❌ Отменить', 'callback_data' => 'cancel_delete_' . $team['id']]
        ]]
    ];
    
    sendMessage($chat_id, $message, $keyboard);
}

/**
 * Уведомление об изменении статуса
 */
function notifyStatus($chat_id, $team) {
    $status_emoji = [
        'pending' => '⏳',
        'approved' => '✅',
        'rejected' => '❌'
    ];
    
    $status_text = [
        'pending' => 'На модерации',
        'approved' => 'Одобрена',
        'rejected' => 'Отклонена'
    ];
    
    $emoji = $status_emoji[$team['status']] ?? '📋';
    $text = $status_text[$team['status']] ?? 'Неизвестно';
    
    $message = "$emoji *Статус команды изменён*\n\n";
    $message .= "🏆 Команда: *" . htmlspecialchars($team['team_name']) . "*\n";
    $message .= "📊 Новый статус: *$text*\n\n";
    
    if ($team['admin_comment']) {
        $message .= "💬 *Комментарий админа:*\n";
        $message .= htmlspecialchars($team['admin_comment']) . "\n\n";
    }
    
    if ($team['status'] === 'approved') {
        $message .= "🎉 Поздравляем! Ваша команда допущена к турниру.\n";
        $message .= "Следите за расписанием матчей на сайте.";
    } elseif ($team['status'] === 'rejected') {
        $message .= "😔 К сожалению, ваша заявка отклонена.\n";
        $message .= "Вы можете зарегистрировать команду заново.";
    }
    
    sendMessage($chat_id, $message);
}

/**
 * Перевод названий полей
 */
function translateField($field) {
    $translations = [
        'team_name' => 'Название команды',
        'captain_name' => 'Имя капитана',
        'captain_telegram' => 'Telegram капитана',
        'members_info' => 'Состав команды'
    ];
    
    return $translations[$field] ?? $field;
}

/**
 * Отправить сообщение
 */
function sendMessage($chat_id, $text, $reply_markup = null) {
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => 'Markdown'
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = json_encode($reply_markup);
    }
    
    $url = API_URL . 'sendMessage';
    
    $options = [
        'http' => [
            'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
            'method'  => 'POST',
            'content' => http_build_query($data),
            'timeout' => 10
        ]
    ];
    
    $context = stream_context_create($options);
    $result = @file_get_contents($url, false, $context);
    
    return json_decode($result, true);
}
