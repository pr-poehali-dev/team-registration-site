<?php
/**
 * API для отправки уведомлений капитанам команд
 * Вызывается из админ-панели или автоматически при изменениях
 */

header('Content-Type: application/json');
require_once __DIR__ . '/../php-backend/config.php';

$BOT_TOKEN = getenv('TELEGRAM_BOT_TOKEN') ?: '';

if (empty($BOT_TOKEN)) {
    http_response_code(500);
    echo json_encode(['error' => 'TELEGRAM_BOT_TOKEN не установлен']);
    exit;
}

$TELEGRAM_API = "https://api.telegram.org/bot{$BOT_TOKEN}";

/**
 * Отправка сообщения в Telegram
 */
function sendTelegramMessage($chat_id, $text, $parse_mode = 'HTML') {
    global $TELEGRAM_API;
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => $parse_mode
    ];
    
    $ch = curl_init($TELEGRAM_API . '/sendMessage');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $result = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return [
        'success' => $httpCode === 200,
        'response' => json_decode($result, true)
    ];
}

/**
 * Получить Telegram ID капитана команды
 */
function getCaptainTelegramId($team_id) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT captain_telegram_id FROM teams WHERE id = ?");
    $stmt->bind_param("i", $team_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $team = $result->fetch_assoc();
    
    return $team['captain_telegram_id'] ?? null;
}

// Получаем данные запроса
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    
    $notification_type = $input['type'] ?? '';
    $team_id = $input['team_id'] ?? null;
    $message = $input['message'] ?? '';
    $data = $input['data'] ?? [];
    
    if (empty($notification_type)) {
        http_response_code(400);
        echo json_encode(['error' => 'Тип уведомления не указан']);
        exit;
    }
    
    // Получаем Telegram ID капитана
    $telegram_id = getCaptainTelegramId($team_id);
    
    if (!$telegram_id) {
        http_response_code(404);
        echo json_encode(['error' => 'Telegram ID не найден или не привязан']);
        exit;
    }
    
    // Формируем сообщение в зависимости от типа
    $notification_text = '';
    
    switch ($notification_type) {
        case 'team_approved':
            $notification_text = "✅ <b>Команда одобрена!</b>\n\n";
            $notification_text .= "Поздравляем! Ваша команда <b>{$data['team_name']}</b> допущена к участию в турнире.\n\n";
            $notification_text .= "Следите за расписанием матчей в боте.\n";
            $notification_text .= "Удачи в турнире! 🏆";
            break;
            
        case 'team_rejected':
            $notification_text = "❌ <b>Заявка отклонена</b>\n\n";
            $notification_text .= "К сожалению, заявка команды <b>{$data['team_name']}</b> была отклонена.\n\n";
            if (!empty($data['reason'])) {
                $notification_text .= "Причина: {$data['reason']}\n\n";
            }
            $notification_text .= "Вы можете подать новую заявку с исправлениями.";
            break;
            
        case 'match_created':
            $notification_text = "🎯 <b>Новый матч!</b>\n\n";
            $notification_text .= "Ваша команда <b>{$data['team_name']}</b> играет:\n\n";
            $notification_text .= "⚔️ {$data['team1']} vs {$data['team2']}\n";
            $notification_text .= "🏅 Раунд: {$data['round']}\n";
            if (!empty($data['date'])) {
                $notification_text .= "📅 Дата: {$data['date']}\n";
            }
            $notification_text .= "\nУдачи в матче!";
            break;
            
        case 'match_updated':
            $notification_text = "📊 <b>Результат матча</b>\n\n";
            $notification_text .= "⚔️ {$data['team1']} vs {$data['team2']}\n";
            $notification_text .= "Счёт: {$data['score1']} - {$data['score2']}\n\n";
            if ($data['is_winner']) {
                $notification_text .= "🏆 <b>Победа!</b> Поздравляем!\n";
                $notification_text .= "Вы проходите в следующий раунд.";
            } else {
                $notification_text .= "💔 К сожалению, поражение.\n";
                $notification_text .= "Спасибо за участие в турнире!";
            }
            break;
            
        case 'custom':
            $notification_text = $message;
            break;
            
        default:
            http_response_code(400);
            echo json_encode(['error' => 'Неизвестный тип уведомления']);
            exit;
    }
    
    // Отправляем уведомление
    $result = sendTelegramMessage($telegram_id, $notification_text);
    
    if ($result['success']) {
        echo json_encode([
            'success' => true,
            'message' => 'Уведомление отправлено',
            'telegram_id' => $telegram_id
        ]);
    } else {
        http_response_code(500);
        echo json_encode([
            'error' => 'Ошибка отправки уведомления',
            'details' => $result['response']
        ]);
    }
    
} elseif ($method === 'GET') {
    // Проверка работы API
    echo json_encode([
        'status' => 'ok',
        'message' => 'Notification API работает',
        'bot_configured' => !empty($BOT_TOKEN)
    ]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Метод не поддерживается']);
}
