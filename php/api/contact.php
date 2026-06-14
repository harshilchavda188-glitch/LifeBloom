<?php
require_once __DIR__ . '/../includes/config.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    jsonResponse(['error' => 'Method not allowed'], 405);
}

$pdo = getDB();
$data = jsonInput();

if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
    jsonResponse(['error' => 'All fields are required'], 400);
}

$stmt = $pdo->prepare("INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)");
$stmt->execute([$data['name'], $data['email'], $data['message']]);

jsonResponse(['success' => true, 'message' => 'Thank you for reaching out!']);
