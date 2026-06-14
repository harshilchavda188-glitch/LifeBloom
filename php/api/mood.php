<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM mood_entries WHERE user_id = ? ORDER BY entry_date DESC");
            $stmt->execute([$userId]);
            jsonResponse($stmt->fetchAll());
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
        $data = jsonInput();
        if (!isset($data['mood']) || $data['mood'] < 1 || $data['mood'] > 5) {
            jsonResponse(['error' => 'mood (1-5) required'], 400);
        }
        $id = generateUUID();
        $stmt = $pdo->prepare(
            "INSERT INTO mood_entries (id, user_id, mood, note, entry_date) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$id, $data['user_id'] ?? null, $data['mood'], $data['note'] ?? '', $data['entry_date'] ?? date('Y-m-d')]);
        jsonResponse(['id' => $id, 'message' => 'Mood logged'], 201);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
