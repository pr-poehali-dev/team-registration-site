<?php
/**
 * Установка Webhook для Telegram бота
 * 
 * Этот скрипт нужно запустить ОДИН РАЗ для подключения webhook
 * 
 * Использование:
 * 1. Открой в браузере: https://ce876244.tw1.ru/php-backend/telegram-bot/set-webhook.php
 * 2. Если успешно - увидишь "Webhook установлен!"
 * 3. После этого бот будет принимать сообщения
 */

define('BOT_TOKEN', '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds');
define('WEBHOOK_URL', 'https://ce876244.tw1.ru/php-backend/telegram-bot/webhook.php');

$api_url = "https://api.telegram.org/bot" . BOT_TOKEN . "/setWebhook";

$data = [
    'url' => WEBHOOK_URL,
    'drop_pending_updates' => true // Очистить старые обновления
];

$options = [
    'http' => [
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'method'  => 'POST',
        'content' => http_build_query($data)
    ]
];

$context = stream_context_create($options);
$result = file_get_contents($api_url, false, $context);
$response = json_decode($result, true);

echo "<h1>Установка Webhook</h1>";
echo "<p><strong>URL:</strong> " . WEBHOOK_URL . "</p>";

if ($response['ok']) {
    echo "<p style='color: green;'>✅ <strong>Webhook успешно установлен!</strong></p>";
    echo "<p>Описание: " . ($response['description'] ?? 'OK') . "</p>";
} else {
    echo "<p style='color: red;'>❌ <strong>Ошибка установки webhook</strong></p>";
    echo "<p>Ошибка: " . ($response['description'] ?? 'Unknown error') . "</p>";
}

echo "<hr>";
echo "<h2>Проверка статуса</h2>";

// Проверить текущий webhook
$info_url = "https://api.telegram.org/bot" . BOT_TOKEN . "/getWebhookInfo";
$info_result = file_get_contents($info_url);
$info = json_decode($info_result, true);

if ($info['ok']) {
    $webhook_info = $info['result'];
    echo "<p><strong>URL:</strong> " . ($webhook_info['url'] ?: '<em>не установлен</em>') . "</p>";
    echo "<p><strong>Pending updates:</strong> " . ($webhook_info['pending_update_count'] ?? 0) . "</p>";
    echo "<p><strong>Last error:</strong> " . ($webhook_info['last_error_message'] ?? '<em>нет ошибок</em>') . "</p>";
    echo "<p><strong>Max connections:</strong> " . ($webhook_info['max_connections'] ?? 40) . "</p>";
}

echo "<hr>";
echo "<h2>Следующие шаги</h2>";
echo "<ol>";
echo "<li>Напишите боту: <a href='https://t.me/TournamentWR_bot' target='_blank'>@TournamentWR_bot</a></li>";
echo "<li>Отправьте команду: /start</li>";
echo "<li>Проверьте что бот отвечает</li>";
echo "</ol>";

echo "<hr>";
echo "<p><strong>Логи:</strong> Проверяйте логи в /var/log/php_errors.log или через панель Timeweb</p>";
echo "<p><strong>Отладка:</strong> Webhook должен отвечать на запросы Telegram и возвращать HTTP 200</p>";
