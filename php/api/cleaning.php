<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $stmt = $pdo->prepare("SELECT * FROM cleaning_tasks WHERE user_id = ? ORDER BY next_due ASC");
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
            "INSERT INTO cleaning_tasks (id, user_id, title, room, frequency, last_done, next_due)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([
            $id,
            $data['user_id'] ?? null,
            $data['title'],
            $data['room'] ?? 'general',
            $data['frequency'] ?? 'weekly',
            $data['last_done'] ?? null,
            $data['next_due'] ?? date('Y-m-d'),
        ]);
        jsonResponse(['id' => $id, 'message' => 'Cleaning task created'], 201);
        break;

    case 'PUT':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $data = jsonInput();
        $fields = [];
        $params = [];
        foreach (['title', 'room', 'frequency', 'last_done', 'next_due'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if (empty($fields)) jsonResponse(['error' => 'no fields to update'], 400);
        $params[] = $id;
        $stmt = $pdo->prepare("UPDATE cleaning_tasks SET " . implode(', ', $fields) . " WHERE id = ?");
        $stmt->execute($params);
        jsonResponse(['message' => 'Cleaning task updated']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $stmt = $pdo->prepare("DELETE FROM cleaning_tasks WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Cleaning task deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
