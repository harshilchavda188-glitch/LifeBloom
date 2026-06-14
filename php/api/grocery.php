<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM grocery_items WHERE user_id = ? ORDER BY category, name");
            $stmt->execute([$userId]);
            jsonResponse($stmt->fetchAll());
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
        $data = jsonInput();
        if (empty($data['name'])) jsonResponse(['error' => 'name required'], 400);
        $id = generateUUID();
        $stmt = $pdo->prepare(
            "INSERT INTO grocery_items (id, user_id, name, checked, category) VALUES (?, ?, ?, ?, ?)"
        );
        $stmt->execute([$id, $data['user_id'] ?? null, $data['name'], $data['checked'] ?? false, $data['category'] ?? 'general']);
        jsonResponse(['id' => $id, 'message' => 'Item added'], 201);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $data = jsonInput();
        $fields = [];
        $params = [];
        foreach (['name', 'checked', 'category'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if (empty($fields)) jsonResponse(['error' => 'no fields to update'], 400);
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE grocery_items SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        jsonResponse(['message' => 'Item updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $stmt = $pdo->prepare("DELETE FROM grocery_items WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Item deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
