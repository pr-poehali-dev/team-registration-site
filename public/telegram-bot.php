<?php
header('Content-Type: application/json');

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

// Функция для ответа на callback запрос
function answerCallbackQuery($bot_token, $callback_query_id, $text = null) {
    $url = "https://api.telegram.org/bot{$bot_token}/answerCallbackQuery";
    
    $data = ['callback_query_id' => $callback_query_id];
    if ($text) {
        $data['text'] = $text;
    }
    
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data)
        ]
    ];
    
    $context = stream_context_create($options);
    file_get_contents($url, false, $context);
}

// Функция для редактирования сообщения
function editMessage($bot_token, $chat_id, $message_id, $text, $parse_mode = 'HTML') {
    $url = "https://api.telegram.org/bot{$bot_token}/editMessageText";
    
    $data = [
        'chat_id' => $chat_id,
        'message_id' => $message_id,
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
    file_get_contents($url, false, $context);
}

// Генерация кода регистрации
function generateAuthCode() {
    $chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    $part1 = substr(str_shuffle($chars), 0, 4);
    $part2 = substr(str_shuffle($chars), 0, 4);
    return "REG-{$part1}-{$part2}";
}

// Получить chat_id капитана по telegram username
function getCaptainChatId($pdo, $captain_telegram) {
    $stmt = $pdo->prepare("SELECT chat_id FROM telegram_users WHERE username = ?");
    $username_clean = str_replace('@', '', $captain_telegram);
    $stmt->execute([$username_clean]);
    $result = $stmt->fetch(PDO::FETCH_ASSOC);
    return $result ? $result['chat_id'] : null;
}

// Получение входящего обновления от Telegram
$content = file_get_contents('php://input');
$update = json_decode($content, true);

// Обработка callback кнопок
if (isset($update['callback_query'])) {
    $callback = $update['callback_query'];
    $callback_data = $callback['data'];
    $chat_id = $callback['message']['chat']['id'];
    $message_id = $callback['message']['message_id'];
    $telegram_username = $callback['from']['username'] ?? '';
    
    // Формат: approve_change_TEAMID или reject_change_TEAMID
    if (strpos($callback_data, 'approve_change_') === 0) {
        $team_id = str_replace('approve_change_', '', $callback_data);
        
        // Проверить что это капитан команды
        $stmt = $pdo->prepare("SELECT * FROM teams WHERE id = ? AND captain_telegram = ?");
        $stmt->execute([$team_id, "@{$telegram_username}"]);
        $team = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($team) {
            // Применить изменения из pending_changes
            $stmt = $pdo->prepare("SELECT * FROM pending_changes WHERE team_id = ? ORDER BY created_at DESC LIMIT 1");
            $stmt->execute([$team_id]);
            $pending = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($pending) {
                $changes = json_decode($pending['changes'], true);
                
                // Обновить команду
                $update_fields = [];
                $update_values = [];
                foreach ($changes as $field => $value) {
                    $update_fields[] = "$field = ?";
                    $update_values[] = $value;
                }
                $update_values[] = $team_id;
                
                $sql = "UPDATE teams SET " . implode(', ', $update_fields) . " WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute($update_values);
                
                // Удалить pending change
                $stmt = $pdo->prepare("DELETE FROM pending_changes WHERE id = ?");
                $stmt->execute([$pending['id']]);
                
                answerCallbackQuery($bot_token, $callback['id'], "✅ Изменения применены!");
                editMessage($bot_token, $chat_id, $message_id,
                    "✅ <b>Изменения подтверждены и применены!</b>\n\n" .
                    "Используйте /myteam чтобы посмотреть обновлённую информацию."
                );
            }
        } else {
            answerCallbackQuery($bot_token, $callback['id'], "❌ Вы не капитан этой команды");
        }
    }
    
    elseif (strpos($callback_data, 'reject_change_') === 0) {
        $team_id = str_replace('reject_change_', '', $callback_data);
        
        // Проверить что это капитан команды
        $stmt = $pdo->prepare("SELECT * FROM teams WHERE id = ? AND captain_telegram = ?");
        $stmt->execute([$team_id, "@{$telegram_username}"]);
        $team = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($team) {
            // Удалить pending change
            $stmt = $pdo->prepare("DELETE FROM pending_changes WHERE team_id = ?");
            $stmt->execute([$team_id]);
            
            answerCallbackQuery($bot_token, $callback['id'], "❌ Изменения отклонены");
            editMessage($bot_token, $chat_id, $message_id,
                "❌ <b>Изменения отклонены</b>\n\n" .
                "Данные команды остались без изменений."
            );
        } else {
            answerCallbackQuery($bot_token, $callback['id'], "❌ Вы не капитан этой команды");
        }
    }
    
    echo json_encode(['ok' => true]);
    exit;
}

if (!$update || !isset($update['message'])) {
    echo json_encode(['ok' => true]);
    exit;
}

$message = $update['message'];
$chat_id = $message['chat']['id'];
$text = $message['text'] ?? '';
$telegram_username = $message['from']['username'] ?? '';
$first_name = $message['from']['first_name'] ?? '';

// Сохранить chat_id пользователя
if ($telegram_username) {
    $stmt = $pdo->prepare(
        "INSERT INTO telegram_users (username, chat_id, first_name, updated_at) 
         VALUES (?, ?, ?, NOW()) 
         ON DUPLICATE KEY UPDATE chat_id = ?, first_name = ?, updated_at = NOW()"
    );
    $stmt->execute([$telegram_username, $chat_id, $first_name, $chat_id, $first_name]);
}

// Обработка команд
if (strpos($text, '/start') === 0) {
    sendMessage($bot_token, $chat_id,
        "👋 Привет! Я бот для регистрации команд на турнир.\n\n" .
        "📋 <b>Доступные команды:</b>\n\n" .
        "/register - Регистрация команды\n" .
        "/myteam - Информация о вашей команде\n" .
        "/cancel - Отменить регистрацию\n" .
        "/help - Показать все команды"
    );
}

elseif (strpos($text, '/help') === 0) {
    sendMessage($bot_token, $chat_id,
        "📋 <b>Доступные команды:</b>\n\n" .
        "/register - Регистрация новой команды\n" .
        "/myteam - Информация о вашей команде\n" .
        "/cancel - Отменить регистрацию\n" .
        "/help - Показать это сообщение\n\n" .
        "ℹ️ Вам будут приходить уведомления о:\n" .
        "• Изменении статуса заявки\n" .
        "• Запросах на изменение данных команды\n" .
        "• Комментариях администратора"
    );
}

elseif (strpos($text, '/myteam') === 0) {
    if (!$telegram_username) {
        sendMessage($bot_token, $chat_id,
            "❌ У вас не установлен username в Telegram.\n" .
            "Пожалуйста, установите username в настройках Telegram."
        );
    } else {
        $stmt = $pdo->prepare("SELECT * FROM teams WHERE captain_telegram = ?");
        $stmt->execute(["@{$telegram_username}"]);
        $team = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($team) {
            $status_text = [
                'pending' => '⏳ На модерации',
                'approved' => '✅ Одобрена',
                'rejected' => '❌ Отклонена'
            ][$team['status']] ?? $team['status'];
            
            $response = 
                "🏆 <b>Ваша команда:</b> {$team['team_name']}\n" .
                "👤 <b>Капитан:</b> {$team['captain_name']}\n" .
                "📊 <b>Статус:</b> {$status_text}\n" .
                "🔑 <b>Код регистрации:</b> <code>{$team['auth_code']}</code>\n\n" .
                "👥 <b>Состав:</b>\n{$team['members_info']}";
            
            if ($team['admin_comment']) {
                $response .= "\n\n💬 <b>Комментарий администратора:</b>\n{$team['admin_comment']}";
            }
            
            sendMessage($bot_token, $chat_id, $response);
        } else {
            sendMessage($bot_token, $chat_id,
                "❌ У вас нет зарегистрированной команды.\n\n" .
                "Используйте /register для регистрации."
            );
        }
    }
}

elseif (strpos($text, '/register') === 0) {
    if (!$telegram_username) {
        sendMessage($bot_token, $chat_id,
            "❌ У вас не установлен username в Telegram.\n" .
            "Пожалуйста, установите username в настройках Telegram."
        );
    } else {
        // Проверка существующей команды
        $stmt = $pdo->prepare("SELECT id FROM teams WHERE captain_telegram = ?");
        $stmt->execute(["@{$telegram_username}"]);
        $existing = $stmt->fetch();
        
        if ($existing) {
            sendMessage($bot_token, $chat_id,
                "⚠️ У вас уже есть зарегистрированная команда!\n\n" .
                "Используйте /myteam чтобы посмотреть информацию о команде."
            );
        } else {
            sendMessage($bot_token, $chat_id,
                "📝 <b>Регистрация команды</b>\n\n" .
                "Для удобства регистрации, пожалуйста, перейдите на сайт:\n" .
                "https://ce876244.tw1.ru/\n\n" .
                "Там вы сможете заполнить форму регистрации с полным составом команды.\n\n" .
                "После регистрации используйте /myteam чтобы посмотреть статус заявки."
            );
        }
    }
}

elseif (strpos($text, '/cancel') === 0) {
    if (!$telegram_username) {
        sendMessage($bot_token, $chat_id,
            "❌ У вас не установлен username в Telegram."
        );
    } else {
        $stmt = $pdo->prepare("SELECT * FROM teams WHERE captain_telegram = ? AND status = 'pending'");
        $stmt->execute(["@{$telegram_username}"]);
        $team = $stmt->fetch();
        
        if ($team) {
            $stmt = $pdo->prepare("DELETE FROM teams WHERE id = ? AND status = 'pending'");
            $stmt->execute([$team['id']]);
            
            sendMessage($bot_token, $chat_id,
                "✅ Ваша заявка на регистрацию команды отменена.\n\n" .
                "Вы можете зарегистрировать новую команду используя /register"
            );
        } else {
            sendMessage($bot_token, $chat_id,
                "❌ У вас нет заявок на регистрацию, которые можно отменить."
            );
        }
    }
}

else {
    sendMessage($bot_token, $chat_id,
        "❓ Неизвестная команда.\n\n" .
        "Используйте /help чтобы посмотреть список доступных команд."
    );
}

echo json_encode(['ok' => true]);
?>
