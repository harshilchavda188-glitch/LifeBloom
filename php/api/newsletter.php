<?php
require_once __DIR__ . '/../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$pdo = getDB();
$data = jsonInput();

if (empty($data['email'])) {
    jsonResponse(['error' => 'Email is required'], 400);
}

try {
    $stmt = $pdo->prepare("INSERT INTO newsletter_subscribers (email) VALUES (?)");
    $stmt->execute([$data['email']]);
    jsonResponse(['success' => true, 'message' => 'Successfully joined the newsletter!']);
} catch (PDOException $e) {
    if ($e->getCode() == 23000) {
        jsonResponse(['error' => 'Email already subscribed'], 409);
    }
    jsonResponse(['error' => 'Subscription failed'], 500);
}
