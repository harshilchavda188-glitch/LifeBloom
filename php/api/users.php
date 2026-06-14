<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();

switch ($method) {
    case 'POST':
        $data = jsonInput();
        $action = $_GET['action'] ?? 'register';

        if ($action === 'register') {
            if (empty($data['username']) || empty($data['password'])) {
                jsonResponse(['error' => 'username and password required'], 400);
            }
            $stmt = $pdo->prepare("SELECT id FROM users WHERE username = ?");
            $stmt->execute([$data['username']]);
            if ($stmt->fetch()) {
                jsonResponse(['error' => 'Username already exists'], 409);
            }
            $id = generateUUID();
            $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
            $stmt = $pdo->prepare("INSERT INTO users (id, username, password) VALUES (?, ?, ?)");
            $stmt->execute([$id, $data['username'], $hashed]);
            jsonResponse(['id' => $id, 'username' => $data['username'], 'message' => 'User registered'], 201);
        }

        if ($action === 'login') {
            if (empty($data['username']) || empty($data['password'])) {
                jsonResponse(['error' => 'username and password required'], 400);
            }
            $stmt = $pdo->prepare("SELECT * FROM users WHERE username = ?");
            $stmt->execute([$data['username']]);
            $user = $stmt->fetch();
            if (!$user || !password_verify($data['password'], $user['password'])) {
                jsonResponse(['error' => 'Invalid credentials'], 401);
            }
            jsonResponse(['id' => $user['id'], 'username' => $user['username'], 'message' => 'Login successful']);
        }

        jsonResponse(['error' => 'Invalid action'], 400);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
