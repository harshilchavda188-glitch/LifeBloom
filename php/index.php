<?php
require_once __DIR__ . '/includes/config.php';

$requestUri = $_SERVER['REQUEST_URI'];
$basePath = '/php';

$path = parse_url($requestUri, PHP_URL_PATH);

if (strpos($path, $basePath) === 0) {
    $path = substr($path, strlen($basePath));
}

$path = '/' . trim($path, '/');

$routes = [
    '/api/users' => __DIR__ . '/api/users.php',
    '/api/tasks' => __DIR__ . '/api/tasks.php',
    '/api/expenses' => __DIR__ . '/api/expenses.php',
    '/api/meals' => __DIR__ . '/api/meals.php',
    '/api/grocery' => __DIR__ . '/api/grocery.php',
    '/api/cleaning' => __DIR__ . '/api/cleaning.php',
    '/api/emergency' => __DIR__ . '/api/emergency.php',
    '/api/water' => __DIR__ . '/api/water.php',
    '/api/mood' => __DIR__ . '/api/mood.php',
    '/api/contact' => __DIR__ . '/api/contact.php',
    '/api/newsletter' => __DIR__ . '/api/newsletter.php',
];

$matched = false;
foreach ($routes as $route => $file) {
    if (strpos($path, $route) === 0) {
        require $file;
        $matched = true;
        break;
    }
}

if (!$matched) {
    jsonResponse([
        'name' => 'LifeBloom API',
        'version' => '1.0.0',
        'endpoints' => array_keys($routes),
    ]);
}
