<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Подключение к БД
$host = 'localhost';
$dbname = 'ce876244_tournam';
$username = 'ce876244_tournam';
$password = 'kh5-XQi-EWE-9gS';

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];

// Обработка PATCH как PUT
if ($method === 'PATCH') {
    $method = 'PUT';
}

// GET - получить команды или найти по коду
if ($method === 'GET') {
    $resource = $_GET['resource'] ?? null;
    $auth_code = $_GET['auth_code'] ?? null;
    
    if ($resource === 'settings') {
        $stmt = $pdo->query("SELECT is_open FROM registration_settings WHERE id = 1");
        $settings = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['is_open' => (bool)$settings['is_open']]);
        exit;
    }
    
    if ($resource === 'matches') {
        $stmt = $pdo->query("
            SELECT m.*, t1.team_name as team1_name, t2.team_name as team2_name
            FROM matches m
            LEFT JOIN teams t1 ON m.team1_id = t1.id
            LEFT JOIN teams t2 ON m.team2_id = t2.id
            ORDER BY m.bracket_type, m.round_number, m.match_number
        ");
        $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
        echo json_encode(['success' => true, 'matches' => $matches]);
        exit;
    }
    
    if ($auth_code) {
        $code_clean = strtoupper(str_replace('-', '', trim($auth_code)));
        $stmt = $pdo->prepare("SELECT * FROM teams WHERE UPPER(REPLACE(auth_code, '-', '')) = ?");
        $stmt->execute([$code_clean]);
        $team = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['team' => $team, 'success' => $team !== false]);
        exit;
    }
    
    $stmt = $pdo->query("SELECT * FROM teams ORDER BY created_at DESC");
    $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo json_encode(['teams' => $teams]);
}

// POST - создать команду или выполнить действие
elseif ($method === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    $resource = $data['resource'] ?? null;
    
    if ($resource === 'auth') {
        $username = $data['username'] ?? '';
        $password = $data['password'] ?? '';
        
        $stmt = $pdo->prepare("SELECT * FROM admin_users WHERE username = ?");
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && hash('sha256', $password) === $user['password_hash']) {
            echo json_encode([
                'success' => true,
                'username' => $user['username'],
                'is_superadmin' => (bool)$user['is_superadmin']
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['success' => false, 'error' => 'Неверный логин или пароль']);
        }
        exit;
    }
    
    if ($resource === 'settings') {
        $is_open = $data['is_open'] ? 1 : 0;
        $stmt = $pdo->prepare("UPDATE registration_settings SET is_open = ? WHERE id = 1");
        $stmt->execute([$is_open]);
        echo json_encode(['success' => true]);
        exit;
    }
    
    // Создать команду
    $auth_code = strtoupper(substr(md5(uniqid(rand(), true)), 0, 4) . '-' . substr(md5(uniqid(rand(), true)), 0, 4));
    
    $stmt = $pdo->prepare("
        INSERT INTO teams (team_name, captain_name, captain_telegram, members_count, members_info, auth_code, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
    ");
    $stmt->execute([
        $data['team_name'],
        $data['captain_name'],
        $data['captain_telegram'],
        $data['members_count'],
        $data['members_info'],
        $auth_code
    ]);
    
    $team_id = $pdo->lastInsertId();
    
    // Отправить код регистрации капитану в Telegram
    $bot_token = '8008657360:AAGUdeZTn_s0YMfB7LjQHSKd0cGXnt5yxds';
    $notify_url = 'https://ce876244.tw1.ru/php-backend/api/notify-captain.php';
    
    $notify_data = [
        'team_id' => $team_id,
        'action' => 'send_auth_code'
    ];
    
    $options = [
        'http' => [
            'header'  => "Content-type: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($notify_data),
            'timeout' => 5
        ]
    ];
    
    $context = stream_context_create($options);
    @file_get_contents($notify_url, false, $context);
    
    echo json_encode(['success' => true, 'auth_code' => $auth_code, 'team_id' => $team_id]);
}

// PUT - обновить команду или статус
elseif ($method === 'PUT') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    if (isset($data['status'])) {
        $stmt = $pdo->prepare("UPDATE teams SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);
        echo json_encode(['success' => true]);
    } else {
        // Автоматически подсчитать количество участников
        $members_count = count(array_filter(explode("\n", $data['members_info'])));
        
        $stmt = $pdo->prepare("
            UPDATE teams SET team_name = ?, captain_name = ?, captain_telegram = ?, 
                   members_count = ?, members_info = ?
            WHERE id = ?
        ");
        $stmt->execute([
            $data['team_name'],
            $data['captain_name'],
            $data['captain_telegram'],
            $members_count,
            $data['members_info'],
            $data['id']
        ]);
        echo json_encode(['success' => true]);
    }
}

// DELETE - удалить команду
elseif ($method === 'DELETE') {
    $id = $_GET['id'] ?? null;
    if ($id) {
        $stmt = $pdo->prepare("DELETE FROM teams WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true]);
    }
}
?>