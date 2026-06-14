<?php
require_once __DIR__ . '/../includes/config.php';

$method = $_SERVER['REQUEST_METHOD'];
$pdo = getDB();
$userId = $_GET['user_id'] ?? '';

switch ($method) {
    case 'GET':
        if ($userId) {
            $day = $_GET['day'] ?? '';
            if ($day) {
                $stmt = $pdo->prepare("SELECT * FROM meals WHERE user_id = ? AND day = ? ORDER BY FIELD(meal_type, 'breakfast', 'lunch', 'dinner', 'snack')");
                $stmt->execute([$userId, $day]);
            } else {
                $stmt = $pdo->prepare("SELECT * FROM meals WHERE user_id = ? ORDER BY day DESC");
                $stmt->execute([$userId]);
            }
            jsonResponse($stmt->fetchAll());
        }
        jsonResponse(['error' => 'user_id required'], 400);
        break;

    case 'POST':
        $data = jsonInput();
        if (empty($data['name']) || empty($data['meal_type']) || empty($data['day'])) {
            jsonResponse(['error' => 'name, meal_type, and day required'], 400);
        }
        $id = generateUUID();
        $ingredients = isset($data['ingredients']) ? json_encode($data['ingredients']) : '[]';
        $stmt = $pdo->prepare(
            "INSERT INTO meals (id, user_id, day, meal_type, name, ingredients) VALUES (?, ?, ?, ?, ?, ?)"
        );
        $stmt->execute([$id, $data['user_id'] ?? null, $data['day'], $data['meal_type'], $data['name'], $ingredients]);
        jsonResponse(['id' => $id, 'message' => 'Meal created'], 201);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? '';
        if (!$id) jsonResponse(['error' => 'id required'], 400);
        $stmt = $pdo->prepare("DELETE FROM meals WHERE id = ?");
        $stmt->execute([$id]);
        jsonResponse(['message' => 'Meal deleted']);
        break;

    default:
        jsonResponse(['error' => 'Method not allowed'], 405);
}
