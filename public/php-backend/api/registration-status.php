<?php
/**
 * API Endpoint: Проверка статуса регистрации
 * 
 * Назначение:
 * - Проверяет, открыта ли регистрация (is_open из таблицы registration_settings)
 * - Используется frontend для отображения статуса и блокировки действий
 * 
 * Методы:
 * - GET: Получить текущий статус регистрации
 * 
 * Формат ответа:
 * {
 *   "is_open": true/false,
 *   "updated_at": "2025-01-15 12:30:00",
 *   "updated_by": "admin"
 * }
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Обработка preflight запроса
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config.php';

// Только GET метод
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'error' => 'Method not allowed',
        'message' => 'Используйте GET метод'
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    // Получаем статус регистрации
    $stmt = $pdo->prepare("
        SELECT is_open, updated_at, updated_by 
        FROM registration_settings 
        ORDER BY updated_at DESC 
        LIMIT 1
    ");
    $stmt->execute();
    $settings = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$settings) {
        // Если нет записи - создаём с дефолтными значениями (регистрация открыта)
        $stmt = $pdo->prepare("
            INSERT INTO registration_settings (is_open, updated_by) 
            VALUES (TRUE, 'system')
        ");
        $stmt->execute();
        
        $settings = [
            'is_open' => true,
            'updated_at' => date('Y-m-d H:i:s'),
            'updated_by' => 'system'
        ];
    }
    
    // Возвращаем статус
    echo json_encode([
        'is_open' => (bool)$settings['is_open'],
        'updated_at' => $settings['updated_at'],
        'updated_by' => $settings['updated_by']
    ], JSON_UNESCAPED_UNICODE);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Database error',
        'message' => 'Ошибка при получении статуса регистрации'
    ], JSON_UNESCAPED_UNICODE);
    error_log("Registration status error: " . $e->getMessage());
}
