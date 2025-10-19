<?php
/**
 * Telegram Bot для турнирной системы (PHP версия для обычного хостинга)
 * Работает через webhook - Telegram отправляет запросы напрямую на этот файл
 */

// Подключаем конфигурацию БД
require_once __DIR__ . '/../php-backend/config.php';

// Получаем настройки из переменных окружения или используем значения по умолчанию
$BOT_TOKEN = getenv('TELEGRAM_BOT_TOKEN') ?: '';
$WEBHOOK_URL = getenv('TELEGRAM_WEBHOOK_URL') ?: '';

// Если токен не установлен, показываем инструкцию
if (empty($BOT_TOKEN)) {
    http_response_code(500);
    echo json_encode([
        'error' => 'TELEGRAM_BOT_TOKEN не установлен',
        'instruction' => 'Создайте файл .env или установите переменную окружения'
    ]);
    exit;
}

// API endpoints
$TELEGRAM_API = "https://api.telegram.org/bot{$BOT_TOKEN}";

/**
 * Отправка сообщения в Telegram
 */
function sendMessage($chat_id, $text, $parse_mode = 'HTML', $reply_markup = null) {
    global $TELEGRAM_API;
    
    $data = [
        'chat_id' => $chat_id,
        'text' => $text,
        'parse_mode' => $parse_mode
    ];
    
    if ($reply_markup) {
        $data['reply_markup'] = json_encode($reply_markup);
    }
    
    $ch = curl_init($TELEGRAM_API . '/sendMessage');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    $result = curl_exec($ch);
    curl_close($ch);
    
    return json_decode($result, true);
}

/**
 * Получение информации о пользователе из БД
 */
function getTelegramUser($telegram_id) {
    global $conn;
    
    $stmt = $conn->prepare("SELECT * FROM telegram_users WHERE telegram_id = ?");
    $stmt->bind_param("s", $telegram_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

/**
 * Сохранение Telegram ID пользователя
 */
function saveTelegramUser($telegram_id, $username, $first_name, $last_name = '') {
    global $conn;
    
    // Проверяем, существует ли пользователь
    $user = getTelegramUser($telegram_id);
    
    if ($user) {
        // Обновляем существующего
        $stmt = $conn->prepare("
            UPDATE telegram_users 
            SET username = ?, first_name = ?, last_name = ?, updated_at = NOW()
            WHERE telegram_id = ?
        ");
        $stmt->bind_param("ssss", $username, $first_name, $last_name, $telegram_id);
    } else {
        // Создаём нового
        $stmt = $conn->prepare("
            INSERT INTO telegram_users (telegram_id, username, first_name, last_name)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->bind_param("ssss", $telegram_id, $username, $first_name, $last_name);
    }
    
    $stmt->execute();
}

/**
 * Привязка Telegram ID к капитану команды
 */
function linkCaptainToTelegram($telegram_id, $captain_telegram) {
    global $conn;
    
    // Ищем команду по telegram капитана
    $stmt = $conn->prepare("
        UPDATE teams 
        SET captain_telegram_id = ?
        WHERE captain_telegram = ? AND status = 'approved'
        LIMIT 1
    ");
    $stmt->bind_param("ss", $telegram_id, $captain_telegram);
    $success = $stmt->execute();
    
    if ($success && $stmt->affected_rows > 0) {
        return true;
    }
    
    return false;
}

/**
 * Получение команды капитана
 */
function getCaptainTeam($telegram_id) {
    global $conn;
    
    $stmt = $conn->prepare("
        SELECT * FROM teams 
        WHERE captain_telegram_id = ?
        ORDER BY created_at DESC
        LIMIT 1
    ");
    $stmt->bind_param("s", $telegram_id);
    $stmt->execute();
    $result = $stmt->get_result();
    return $result->fetch_assoc();
}

/**
 * Получение матчей команды
 */
function getTeamMatches($team_id) {
    global $conn;
    
    $stmt = $conn->prepare("
        SELECT m.*, 
               t1.team_name as team1_name,
               t2.team_name as team2_name
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        WHERE m.team1_id = ? OR m.team2_id = ?
        ORDER BY m.round_number, m.match_number
    ");
    $stmt->bind_param("ii", $team_id, $team_id);
    $stmt->execute();
    return $stmt->get_result()->fetch_all(MYSQLI_ASSOC);
}

/**
 * Обработка команды /start
 */
function handleStart($chat_id, $telegram_id, $username, $first_name, $last_name) {
    // Сохраняем пользователя
    saveTelegramUser($telegram_id, $username, $first_name, $last_name);
    
    $welcome_text = "🎮 <b>Добро пожаловать в турнирного бота League of Legends!</b>\n\n";
    $welcome_text .= "Я помогу тебе следить за твоей командой и турниром.\n\n";
    $welcome_text .= "📋 <b>Доступные команды:</b>\n";
    $welcome_text .= "/link @ваш_telegram - Привязать аккаунт к команде\n";
    $welcome_text .= "/team - Информация о команде\n";
    $welcome_text .= "/matches - Расписание матчей\n";
    $welcome_text .= "/help - Справка\n\n";
    $welcome_text .= "Для начала привяжи свой Telegram к команде командой:\n";
    $welcome_text .= "<code>/link @твой_ник</code>";
    
    $keyboard = [
        'keyboard' => [
            [['text' => '👥 Моя команда'], ['text' => '🎯 Матчи']],
            [['text' => '📊 Турнирная сетка'], ['text' => 'ℹ️ Помощь']]
        ],
        'resize_keyboard' => true
    ];
    
    sendMessage($chat_id, $welcome_text, 'HTML', $keyboard);
}

/**
 * Обработка команды /link
 */
function handleLink($chat_id, $telegram_id, $message_text) {
    // Извлекаем @username из сообщения
    preg_match('/@(\w+)/', $message_text, $matches);
    
    if (empty($matches[1])) {
        sendMessage($chat_id, "❌ Неверный формат.\n\nИспользуй: <code>/link @твой_ник</code>", 'HTML');
        return;
    }
    
    $captain_telegram = '@' . $matches[1];
    
    // Пытаемся привязать
    if (linkCaptainToTelegram($telegram_id, $captain_telegram)) {
        $team = getCaptainTeam($telegram_id);
        
        $success_text = "✅ <b>Успешно!</b>\n\n";
        $success_text .= "Твой Telegram привязан к команде:\n";
        $success_text .= "🏆 <b>{$team['team_name']}</b>\n\n";
        $success_text .= "Теперь ты будешь получать уведомления о:\n";
        $success_text .= "• Одобрении заявки\n";
        $success_text .= "• Новых матчах\n";
        $success_text .= "• Изменениях в турнире\n\n";
        $success_text .= "Используй /team для просмотра информации о команде";
        
        sendMessage($chat_id, $success_text, 'HTML');
    } else {
        $error_text = "❌ <b>Ошибка привязки</b>\n\n";
        $error_text .= "Не найдена одобренная команда с капитаном {$captain_telegram}\n\n";
        $error_text .= "Проверь:\n";
        $error_text .= "• Правильность написания Telegram\n";
        $error_text .= "• Команда должна быть одобрена администратором\n";
        $error_text .= "• Telegram должен совпадать с указанным при регистрации";
        
        sendMessage($chat_id, $error_text, 'HTML');
    }
}

/**
 * Обработка команды /team
 */
function handleTeam($chat_id, $telegram_id) {
    $team = getCaptainTeam($telegram_id);
    
    if (!$team) {
        sendMessage($chat_id, "❌ Команда не найдена.\n\nСначала привяжи свой аккаунт: /link @твой_ник", 'HTML');
        return;
    }
    
    $players = json_decode($team['players'], true);
    
    $team_text = "🏆 <b>{$team['team_name']}</b>\n";
    $team_text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
    $team_text .= "👤 <b>Капитан:</b> {$team['captain_name']}\n";
    $team_text .= "💬 <b>Telegram:</b> {$team['captain_telegram']}\n";
    $team_text .= "📱 <b>Телефон:</b> {$team['captain_phone']}\n\n";
    
    $team_text .= "👥 <b>Состав команды:</b>\n";
    foreach ($players as $i => $player) {
        $num = $i + 1;
        $team_text .= "{$num}. {$player['summonerName']} ({$player['role']})\n";
        $team_text .= "   Ранг: {$player['rank']}\n";
    }
    
    $team_text .= "\n📊 <b>Статус:</b> ";
    switch ($team['status']) {
        case 'approved':
            $team_text .= "✅ Одобрена";
            break;
        case 'pending':
            $team_text .= "⏳ На модерации";
            break;
        case 'rejected':
            $team_text .= "❌ Отклонена";
            break;
        default:
            $team_text .= $team['status'];
    }
    
    sendMessage($chat_id, $team_text, 'HTML');
}

/**
 * Обработка команды /matches
 */
function handleMatches($chat_id, $telegram_id) {
    $team = getCaptainTeam($telegram_id);
    
    if (!$team) {
        sendMessage($chat_id, "❌ Команда не найдена.\n\nСначала привяжи свой аккаунт: /link @твой_ник", 'HTML');
        return;
    }
    
    $matches = getTeamMatches($team['id']);
    
    if (empty($matches)) {
        sendMessage($chat_id, "📅 У твоей команды пока нет запланированных матчей.\n\nМатчи появятся после формирования турнирной сетки.", 'HTML');
        return;
    }
    
    $matches_text = "🎯 <b>Матчи команды {$team['team_name']}</b>\n";
    $matches_text .= "━━━━━━━━━━━━━━━━━━━━\n\n";
    
    foreach ($matches as $match) {
        $round_name = $match['round_number'] == 1 ? '1/8 финала' : 
                     ($match['round_number'] == 2 ? '1/4 финала' : 
                     ($match['round_number'] == 3 ? 'Полуфинал' : 
                     ($match['round_number'] == 4 ? 'Финал' : "Раунд {$match['round_number']}")));
        
        $matches_text .= "🏅 <b>{$round_name}</b> - Матч {$match['match_number']}\n";
        $matches_text .= "⚔️ {$match['team1_name']} vs {$match['team2_name']}\n";
        
        if ($match['status'] == 'completed') {
            $matches_text .= "📊 Счёт: {$match['team1_score']} - {$match['team2_score']}\n";
            $winner = $match['winner_id'] == $team['id'] ? '🏆 Победа!' : '💔 Поражение';
            $matches_text .= "{$winner}\n";
        } else {
            $matches_text .= "⏳ Ожидается\n";
        }
        
        $matches_text .= "\n";
    }
    
    sendMessage($chat_id, $matches_text, 'HTML');
}

/**
 * Обработка команды /help
 */
function handleHelp($chat_id) {
    $help_text = "ℹ️ <b>Справка по боту</b>\n\n";
    $help_text .= "📋 <b>Команды:</b>\n\n";
    $help_text .= "/start - Начать работу с ботом\n";
    $help_text .= "/link @ник - Привязать Telegram к команде\n";
    $help_text .= "/team - Информация о твоей команде\n";
    $help_text .= "/matches - Расписание матчей\n";
    $help_text .= "/help - Эта справка\n\n";
    $help_text .= "🎮 <b>Кнопки меню:</b>\n\n";
    $help_text .= "👥 Моя команда - Состав и статус\n";
    $help_text .= "🎯 Матчи - Расписание игр\n";
    $help_text .= "📊 Турнирная сетка - Просмотр сетки\n";
    $help_text .= "ℹ️ Помощь - Эта справка\n\n";
    $help_text .= "📢 Ты будешь получать уведомления о:\n";
    $help_text .= "• Одобрении заявки команды\n";
    $help_text .= "• Новых матчах\n";
    $help_text .= "• Изменении счёта\n";
    $help_text .= "• Важных объявлениях турнира";
    
    sendMessage($chat_id, $help_text, 'HTML');
}

/**
 * Обработка текстовых кнопок
 */
function handleButton($chat_id, $telegram_id, $text) {
    switch ($text) {
        case '👥 Моя команда':
            handleTeam($chat_id, $telegram_id);
            break;
        case '🎯 Матчи':
            handleMatches($chat_id, $telegram_id);
            break;
        case '📊 Турнирная сетка':
            $bracket_url = "https://ce876244.tw1.ru/bracket";
            sendMessage($chat_id, "📊 <b>Турнирная сетка</b>\n\nПосмотреть полную сетку турнира:\n{$bracket_url}", 'HTML');
            break;
        case 'ℹ️ Помощь':
            handleHelp($chat_id);
            break;
        default:
            sendMessage($chat_id, "Неизвестная команда. Используй /help для справки.");
    }
}

// ============================================
// ОСНОВНАЯ ЛОГИКА ОБРАБОТКИ WEBHOOK
// ============================================

// Получаем данные от Telegram
$content = file_get_contents('php://input');
$update = json_decode($content, true);

// Логируем входящие запросы (опционально, для отладки)
// file_put_contents(__DIR__ . '/webhook.log', date('Y-m-d H:i:s') . "\n" . $content . "\n\n", FILE_APPEND);

if (!$update) {
    http_response_code(200);
    exit;
}

// Извлекаем данные сообщения
if (isset($update['message'])) {
    $message = $update['message'];
    $chat_id = $message['chat']['id'];
    $telegram_id = (string)$message['from']['id'];
    $username = $message['from']['username'] ?? '';
    $first_name = $message['from']['first_name'] ?? '';
    $last_name = $message['from']['last_name'] ?? '';
    $text = $message['text'] ?? '';
    
    // Обрабатываем команды
    if (strpos($text, '/start') === 0) {
        handleStart($chat_id, $telegram_id, $username, $first_name, $last_name);
    }
    elseif (strpos($text, '/link') === 0) {
        handleLink($chat_id, $telegram_id, $text);
    }
    elseif (strpos($text, '/team') === 0) {
        handleTeam($chat_id, $telegram_id);
    }
    elseif (strpos($text, '/matches') === 0) {
        handleMatches($chat_id, $telegram_id);
    }
    elseif (strpos($text, '/help') === 0) {
        handleHelp($chat_id);
    }
    else {
        // Обрабатываем текстовые кнопки
        handleButton($chat_id, $telegram_id, $text);
    }
}

// Возвращаем успешный ответ Telegram
http_response_code(200);
echo json_encode(['ok' => true]);
