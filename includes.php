<?php
declare(strict_types=1);
require_once __DIR__ . '/config/config.php';
session_name('LAMPSESS'); session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']); session_start();
function db(): PDO {
    static $pdo = null;
    return $pdo ??= new PDO(sprintf('mysql:host=%s;port=%s;dbname=%s;charset=utf8mb4', DB_HOST, DB_PORT, DB_NAME), DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]);
}
function csrf(): string { return $_SESSION['csrf'] ??= bin2hex(random_bytes(16)); }
function visitor_id(): string { return $_SESSION['vid'] ??= bin2hex(random_bytes(8)); }
function json_out(array $d, int $c = 200): never { http_response_code($c); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
function e(?string $s): string { return htmlspecialchars((string) $s, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
