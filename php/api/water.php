<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $date = $_GET['date'] ?? date('Y-m-d');
            $stmt = $pdo->prepare("SELECT * FROM water_logs WHERE user_id = ? AND log_date = ?");
            $stmt->execute([$userId, $date]);
            $log = $stmt->fetch();
            if (!$log) {
                jsonResponse(['date' => $date, 'glasses' => 0]);
            }
            jsonResponse($log);
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
    case 'PUT':
        $data = jsonInput();
        if (empty($data['user_id'])) jsonResponse(['error' => 'user_id required'], 400);
        $date = $data['date'] ?? date('Y-m-d');
        $glasses = $data['glasses'] ?? 0;

        $stmt = $pdo->prepare("SELECT id FROM water_logs WHERE user_id = ? AND log_date = ?");
        $stmt->execute([$data['user_id'], $date]);
        $existing = $stmt->fetch();

        if ($existing) {
            $stmt = $pdo->prepare("UPDATE water_logs SET glasses = ? WHERE id = ?");
            $stmt->execute([$glasses, $existing['id']]);
        } else {
            $stmt = $pdo->prepare("INSERT INTO water_logs (user_id, log_date, glasses) VALUES (?, ?, ?)");
            $stmt->execute([$data['user_id'], $date, $glasses]);
        }
        jsonResponse(['message' => 'Water log updated', 'date' => $date, 'glasses' => $glasses]);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
