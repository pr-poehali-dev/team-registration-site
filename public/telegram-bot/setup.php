<?php
/**
 * Установка webhook для Telegram бота
 * Запустите этот файл один раз для настройки бота
 */

// Настройки
$BOT_TOKEN = getenv('TELEGRAM_BOT_TOKEN') ?: '';
$WEBHOOK_URL = getenv('TELEGRAM_WEBHOOK_URL') ?: 'https://ce876244.tw1.ru/telegram-bot/bot.php';

if (empty($BOT_TOKEN)) {
    die("❌ Ошибка: TELEGRAM_BOT_TOKEN не установлен\n\nСоздайте файл .env или установите переменную окружения");
}

$TELEGRAM_API = "https://api.telegram.org/bot{$BOT_TOKEN}";

?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Настройка Telegram бота</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
            max-width: 600px;
            width: 100%;
        }
        h1 {
            color: #2d3748;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #718096;
            margin-bottom: 30px;
        }
        .info-box {
            background: #f7fafc;
            border-left: 4px solid #4299e1;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 4px;
        }
        .info-box strong {
            color: #2d3748;
            display: block;
            margin-bottom: 5px;
        }
        .info-box code {
            background: #e2e8f0;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 14px;
            color: #2d3748;
        }
        .button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 15px 30px;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            width: 100%;
            margin-bottom: 15px;
            transition: transform 0.2s;
        }
        .button:hover {
            transform: translateY(-2px);
        }
        .button:active {
            transform: translateY(0);
        }
        .button.secondary {
            background: #e2e8f0;
            color: #2d3748;
        }
        .result {
            margin-top: 20px;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }
        .result.success {
            background: #c6f6d5;
            color: #22543d;
            border-left: 4px solid #38a169;
        }
        .result.error {
            background: #fed7d7;
            color: #742a2a;
            border-left: 4px solid #e53e3e;
        }
        .step {
            margin: 20px 0;
            padding: 20px;
            background: #f7fafc;
            border-radius: 8px;
        }
        .step-number {
            display: inline-block;
            width: 30px;
            height: 30px;
            background: #667eea;
            color: white;
            border-radius: 50%;
            text-align: center;
            line-height: 30px;
            font-weight: bold;
            margin-right: 10px;
        }
        .step-title {
            font-size: 18px;
            font-weight: 600;
            color: #2d3748;
            margin-bottom: 10px;
        }
        .step-description {
            color: #4a5568;
            line-height: 1.6;
        }
        pre {
            background: #2d3748;
            color: #e2e8f0;
            padding: 15px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .warning {
            background: #fef5e7;
            border-left: 4px solid #f39c12;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🤖 Настройка Telegram бота</h1>
        <p class="subtitle">Турнирная система League of Legends</p>

        <div class="info-box">
            <strong>📋 Текущие настройки:</strong>
            <div>Webhook URL: <code><?php echo htmlspecialchars($WEBHOOK_URL); ?></code></div>
            <div>Токен: <code><?php echo htmlspecialchars(substr($BOT_TOKEN, 0, 10)); ?>...</code></div>
        </div>

        <div class="step">
            <div class="step-title">
                <span class="step-number">1</span>
                Установить webhook
            </div>
            <div class="step-description">
                Настройте автоматическую обработку сообщений от пользователей
            </div>
            <button class="button" onclick="setWebhook()">
                🔗 Установить webhook
            </button>
        </div>

        <div class="step">
            <div class="step-title">
                <span class="step-number">2</span>
                Проверить статус
            </div>
            <div class="step-description">
                Узнайте, правильно ли настроен webhook
            </div>
            <button class="button secondary" onclick="getWebhookInfo()">
                ℹ️ Проверить webhook
            </button>
        </div>

        <div class="step">
            <div class="step-title">
                <span class="step-number">3</span>
                Получить информацию о боте
            </div>
            <div class="step-description">
                Проверьте, что токен правильный и бот активен
            </div>
            <button class="button secondary" onclick="getBotInfo()">
                🤖 Информация о боте
            </button>
        </div>

        <div class="warning">
            <strong>⚠️ Важно:</strong><br>
            Убедитесь, что переменная окружения <code>TELEGRAM_BOT_TOKEN</code> установлена в вашем хостинге.
        </div>

        <div id="result" class="result"></div>

        <div class="step">
            <div class="step-title">📚 Как получить токен бота?</div>
            <div class="step-description">
                <ol style="margin-left: 20px; line-height: 2;">
                    <li>Найдите <code>@BotFather</code> в Telegram</li>
                    <li>Отправьте команду <code>/newbot</code></li>
                    <li>Следуйте инструкциям</li>
                    <li>Получите токен и сохраните его в переменных окружения</li>
                </ol>
            </div>
        </div>

        <div class="step">
            <div class="step-title">🔧 Настройка переменных окружения</div>
            <div class="step-description">
                Создайте файл <code>.env</code> в корне проекта:
                <pre>TELEGRAM_BOT_TOKEN=ваш_токен_бота
TELEGRAM_WEBHOOK_URL=https://ce876244.tw1.ru/telegram-bot/bot.php</pre>
            </div>
        </div>
    </div>

    <script>
        const API_URL = '<?php echo $TELEGRAM_API; ?>';

        function showResult(message, isSuccess) {
            const resultDiv = document.getElementById('result');
            resultDiv.className = 'result ' + (isSuccess ? 'success' : 'error');
            resultDiv.innerHTML = message;
            resultDiv.style.display = 'block';
        }

        async function setWebhook() {
            try {
                const response = await fetch(API_URL + '/setWebhook', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        url: '<?php echo $WEBHOOK_URL; ?>'
                    })
                });

                const data = await response.json();
                
                if (data.ok) {
                    showResult('✅ Webhook успешно установлен!<br>URL: <?php echo htmlspecialchars($WEBHOOK_URL); ?>', true);
                } else {
                    showResult('❌ Ошибка: ' + (data.description || 'Неизвестная ошибка'), false);
                }
            } catch (error) {
                showResult('❌ Ошибка сети: ' + error.message, false);
            }
        }

        async function getWebhookInfo() {
            try {
                const response = await fetch(API_URL + '/getWebhookInfo');
                const data = await response.json();
                
                if (data.ok) {
                    const info = data.result;
                    let message = '📊 <strong>Информация о webhook:</strong><br><br>';
                    message += `URL: ${info.url || 'Не установлен'}<br>`;
                    message += `Проверен: ${info.has_custom_certificate ? 'Да' : 'Нет'}<br>`;
                    message += `Ожидающих обновлений: ${info.pending_update_count}<br>`;
                    
                    if (info.last_error_date) {
                        message += `<br>⚠️ Последняя ошибка: ${info.last_error_message}<br>`;
                        message += `Дата: ${new Date(info.last_error_date * 1000).toLocaleString('ru-RU')}`;
                        showResult(message, false);
                    } else {
                        showResult(message, true);
                    }
                } else {
                    showResult('❌ Ошибка: ' + (data.description || 'Неизвестная ошибка'), false);
                }
            } catch (error) {
                showResult('❌ Ошибка сети: ' + error.message, false);
            }
        }

        async function getBotInfo() {
            try {
                const response = await fetch(API_URL + '/getMe');
                const data = await response.json();
                
                if (data.ok) {
                    const bot = data.result;
                    let message = '🤖 <strong>Информация о боте:</strong><br><br>';
                    message += `Имя: ${bot.first_name}<br>`;
                    message += `Username: @${bot.username}<br>`;
                    message += `ID: ${bot.id}<br>`;
                    message += `Может присоединяться к группам: ${bot.can_join_groups ? 'Да' : 'Нет'}<br>`;
                    showResult(message, true);
                } else {
                    showResult('❌ Ошибка: ' + (data.description || 'Неизвестная ошибка'), false);
                }
            } catch (error) {
                showResult('❌ Ошибка сети: ' + error.message, false);
            }
        }
    </script>
</body>
</html>
