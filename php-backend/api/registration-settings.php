<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $stmt = $pdo->query("
            SELECT is_open, updated_at, updated_by
            FROM registration_settings 
            ORDER BY id DESC LIMIT 1
        ");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'is_open' => $settings ? (bool)$settings['is_open'] : true
        ]);
        
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $is_open = $input['is_open'] ?? true;
        $updated_by = $input['updated_by'] ?? 'admin';
        
        $stmt = $pdo->prepare("
            INSERT INTO registration_settings (is_open, updated_by)
            VALUES (?, ?)
        ");
        $stmt->execute([$is_open, $updated_by]);
        
        echo json_encode([
            'message' => 'Registration status updated',
            'is_open' => $is_open
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
