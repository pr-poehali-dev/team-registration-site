<?php
/**
 * Тестирование Telegram бота
 * 
 * Этот скрипт проверяет все функции бота
 * 
 * Использование:
 * 1. Открой в браузере: https://ce876244.tw1.ru/php-backend/telegram-bot/test-bot.php
 * 2. Выбери тест для запуска
 */

require_once __DIR__ . '/../config.php';

define('BOT_TOKEN', '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds');
define('API_URL', 'https://api.telegram.org/bot' . BOT_TOKEN . '/');

?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Тестирование Telegram бота</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 3px solid #0088cc;
            padding-bottom: 10px;
        }
        h2 {
            color: #0088cc;
            margin-top: 30px;
        }
        .test-section {
            background: #f9f9f9;
            padding: 20px;
            margin: 15px 0;
            border-radius: 5px;
            border-left: 4px solid #0088cc;
        }
        .success {
            color: #28a745;
            font-weight: bold;
        }
        .error {
            color: #dc3545;
            font-weight: bold;
        }
        .warning {
            color: #ffc107;
            font-weight: bold;
        }
        pre {
            background: #282c34;
            color: #abb2bf;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .button {
            display: inline-block;
            padding: 10px 20px;
            background: #0088cc;
            color: white;
            text-decoration: none;
            border-radius: 5px;
            margin: 5px;
        }
        .button:hover {
            background: #006699;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #ddd;
        }
        th {
            background: #0088cc;
            color: white;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Тестирование Telegram бота</h1>
        
        <?php
        $action = $_GET['action'] ?? '';
        
        if (!$action) {
            showMenu();
        } else {
            switch ($action) {
                case 'webhook_info':
                    testWebhookInfo();
                    break;
                case 'bot_info':
                    testBotInfo();
                    break;
                case 'send_test':
                    testSendMessage();
                    break;
                case 'db_check':
                    testDatabase();
                    break;
                case 'notify_test':
                    testNotification();
                    break;
                default:
                    echo "<p class='error'>Неизвестное действие</p>";
                    showMenu();
            }
        }
        ?>
        
        <hr>
        <p><a href="?">← Вернуться в меню</a></p>
    </div>
</body>
</html>

<?php

function showMenu() {
    ?>
    <div class="test-section">
        <h2>Доступные тесты</h2>
        <p>Выберите тест для проверки работы бота:</p>
        
        <a href="?action=webhook_info" class="button">📡 Проверить Webhook</a>
        <a href="?action=bot_info" class="button">🤖 Информация о боте</a>
        <a href="?action=db_check" class="button">💾 Проверить БД</a>
        <a href="?action=send_test" class="button">✉️ Тест отправки</a>
        <a href="?action=notify_test" class="button">🔔 Тест уведомления</a>
    </div>
    
    <div class="test-section">
        <h2>Быстрые ссылки</h2>
        <ul>
            <li><a href="set-webhook.php">Установить webhook</a></li>
            <li><a href="https://t.me/TournamentWR_bot" target="_blank">Открыть бота</a></li>
            <li><a href="../api/teams.php" target="_blank">API команд</a></li>
        </ul>
    </div>
    <?php
}

function testWebhookInfo() {
    echo "<h2>📡 Проверка Webhook</h2>";
    
    $url = API_URL . 'getWebhookInfo';
    $result = file_get_contents($url);
    $data = json_decode($result, true);
    
    if ($data['ok']) {
        $info = $data['result'];
        
        echo "<div class='test-section'>";
        echo "<h3>Статус Webhook</h3>";
        
        if ($info['url']) {
            echo "<p class='success'>✅ Webhook установлен</p>";
            echo "<p><strong>URL:</strong> " . htmlspecialchars($info['url']) . "</p>";
        } else {
            echo "<p class='error'>❌ Webhook не установлен</p>";
            echo "<p><a href='set-webhook.php' class='button'>Установить webhook</a></p>";
        }
        
        echo "<p><strong>Pending updates:</strong> " . ($info['pending_update_count'] ?? 0) . "</p>";
        
        if (isset($info['last_error_message'])) {
            echo "<p class='error'><strong>Последняя ошибка:</strong> " . htmlspecialchars($info['last_error_message']) . "</p>";
            echo "<p><strong>Время ошибки:</strong> " . date('Y-m-d H:i:s', $info['last_error_date']) . "</p>";
        } else {
            echo "<p class='success'>Ошибок нет</p>";
        }
        
        echo "<p><strong>Max connections:</strong> " . ($info['max_connections'] ?? 40) . "</p>";
        
        if (isset($info['ip_address'])) {
            echo "<p><strong>IP адрес:</strong> " . $info['ip_address'] . "</p>";
        }
        
        echo "</div>";
        
        echo "<div class='test-section'>";
        echo "<h3>Raw JSON</h3>";
        echo "<pre>" . json_encode($info, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
        echo "</div>";
        
    } else {
        echo "<p class='error'>❌ Ошибка получения информации</p>";
        echo "<pre>" . htmlspecialchars($result) . "</pre>";
    }
}

function testBotInfo() {
    echo "<h2>🤖 Информация о боте</h2>";
    
    $url = API_URL . 'getMe';
    $result = file_get_contents($url);
    $data = json_decode($result, true);
    
    if ($data['ok']) {
        $bot = $data['result'];
        
        echo "<div class='test-section'>";
        echo "<table>";
        echo "<tr><th>Параметр</th><th>Значение</th></tr>";
        echo "<tr><td>ID</td><td>" . $bot['id'] . "</td></tr>";
        echo "<tr><td>Имя</td><td>" . htmlspecialchars($bot['first_name']) . "</td></tr>";
        echo "<tr><td>Username</td><td>@" . htmlspecialchars($bot['username']) . "</td></tr>";
        echo "<tr><td>Может присоединяться к группам</td><td>" . ($bot['can_join_groups'] ? 'Да' : 'Нет') . "</td></tr>";
        echo "<tr><td>Может читать все сообщения в группах</td><td>" . ($bot['can_read_all_group_messages'] ? 'Да' : 'Нет') . "</td></tr>";
        echo "<tr><td>Поддерживает inline режим</td><td>" . ($bot['supports_inline_queries'] ? 'Да' : 'Нет') . "</td></tr>";
        echo "</table>";
        echo "</div>";
        
        echo "<div class='test-section'>";
        echo "<h3>Ссылка на бота</h3>";
        echo "<p><a href='https://t.me/" . $bot['username'] . "' target='_blank'>https://t.me/" . $bot['username'] . "</a></p>";
        echo "</div>";
        
    } else {
        echo "<p class='error'>❌ Ошибка получения информации о боте</p>";
    }
}

function testDatabase() {
    global $pdo;
    
    echo "<h2>💾 Проверка базы данных</h2>";
    
    // Проверка таблицы telegram_users
    echo "<div class='test-section'>";
    echo "<h3>Таблица telegram_users</h3>";
    
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM telegram_users");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo "<p class='success'>✅ Таблица существует</p>";
        echo "<p>Пользователей в БД: <strong>$count</strong></p>";
        
        if ($count > 0) {
            $stmt = $pdo->query("SELECT * FROM telegram_users ORDER BY updated_at DESC LIMIT 5");
            $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo "<table>";
            echo "<tr><th>Chat ID</th><th>Username</th><th>Имя</th><th>Обновлено</th></tr>";
            foreach ($users as $user) {
                echo "<tr>";
                echo "<td>" . $user['chat_id'] . "</td>";
                echo "<td>@" . htmlspecialchars($user['username']) . "</td>";
                echo "<td>" . htmlspecialchars($user['first_name'] . ' ' . $user['last_name']) . "</td>";
                echo "<td>" . $user['updated_at'] . "</td>";
                echo "</tr>";
            }
            echo "</table>";
        }
        
    } catch (PDOException $e) {
        echo "<p class='error'>❌ Ошибка: " . $e->getMessage() . "</p>";
    }
    echo "</div>";
    
    // Проверка таблицы pending_changes
    echo "<div class='test-section'>";
    echo "<h3>Таблица pending_changes</h3>";
    
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM pending_changes");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo "<p class='success'>✅ Таблица существует</p>";
        echo "<p>Ожидающих изменений: <strong>$count</strong></p>";
        
    } catch (PDOException $e) {
        echo "<p class='error'>❌ Ошибка: " . $e->getMessage() . "</p>";
    }
    echo "</div>";
    
    // Проверка таблицы teams
    echo "<div class='test-section'>";
    echo "<h3>Таблица teams</h3>";
    
    try {
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM teams");
        $count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
        
        echo "<p class='success'>✅ Таблица существует</p>";
        echo "<p>Команд в БД: <strong>$count</strong></p>";
        
    } catch (PDOException $e) {
        echo "<p class='error'>❌ Ошибка: " . $e->getMessage() . "</p>";
    }
    echo "</div>";
}

function testSendMessage() {
    echo "<h2>✉️ Тест отправки сообщения</h2>";
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $chat_id = $_POST['chat_id'] ?? '';
        $message = $_POST['message'] ?? '';
        
        if ($chat_id && $message) {
            $url = API_URL . 'sendMessage';
            
            $data = [
                'chat_id' => $chat_id,
                'text' => $message,
                'parse_mode' => 'Markdown'
            ];
            
            $options = [
                'http' => [
                    'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
                    'method'  => 'POST',
                    'content' => http_build_query($data)
                ]
            ];
            
            $context = stream_context_create($options);
            $result = file_get_contents($url, false, $context);
            $response = json_decode($result, true);
            
            if ($response['ok']) {
                echo "<p class='success'>✅ Сообщение отправлено!</p>";
                echo "<pre>" . json_encode($response['result'], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . "</pre>";
            } else {
                echo "<p class='error'>❌ Ошибка отправки</p>";
                echo "<pre>" . htmlspecialchars($result) . "</pre>";
            }
        }
    }
    
    ?>
    <div class="test-section">
        <h3>Отправить тестовое сообщение</h3>
        <form method="POST">
            <p>
                <label>Chat ID (или @username):</label><br>
                <input type="text" name="chat_id" placeholder="123456789 или @username" style="width: 300px; padding: 5px;">
            </p>
            <p>
                <label>Сообщение:</label><br>
                <textarea name="message" rows="4" style="width: 500px; padding: 5px;">🤖 Тестовое сообщение от бота!

Это тест отправки через Telegram API.</textarea>
            </p>
            <p>
                <button type="submit" class="button">Отправить</button>
            </p>
        </form>
        
        <p class="warning">⚠️ Чтобы узнать свой chat_id:</p>
        <ol>
            <li>Напишите боту @userinfobot</li>
            <li>Или напишите вашему боту /start</li>
            <li>Посмотрите chat_id в таблице telegram_users</li>
        </ol>
    </div>
    <?php
}

function testNotification() {
    global $pdo;
    
    echo "<h2>🔔 Тест системы уведомлений</h2>";
    
    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        $team_id = $_POST['team_id'] ?? '';
        $action = $_POST['action'] ?? '';
        
        if ($team_id && $action) {
            $notify_url = 'https://ce876244.tw1.ru/php-backend/telegram-bot/send-notification.php';
            
            $data = [
                'team_id' => (int)$team_id,
                'action' => $action
            ];
            
            $options = [
                'http' => [
                    'header'  => "Content-type: application/json\r\n",
                    'method'  => 'POST',
                    'content' => json_encode($data),
                    'timeout' => 10
                ]
            ];
            
            $context = stream_context_create($options);
            $result = @file_get_contents($notify_url, false, $context);
            
            if ($result) {
                $response = json_decode($result, true);
                if ($response && $response['success']) {
                    echo "<p class='success'>✅ Уведомление отправлено!</p>";
                } else {
                    echo "<p class='error'>❌ Ошибка: " . ($response['error'] ?? 'Unknown error') . "</p>";
                }
            } else {
                echo "<p class='error'>❌ Не удалось отправить запрос</p>";
            }
        }
    }
    
    // Показать доступные команды
    $stmt = $pdo->query("SELECT id, team_name, captain_name, captain_telegram FROM teams ORDER BY created_at DESC LIMIT 5");
    $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    ?>
    <div class="test-section">
        <h3>Отправить уведомление команде</h3>
        
        <?php if (count($teams) > 0): ?>
        <form method="POST">
            <p>
                <label>Команда:</label><br>
                <select name="team_id" style="width: 400px; padding: 5px;">
                    <?php foreach ($teams as $team): ?>
                    <option value="<?= $team['id'] ?>">
                        <?= htmlspecialchars($team['team_name']) ?> 
                        (капитан: @<?= htmlspecialchars($team['captain_telegram']) ?>)
                    </option>
                    <?php endforeach; ?>
                </select>
            </p>
            <p>
                <label>Тип уведомления:</label><br>
                <select name="action" style="width: 400px; padding: 5px;">
                    <option value="send_auth_code">Отправить код регистрации</option>
                    <option value="notify_status">Уведомление о статусе</option>
                </select>
            </p>
            <p>
                <button type="submit" class="button">Отправить уведомление</button>
            </p>
        </form>
        <?php else: ?>
        <p class="warning">⚠️ В базе нет команд для тестирования</p>
        <?php endif; ?>
    </div>
    <?php
}
?>
