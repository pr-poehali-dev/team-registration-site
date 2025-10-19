<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Admin-Token');

// Handle OPTIONS for CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Database connection
require_once __DIR__ . '/../config/database.php';

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $resource = $_GET['resource'] ?? null;
        $captain_telegram = $_GET['captain_telegram'] ?? null;
        $auth_code = $_GET['auth_code'] ?? null;
        
        // Export teams to CSV
        if ($resource === 'export') {
            $stmt = $pdo->query("
                SELECT team_name, captain_name, captain_telegram, 
                       members_info, status, created_at
                FROM teams 
                ORDER BY created_at DESC
            ");
            $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            $csv_lines = ['Team Name,Captain Name,Captain Telegram,Status,Created At,Members Info'];
            
            foreach ($teams as $team) {
                $members_clean = str_replace(["\n", ','], [' | ', ';'], $team['members_info']);
                $csv_lines[] = sprintf(
                    '"%s","%s","%s","%s","%s","%s"',
                    $team['team_name'],
                    $team['captain_name'],
                    $team['captain_telegram'],
                    $team['status'],
                    $team['created_at'],
                    $members_clean
                );
            }
            
            echo json_encode([
                'success' => true,
                'csv' => implode("\n", $csv_lines),
                'total' => count($teams)
            ]);
            exit;
        }
        
        // Get matches
        if ($resource === 'matches') {
            $stmt = $pdo->query("
                SELECT 
                    m.id, m.match_number, m.bracket_type, m.round_number,
                    m.team1_id, m.team2_id, m.team1_placeholder, m.team2_placeholder,
                    m.score1, m.score2, m.winner, m.status, m.scheduled_time,
                    t1.team_name as team1_name, t2.team_name as team2_name
                FROM matches m
                LEFT JOIN teams t1 ON m.team1_id = t1.id
                LEFT JOIN teams t2 ON m.team2_id = t2.id
                ORDER BY m.bracket_type, m.round_number, m.match_number
            ");
            $matches = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'success' => true,
                'matches' => $matches
            ]);
            exit;
        }
        
        // Find by auth code
        if ($auth_code) {
            $code_clean = strtoupper(str_replace('-', '', trim($auth_code)));
            
            $stmt = $pdo->prepare("
                SELECT id, team_name, captain_name, captain_telegram, 
                       members_count, members_info, status, admin_comment, 
                       created_at, auth_code
                FROM teams 
                WHERE UPPER(REPLACE(auth_code, '-', '')) = ?
            ");
            $stmt->execute([$code_clean]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode([
                'team' => $team ?: null,
                'success' => $team !== false
            ]);
            exit;
        }
        
        // Find by captain telegram (legacy)
        if ($captain_telegram) {
            $stmt = $pdo->prepare("
                SELECT id, team_name, captain_name, captain_telegram, 
                       members_count, members_info, status, admin_comment, 
                       created_at, auth_code
                FROM teams 
                WHERE captain_telegram = ?
            ");
            $stmt->execute([$captain_telegram]);
            $team = $stmt->fetch(PDO::FETCH_ASSOC);
            
            echo json_encode(['team' => $team ?: null]);
            exit;
        }
        
        // Get all teams
        $stmt = $pdo->query("
            SELECT id, team_name, captain_name, captain_telegram, 
                   members_count, members_info, status, admin_comment, 
                   created_at
            FROM teams 
            ORDER BY created_at DESC
        ");
        $teams = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode(['teams' => $teams]);
        
    } elseif ($method === 'POST') {
        $input = json_decode(file_get_contents('php://input'), true);
        $resource = $input['resource'] ?? null;
        
        // Create new team
        if (!$resource) {
            $auth_code = 'REG-' . strtoupper(substr(md5(rand()), 0, 4)) . '-' . strtoupper(substr(md5(rand()), 0, 4));
            
            $stmt = $pdo->prepare("
                INSERT INTO teams 
                (team_name, captain_name, captain_email, captain_phone, captain_telegram, 
                 members_count, members_info, auth_code, status, current_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'waiting')
            ");
            
            $stmt->execute([
                $input['team_name'],
                $input['captain_name'],
                $input['captain_email'] ?? '',
                $input['captain_phone'] ?? null,
                $input['captain_telegram'] ?? null,
                $input['members_count'],
                $input['members_info'] ?? null,
                $auth_code
            ]);
            
            $team_id = $pdo->lastInsertId();
            
            echo json_encode([
                'success' => true,
                'team_id' => $team_id,
                'auth_code' => $auth_code,
                'message' => 'Team registered successfully'
            ]);
            exit;
        }
        
    } elseif ($method === 'PUT' || $method === 'PATCH') {
        $input = json_decode(file_get_contents('php://input'), true);
        $team_id = $input['id'] ?? null;
        
        if (!$team_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Team ID required']);
            exit;
        }
        
        // Update team status
        if (isset($input['status'])) {
            $stmt = $pdo->prepare("
                UPDATE teams 
                SET status = ?, admin_comment = ?, updated_at = NOW()
                WHERE id = ?
            ");
            $stmt->execute([
                $input['status'],
                $input['admin_comment'] ?? null,
                $team_id
            ]);
            
            echo json_encode([
                'success' => true,
                'message' => 'Team status updated'
            ]);
            exit;
        }
        
        // Update team info
        $stmt = $pdo->prepare("
            UPDATE teams 
            SET team_name = ?, captain_name = ?, captain_telegram = ?, 
                members_info = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([
            $input['team_name'],
            $input['captain_name'],
            $input['captain_telegram'],
            $input['members_info'],
            $team_id
        ]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Team updated successfully'
        ]);
        
    } elseif ($method === 'DELETE') {
        $input = json_decode(file_get_contents('php://input'), true);
        $team_id = $input['id'] ?? $_GET['id'] ?? null;
        
        if (!$team_id) {
            http_response_code(400);
            echo json_encode(['error' => 'Team ID required']);
            exit;
        }
        
        $stmt = $pdo->prepare("DELETE FROM teams WHERE id = ?");
        $stmt->execute([$team_id]);
        
        echo json_encode([
            'success' => true,
            'message' => 'Team deleted successfully'
        ]);
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Server error',
        'message' => $e->getMessage()
    ]);
}
