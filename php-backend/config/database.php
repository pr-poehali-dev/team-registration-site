<?php
// Database configuration for Timeweb MySQL

$db_host = 'localhost';
$db_name = 'ce876244_dkdl';  // Замени на свое имя БД
$db_user = 'ce876244_dkdl';  // Замени на своего пользователя
$db_pass = 'YOUR_PASSWORD';   // Замени на свой пароль

try {
    $pdo = new PDO(
        "mysql:host=$db_host;dbname=$db_name;charset=utf8mb4",
        $db_user,
        $db_pass,
        [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false
        ]
    );
} catch (PDOException $e) {
    http_response_code(500);
    die(json_encode(['error' => 'Database connection failed']));
}
