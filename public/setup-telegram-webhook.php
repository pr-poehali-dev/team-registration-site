<?php
// Скрипт для настройки webhook Telegram бота
// Запусти ОДИН РАЗ после загрузки telegram-bot.php на хостинг

$bot_token = '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds';
$webhook_url = 'https://ce876244.tw1.ru/telegram-bot.php'; // URL к telegram-bot.php на хостинге

// Установка webhook
$url = "https://api.telegram.org/bot{$bot_token}/setWebhook";
$data = ['url' => $webhook_url];

$options = [
    'http' => [
        'header'  => "Content-type: application/json\r\n",
        'method'  => 'POST',
        'content' => json_encode($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($url, false, $context);
$response = json_decode($result, true);

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Настройка Telegram бота</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 50px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .success { 
            background: #4CAF50; 
            color: white; 
            padding: 20px; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .error { 
            background: #f44336; 
            color: white; 
            padding: 20px; 
            border-radius: 5px; 
            margin: 20px 0;
        }
        .info {
            background: white;
            padding: 20px;
            border-radius: 5px;
            margin: 20px 0;
        }
        pre {
            background: #263238;
            color: #aed581;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <h1>🤖 Настройка Telegram бота</h1>
    
    <?php if ($response && $response['ok']): ?>
        <div class="success">
            <h2>✅ Webhook успешно установлен!</h2>
            <p>URL: <?= htmlspecialchars($webhook_url) ?></p>
        </div>
        
        <div class="info">
            <h3>Что дальше?</h3>
            <ol>
                <li>Найди своего бота в Telegram</li>
                <li>Отправь команду <code>/start</code></li>
                <li>Бот должен ответить приветственным сообщением</li>
            </ol>
            
            <h3>Доступные команды:</h3>
            <ul>
                <li><code>/start</code> - Начало работы</li>
                <li><code>/register</code> - Регистрация команды</li>
                <li><code>/myteam</code> - Информация о команде</li>
                <li><code>/cancel</code> - Отменить регистрацию</li>
                <li><code>/help</code> - Помощь</li>
            </ul>
            
            <h3>⚠️ Важно:</h3>
            <p><strong>УДАЛИ ЭТОТ ФАЙЛ</strong> после настройки webhook для безопасности!</p>
            <pre>rm setup-telegram-webhook.php</pre>
        </div>
    <?php else: ?>
        <div class="error">
            <h2>❌ Ошибка установки webhook</h2>
            <p>Проверьте токен бота и URL webhook</p>
            <pre><?= htmlspecialchars(json_encode($response, JSON_PRETTY_PRINT)) ?></pre>
        </div>
        
        <div class="info">
            <h3>Что проверить:</h3>
            <ol>
                <li>Токен бота правильный? (получить у @BotFather)</li>
                <li>URL доступен по HTTPS? (HTTP не поддерживается Telegram)</li>
                <li>Файл telegram-bot.php загружен на хостинг?</li>
            </ol>
        </div>
    <?php endif; ?>
    
    <div class="info">
        <h3>Полный ответ от Telegram API:</h3>
        <pre><?= htmlspecialchars(json_encode($response, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) ?></pre>
    </div>
</body>
</html>