<?php
/**
 * Telegram Bot Webhook Handler
 * 
 * PHP версия бота для работы на обычном хостинге Timeweb (без VPS)
 * Использует webhook вместо long polling
 * 
 * Возможности:
 * - Регистрация команд через бота
 * - Получение кода регистрации
 * - Подтверждение изменений команды
 * - Подтверждение удаления команды
 * - Уведомления капитанам
 */

header('Content-Type: application/json; charset=utf-8');

// Подключение к БД
require_once __DIR__ . '/../config.php';

// Настройки бота
define('BOT_TOKEN', '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds');
define('API_URL', 'https://api.telegram.org/bot' . BOT_TOKEN . '/');

// Получаем обновление от Telegram
$content = file_get_contents('php://input');
$update = json_decode($content, true);

// Логирование для отладки
error_log("Telegram Update: " . $content);

if (!$update) {
    exit('No update');
}

// Обработка callback запросов (кнопки)
if (isset($update['callback_query'])) {
    handleCallbackQuery($update['callback_query']);
    exit;
}

// Обработка текстовых сообщений
if (isset($update['message'])) {
    $message = $update['message'];
    $chat_id = $message['chat']['id'];
    $text = $message['text'] ?? '';
    $username = $message['from']['username'] ?? '';
    
    // Команда /start
    if ($text === '/start') {
        // Сохранить chat_id пользователя в БД
        $stmt = $pdo->prepare("
            INSERT INTO telegram_users (chat_id, username, first_name, last_name, updated_at) 
            VALUES (?, ?, ?, ?, NOW())
            ON DUPLICATE KEY UPDATE 
                chat_id = VALUES(chat_id),
                first_name = VALUES(first_name),
                last_name = VALUES(last_name),
                updated_at = NOW()
        ");
        
        $stmt->execute([
            $chat_id,
            $username,
            $message['from']['first_name'] ?? '',
            $message['from']['last_name'] ?? ''
        ]);
        
        sendMessage($chat_id, 
            "🏆 *Добро пожаловать в турнирного бота League of Legends!*\n\n" .
            "Доступные команды:\n" .
            "/register - Зарегистрировать команду\n" .
            "/myteam - Посмотреть свою команду\n" .
            "/help - Помощь\n\n" .
            "Для регистрации команды используйте кнопку ниже ⬇️",
            [
                'inline_keyboard' => [[
                    ['text' => '📝 Зарегистрировать команду', 'callback_data' => 'register_start']
                ]]
            ]
        );
    }
    // Команда /register
    elseif ($text === '/register') {
        sendMessage($chat_id,
            "📝 *Регистрация команды*\n\n" .
            "Для регистрации команды перейдите на сайт:\n" .
            "👉 https://ce876244.tw1.ru/\n\n" .
            "После регистрации вы получите код для управления командой."
        );
    }
    // Команда /myteam
    elseif ($text === '/myteam') {
        showMyTeam($chat_id, $username);
    }
    // Команда /help
    elseif ($text === '/help') {
        sendMessage($chat_id,
            "ℹ️ *Помощь по боту*\n\n" .
            "*Регистрация:*\n" .
            "1. Перейдите на сайт турнира\n" .
            "2. Заполните форму регистрации\n" .
            "3. Вы получите код регистрации в этот чат\n\n" .
            "*Управление командой:*\n" .
            "- Редактируйте команду на сайте\n" .
            "- Подтверждайте изменения через бота\n\n" .
            "*Полезные ссылки:*\n" .
            "🌐 Сайт: https://ce876244.tw1.ru/\n" .
            "💬 Сообщество: https://t.me/+QgiLIa1gFRY4Y2Iy"
        );
    }
    // Проверка кода регистрации (формат REG-XXXX-XXXX)
    elseif (preg_match('/^REG-[A-Z0-9]{4}-[A-Z0-9]{4}$/i', $text)) {
        verifyAuthCode($chat_id, strtoupper($text));
    }
    else {
        sendMessage($chat_id,
            "❓ Неизвестная команда.\n\n" .
            "Доступные команды:\n" .
            "/start - Начать работу\n" .
            "/register - Регистрация команды\n" .
            "/myteam - Моя команда\n" .
            "/help - Помощь"
        );
    }
}

/**
 * Обработка нажатий на кнопки
 */
function handleCallbackQuery($callback) {
    global $pdo;
    
    $chat_id = $callback['message']['chat']['id'];
    $message_id = $callback['message']['message_id'];
    $data = $callback['data'];
    $callback_id = $callback['id'];
    
    // Подтверждение изменения команды
    if (strpos($data, 'confirm_edit_') === 0) {
        $team_id = (int)str_replace('confirm_edit_', '', $data);
        confirmTeamEdit($chat_id, $message_id, $team_id, $callback_id);
    }
    // Отмена изменения команды
    elseif (strpos($data, 'cancel_edit_') === 0) {
        $team_id = (int)str_replace('cancel_edit_', '', $data);
        cancelTeamEdit($chat_id, $message_id, $team_id, $callback_id);
    }
    // Подтверждение удаления команды
    elseif (strpos($data, 'confirm_delete_') === 0) {
        $team_id = (int)str_replace('confirm_delete_', '', $data);
        confirmTeamDelete($chat_id, $message_id, $team_id, $callback_id);
    }
    // Отмена удаления команды
    elseif (strpos($data, 'cancel_delete_') === 0) {
        $team_id = (int)str_replace('cancel_delete_', '', $data);
        cancelTeamDelete($chat_id, $message_id, $team_id, $callback_id);
    }
    // Регистрация через бота
    elseif ($data === 'register_start') {
        answerCallback($callback_id, "Перейдите на сайт для регистрации");
        sendMessage($chat_id,
            "📝 *Регистрация команды*\n\n" .
            "Перейдите на сайт и заполните форму:\n" .
            "👉 https://ce876244.tw1.ru/\n\n" .
            "После регистрации вы получите код в этот чат."
        );
    }
}

/**
 * Показать мою команду
 */
function showMyTeam($chat_id, $username) {
    global $pdo;
    
    if (!$username) {
        sendMessage($chat_id, "❌ У вас не установлен username в Telegram. Установите его в настройках профиля.");
        return;
    }
    
    // Найти команду по telegram капитана
    $stmt = $pdo->prepare("SELECT * FROM teams WHERE captain_telegram LIKE ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute(['%' . $username . '%']);
    $team = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$team) {
        sendMessage($chat_id,
            "❌ Команда не найдена.\n\n" .
            "Зарегистрируйте команду на сайте:\n" .
            "👉 https://ce876244.tw1.ru/"
        );
        return;
    }
    
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
    
    $message = "🏆 *" . htmlspecialchars($team['team_name']) . "*\n\n";
    $message .= "👤 *Капитан:* " . htmlspecialchars($team['captain_name']) . "\n";
    $message .= "📱 *Telegram:* @" . htmlspecialchars($team['captain_telegram']) . "\n\n";
    $message .= "👥 *Состав команды:*\n";
    $message .= htmlspecialchars($team['members_info']) . "\n\n";
    $message .= $status_emoji[$team['status']] . " *Статус:* " . $status_text[$team['status']] . "\n";
    $message .= "🔑 *Код регистрации:* `" . $team['auth_code'] . "`\n\n";
    
    if ($team['admin_comment']) {
        $message .= "💬 *Комментарий админа:*\n" . htmlspecialchars($team['admin_comment']) . "\n\n";
    }
    
    $message .= "Управляйте командой на сайте:\n";
    $message .= "👉 https://ce876244.tw1.ru/";
    
    sendMessage($chat_id, $message);
}

/**
 * Проверить код регистрации
 */
function verifyAuthCode($chat_id, $auth_code) {
    global $pdo;
    
    $stmt = $pdo->prepare("SELECT * FROM teams WHERE auth_code = ?");
    $stmt->execute([$auth_code]);
    $team = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$team) {
        sendMessage($chat_id, "❌ Код регистрации не найден. Проверьте правильность кода.");
        return;
    }
    
    sendMessage($chat_id, 
        "✅ *Код подтверждён!*\n\n" .
        "Команда: *" . htmlspecialchars($team['team_name']) . "*\n" .
        "Капитан: " . htmlspecialchars($team['captain_name']) . "\n\n" .
        "Используйте /myteam для просмотра информации о команде."
    );
}

/**
 * Подтвердить изменение команды
 */
function confirmTeamEdit($chat_id, $message_id, $team_id, $callback_id) {
    global $pdo;
    
    // Получить изменения из pending_changes
    $stmt = $pdo->prepare("SELECT * FROM pending_changes WHERE team_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$team_id]);
    $pending = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$pending) {
        answerCallback($callback_id, "Изменения не найдены");
        return;
    }
    
    $changes = json_decode($pending['changes'], true);
    
    // Применить изменения к команде
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
    
    // Удалить из pending_changes
    $stmt = $pdo->prepare("DELETE FROM pending_changes WHERE id = ?");
    $stmt->execute([$pending['id']]);
    
    // Обновить сообщение
    editMessage($chat_id, $message_id,
        "✅ *Изменения применены!*\n\n" .
        "Ваша команда успешно обновлена."
    );
    
    answerCallback($callback_id, "✅ Изменения применены");
}

/**
 * Отменить изменение команды
 */
function cancelTeamEdit($chat_id, $message_id, $team_id, $callback_id) {
    global $pdo;
    
    // Удалить из pending_changes
    $stmt = $pdo->prepare("DELETE FROM pending_changes WHERE team_id = ? ORDER BY created_at DESC LIMIT 1");
    $stmt->execute([$team_id]);
    
    // Обновить сообщение
    editMessage($chat_id, $message_id,
        "❌ *Изменения отменены*\n\n" .
        "Ваша команда осталась без изменений."
    );
    
    answerCallback($callback_id, "❌ Изменения отменены");
}

/**
 * Подтвердить удаление команды
 */
function confirmTeamDelete($chat_id, $message_id, $team_id, $callback_id) {
    global $pdo;
    
    // Удалить команду
    $stmt = $pdo->prepare("DELETE FROM teams WHERE id = ?");
    $stmt->execute([$team_id]);
    
    // Обновить сообщение
    editMessage($chat_id, $message_id,
        "✅ *Команда удалена*\n\n" .
        "Ваша регистрация отменена."
    );
    
    answerCallback($callback_id, "✅ Команда удалена");
}

/**
 * Отменить удаление команды
 */
function cancelTeamDelete($chat_id, $message_id, $team_id, $callback_id) {
    editMessage($chat_id, $message_id,
        "❌ *Удаление отменено*\n\n" .
        "Ваша команда сохранена."
    );
    
    answerCallback($callback_id, "❌ Удаление отменено");
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
    
    return callAPI('sendMessage', $data);
}

/**
 * Редактировать сообщение
 */
function editMessage($chat_id, $message_id, $text, $reply_markup = null) {
    $data = [
        'chat_id' => $chat_id,
        'message_id' => $message_id,
        'text' => $text,
        'parse_mode' => 'Markdown'
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = json_encode($reply_markup);
    }
    
    return callAPI('editMessageText', $data);
}

/**
 * Ответить на callback
 */
function answerCallback($callback_id, $text) {
    return callAPI('answerCallbackQuery', [
        'callback_query_id' => $callback_id,
        'text' => $text
    ]);
}

/**
 * Вызов API Telegram
 */
function callAPI($method, $data) {
    $url = API_URL . $method;
    
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

// Ответить Telegram что всё ОК
http_response_code(200);
echo json_encode(['ok' => true]);