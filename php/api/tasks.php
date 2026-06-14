<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC");
            $stmt->execute([$userId]);
            jsonResponse($stmt->fetchAll());
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
        $data = jsonInput();
        if (empty($data['title'])) jsonResponse(['error' => 'title required'], 400);
        $id = generateUUID();
        $stmt = $pdo->prepare(
            "INSERT INTO tasks (id, user_id, title, category, completed, due_date, due_time, recurring, priority)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['user_id'] ?? null,
            $data['title'],
            $data['category'] ?? 'personal',
            $data['completed'] ?? false,
            $data['due_date'] ?? null,
            $data['due_time'] ?? null,
            $data['recurring'] ?? 'none',
            $data['priority'] ?? 'medium',
        ]);
        jsonResponse(['id' => $id, 'message' => 'Task created'], 201);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $data = jsonInput();
        $fields = [];
        $params = [];
        foreach (['title', 'category', 'completed', 'due_date', 'due_time', 'recurring', 'priority'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if (empty($fields)) jsonResponse(['error' => 'no fields to update'], 400);
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE tasks SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        jsonResponse(['message' => 'Task updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $stmt = $pdo->prepare("DELETE FROM tasks WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Task deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
