<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM emergency_contacts WHERE user_id = ? ORDER BY name");
            $stmt->execute([$userId]);
            jsonResponse($stmt->fetchAll());
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
        $data = jsonInput();
        if (empty($data['name']) || empty($data['phone'])) {
            jsonResponse(['error' => 'name and phone required'], 400);
        }
        $id = generateUUID();
        $stmt = $pdo->prepare(
            "INSERT INTO emergency_contacts (id, user_id, name, phone, relationship) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$id, $data['user_id'] ?? null, $data['name'], $data['phone'], $data['relationship'] ?? '']);
        jsonResponse(['id' => $id, 'message' => 'Contact added'], 201);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $stmt = $pdo->prepare("DELETE FROM emergency_contacts WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Contact deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
