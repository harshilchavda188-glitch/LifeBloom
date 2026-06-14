<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM expenses WHERE user_id = ? ORDER BY date DESC");
            $stmt->execute([$userId]);
            jsonResponse($stmt->fetchAll());
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
        $data = jsonInput();
        if (empty($data['title']) || !isset($data['amount'])) {
            jsonResponse(['error' => 'title and amount required'], 400);
        }
        $id = generateUUID();
        $stmt = $pdo->prepare(
            "INSERT INTO expenses (id, user_id, title, amount, category, type, status, date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['user_id'] ?? null,
            $data['title'],
            $data['amount'],
            $data['category'] ?? 'general',
            $data['type'] ?? 'expense',
            $data['status'] ?? 'completed',
            $data['date'] ?? date('Y-m-d'),
        ]);
        jsonResponse(['id' => $id, 'message' => 'Expense created'], 201);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $data = jsonInput();
        $fields = [];
        $params = [];
        foreach (['title', 'amount', 'category', 'type', 'status', 'date'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if (empty($fields)) jsonResponse(['error' => 'no fields to update'], 400);
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE expenses SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        jsonResponse(['message' => 'Expense updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $stmt = $pdo->prepare("DELETE FROM expenses WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Expense deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
