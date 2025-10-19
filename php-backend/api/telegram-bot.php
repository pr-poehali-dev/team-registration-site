<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../config/telegram.php';

function generateAuthCode() {
    $part1 = strtoupper(substr(md5(rand()), 0, 4));
    $part2 = strtoupper(substr(md5(rand()), 0, 4));
    return "REG-$part1-$part2";
}

function sendMessage($bot_token, $chat_id, $text, $reply_markup = null) {
    $url = "https://api.telegram.org/bot$bot_token/sendMessage";
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => 'HTML'
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = json_encode($reply_markup);
    }
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($data)
        ]
    ];
    
    file_get_contents($url, false, stream_context_create($options));
}

function sendInlineKeyboard($bot_token, $chat_id, $text, $keyboard) {
    sendMessage($bot_token, $chat_id, $text, ['inline_keyboard' => $keyboard]);
}

function answerCallbackQuery($bot_token, $callback_query_id, $text = '') {
    $url = "https://api.telegram.org/bot$bot_token/answerCallbackQuery";
    $data = [
        'callback_query_id' => $callback_query_id,
        'text' => $text
    ];
    
    $options = [
        'http' => [
            'method' => 'POST',
            'header' => 'Content-Type: application/json',
            'content' => json_encode($data)
        ]
    ];
    
    file_get_contents($url, false, stream_context_create($options));
}

try {
    $update = json_decode(file_get_contents('php://input'), true);
    
    // Handle callback queries
    if (isset($update['callback_query'])) {
        $callback = $update['callback_query'];
        $chat_id = $callback['message']['chat']['id'];
        $data = $callback['data'];
        $callback_id = $callback['id'];
        
        if (strpos($data, 'confirm_change_') === 0) {
            // Captain confirms changes
            $pending_id = (int)substr($data, 15);
            
            $stmt = $pdo->prepare("SELECT * FROM pending_team_changes WHERE id = ? AND status = 'pending'");
            $stmt->execute([$pending_id]);
            $pending = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($pending) {
                // Get current team status
                $team_stmt = $pdo->prepare("SELECT status FROM teams WHERE id = ?");
                $team_stmt->execute([$pending['team_id']]);
                $current_status = $team_stmt->fetchColumn();
                
                // Set status to pending only if team was approved before
                $new_status = ($current_status === 'approved') ? 'pending' : $current_status;
                
                // Update team info
                $update_stmt = $pdo->prepare("
                    UPDATE teams 
                    SET team_name = ?, captain_name = ?, captain_telegram = ?, 
                        members_info = ?, status = ?, updated_at = NOW()
                    WHERE id = ?
                ");
                $update_stmt->execute([
                    $pending['team_name'],
                    $pending['captain_name'],
                    $pending['captain_telegram'],
                    $pending['members_info'],
                    $new_status,
                    $pending['team_id']
                ]);
                
                // Mark pending change as confirmed
                $confirm_stmt = $pdo->prepare("UPDATE pending_team_changes SET status = 'confirmed', confirmed_at = NOW() WHERE id = ?");
                $confirm_stmt->execute([$pending_id]);
                
                answerCallbackQuery(TELEGRAM_BOT_TOKEN, $callback_id, 'Изменения подтверждены!');
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id, "✅ Изменения подтверждены и отправлены на модерацию администрации!");
                
                // Notify admins
                $admin_stmt = $pdo->query("SELECT telegram_chat_id FROM admin_users WHERE telegram_chat_id IS NOT NULL");
                $admins = $admin_stmt->fetchAll(PDO::FETCH_COLUMN);
                
                $status_text = ($current_status === 'approved') 
                    ? "✏️ <b>Одобренная команда отредактирована - требуется повторная модерация!</b>" 
                    : "✏️ <b>Команда отредактирована капитаном</b>";
                    
                $admin_message = "$status_text\n\n" .
                              "🏆 Команда: {$pending['team_name']}\n" .
                              "👤 Капитан: {$pending['captain_name']}\n" .
                              "📱 Telegram: {$pending['captain_telegram']}\n" .
                              "🆔 ID команды: {$pending['team_id']}\n" .
                              "📊 Статус: " . ($new_status === 'pending' ? '⏳ На модерации' : '✅ Одобрена') . "\n\n" .
                              "👥 Новый состав:\n" . ($pending['members_info'] ?? 'Не указан');
                
                foreach ($admins as $admin_chat_id) {
                    sendInlineKeyboard(TELEGRAM_BOT_TOKEN, $admin_chat_id, $admin_message, [[
                        ['text' => '✅ Одобрить', 'callback_data' => "approve_{$pending['team_id']}"],
                        ['text' => '❌ Отклонить', 'callback_data' => "reject_{$pending['team_id']}"]
                    ]]);
                }
            }
            
        } elseif (strpos($data, 'cancel_change_') === 0) {
            // Captain cancels changes
            $pending_id = (int)substr($data, 14);
            
            $stmt = $pdo->prepare("UPDATE pending_team_changes SET status = 'rejected' WHERE id = ?");
            $stmt->execute([$pending_id]);
            
            answerCallbackQuery(TELEGRAM_BOT_TOKEN, $callback_id, 'Изменения отменены');
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id, "❌ Изменения отменены");
            
        } elseif (strpos($data, 'approve_') === 0) {
            $team_id = (int)substr($data, 8);
            
            $stmt = $pdo->prepare("UPDATE teams SET status = 'approved', admin_comment = NULL WHERE id = ?");
            $stmt->execute([$team_id]);
            
            answerCallbackQuery(TELEGRAM_BOT_TOKEN, $callback_id, 'Команда одобрена!');
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id, "✅ Команда одобрена!");
            
        } elseif (strpos($data, 'reject_') === 0) {
            $team_id = (int)substr($data, 7);
            
            $stmt = $pdo->prepare("UPDATE teams SET status = 'rejected', admin_comment = 'Отклонено администратором' WHERE id = ?");
            $stmt->execute([$team_id]);
            
            answerCallbackQuery(TELEGRAM_BOT_TOKEN, $callback_id, 'Команда отклонена');
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id, "❌ Команда отклонена");
        }
        
        http_response_code(200);
        echo json_encode(['ok' => true]);
        exit;
    }
    
    if (!isset($update['message'])) {
        http_response_code(200);
        echo json_encode(['ok' => true]);
        exit;
    }
    
    $message = $update['message'];
    $chat_id = $message['chat']['id'];
    $text = $message['text'] ?? '';
    $telegram_username = $message['from']['username'] ?? '';
    $first_name = $message['from']['first_name'] ?? '';
    $last_name = $message['from']['last_name'] ?? '';
    
    // Save/update user
    if ($telegram_username) {
        $stmt = $pdo->prepare("
            INSERT INTO telegram_users (username, chat_id, first_name, last_name, updated_at)
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE
                chat_id = VALUES(chat_id),
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                updated_at = NOW()
        ");
        $stmt->execute([$telegram_username, $chat_id, $first_name, $last_name]);
    }
    
    // Handle commands
    if (strpos($text, '/start') === 0) {
        sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
            "👋 Привет! Я бот для регистрации команд на турнир.\n\n" .
            "Используйте /register чтобы зарегистрировать команду.\n" .
            "Используйте /myteam чтобы посмотреть вашу команду.\n" .
            "Используйте /adminlogin для регистрации администратора.\n" .
            "Используйте /help для помощи."
        );
        
    } elseif (strpos($text, '/help') === 0) {
        sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
            "📋 Доступные команды:\n\n" .
            "/register - Регистрация новой команды\n" .
            "/myteam - Информация о вашей команде\n" .
            "/cancel - Отменить регистрацию команды\n" .
            "/adminlogin - Регистрация администратора\n" .
            "/help - Показать это сообщение"
        );
        
    } elseif (strpos($text, '/adminlogin') === 0) {
        if ($telegram_username !== 'Rywrxuna') {
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                "❌ <b>Доступ запрещён</b>\n\n" .
                "Только суперадминистратор @Rywrxuna может регистрировать новых администраторов.\n\n" .
                "Если вам нужен доступ к админ-панели, обратитесь к @Rywrxuna."
            );
        } else {
            $parts = preg_split('/\s+/', $text, 3);
            if (count($parts) !== 3) {
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "📝 <b>Регистрация администратора</b>\n\n" .
                    "Используйте формат:\n" .
                    "<code>/adminlogin логин пароль</code>\n\n" .
                    "Пример:\n" .
                    "<code>/adminlogin admin mypassword123</code>"
                );
            } else {
                $username = $parts[1];
                $password = $parts[2];
                $password_hash = hash('sha256', $password);
                
                $stmt = $pdo->prepare("
                    INSERT INTO admin_users (username, password_hash, telegram_chat_id, telegram_username)
                    VALUES (?, ?, ?, ?)
                    ON DUPLICATE KEY UPDATE
                        password_hash = VALUES(password_hash),
                        telegram_chat_id = VALUES(telegram_chat_id),
                        telegram_username = VALUES(telegram_username),
                        last_login = NOW()
                ");
                $stmt->execute([$username, $password_hash, $chat_id, $telegram_username]);
                
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "✅ <b>Администратор зарегистрирован!</b>\n\n" .
                    "Логин: <code>$username</code>\n" .
                    "Telegram: @$telegram_username\n\n" .
                    "Теперь можно входить в админ-панель на сайте."
                );
            }
        }
        
    } elseif (strpos($text, '/myteam') === 0) {
        if (!$telegram_username) {
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                "❌ У вас не установлен username в Telegram. " .
                "Пожалуйста, установите username в настройках Telegram."
            );
        } else {
            $stmt = $pdo->prepare("
                SELECT team_name, captain_name, members_info, status, admin_comment, auth_code
                FROM teams 
                WHERE captain_telegram = ?
            ");
            $stmt->execute(['@' . $telegram_username]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($team) {
                $status_map = [
                    'pending' => '⏳ На модерации',
                    'approved' => '✅ Одобрена',
                    'rejected' => '❌ Отклонена'
                ];
                $status_text = $status_map[$team['status']] ?? $team['status'];
                
                $response = "🏆 Ваша команда: {$team['team_name']}\n" .
                           "👤 Капитан: {$team['captain_name']}\n" .
                           "📊 Статус: $status_text\n" .
                           "🔑 Код регистрации: <code>{$team['auth_code']}</code>\n\n" .
                           "👥 Состав:\n{$team['members_info']}";
                
                if ($team['admin_comment']) {
                    $response .= "\n\n💬 Комментарий: {$team['admin_comment']}";
                }
                
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id, $response);
            } else {
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "❌ У вас нет зарегистрированной команды.\n\n" .
                    "Используйте /register для регистрации команды."
                );
            }
        }
        
    } elseif (strpos($text, '/register') === 0) {
        if (!$telegram_username) {
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                "❌ У вас не установлен username в Telegram. " .
                "Пожалуйста, установите username в настройках Telegram."
            );
        } else {
            // Check registration status
            $stmt = $pdo->query("SELECT is_open FROM registration_settings ORDER BY id DESC LIMIT 1");
            $settings = $stmt->fetch(PDO::FETCH_ASSOC);
            
            if ($settings && !$settings['is_open']) {
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "❌ <b>Регистрация закрыта</b>\n\n" .
                    "В данный момент регистрация команд недоступна."
                );
            } else {
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "📝 <b>Регистрация команды</b>\n\n" .
                    "Для регистрации команды используйте веб-форму на сайте турнира.\n\n" .
                    "После регистрации вы получите код, по которому сможете отслеживать статус команды через команду /myteam"
                );
            }
        }
        
    } elseif (strpos($text, '/cancel') === 0) {
        if (!$telegram_username) {
            sendMessage(TELEGRAM_BOT_TOKEN, $chat_id, "❌ Username не найден");
        } else {
            $stmt = $pdo->prepare("DELETE FROM teams WHERE captain_telegram = ?");
            $stmt->execute(['@' . $telegram_username]);
            
            if ($stmt->rowCount() > 0) {
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "✅ Регистрация вашей команды отменена."
                );
            } else {
                sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
                    "❌ У вас нет зарегистрированной команды."
                );
            }
        }
        
    } else {
        sendMessage(TELEGRAM_BOT_TOKEN, $chat_id,
            "❓ Неизвестная команда. Используйте /help для списка доступных команд."
        );
    }
    
    http_response_code(200);
    echo json_encode(['ok' => true]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}