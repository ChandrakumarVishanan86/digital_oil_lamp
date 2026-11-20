<?php
declare(strict_types=1);
require_once __DIR__ . '/includes.php';
try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $rows = db()->query('SELECT id, name, wish, lit_at, TIMESTAMPDIFF(MINUTE, lit_at, NOW()) AS age_min FROM lamps WHERE lit_at > NOW() - INTERVAL ' . (int) LAMP_LIFE_HOURS . ' HOUR ORDER BY id DESC LIMIT 60')->fetchAll();
        $total = (int) db()->query('SELECT COUNT(*) FROM lamps')->fetchColumn();
        json_out(['success' => true, 'lamps' => $rows, 'total' => $total, 'life_min' => LAMP_LIFE_HOURS * 60]);
    }
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') { json_out(['success' => false, 'message' => 'Method not allowed.'], 405); }
    $in = json_decode((string) file_get_contents('php://input'), true) ?: $_POST;
    if (!hash_equals(csrf(), (string) ($_SERVER['HTTP_X_CSRF_TOKEN'] ?? ($in['csrf'] ?? '')))) { json_out(['success' => false, 'message' => 'Session expired. Please refresh the page.'], 403); }
    $name = trim(preg_replace('/\s+/u', ' ', (string) ($in['name'] ?? '')));
    $wish = trim(preg_replace('/\s+/u', ' ', (string) ($in['wish'] ?? '')));
    if ($name === '' || mb_strlen($name) < 2) { json_out(['success' => false, 'message' => 'Please enter your name (at least 2 letters).'], 422); }
    if (mb_strlen($name) > 40 || !preg_match('/^[\p{L}\p{M}][\p{L}\p{M} .\'\-]*$/u', $name)) { json_out(['success' => false, 'message' => 'Name can have letters only (max 40).'], 422); }
    if (mb_strlen($wish) > 120) { json_out(['success' => false, 'message' => 'Wish is too long (max 120).'], 422); }
    if (($in['held_ms'] ?? 0) < HOLD_MS - 300) { json_out(['success' => false, 'message' => 'Keep your finger on the scanner a little longer.'], 422); }
    $vid = visitor_id();
    $c = db()->prepare('SELECT COUNT(*) FROM lamps WHERE visitor = :v AND lit_at > NOW() - INTERVAL 1 HOUR'); $c->execute([':v' => $vid]);
    if ((int) $c->fetchColumn() >= MAX_LAMPS_PER_HOUR) { json_out(['success' => false, 'message' => 'You have lit many lamps already. Please come back later 🙏'], 429); }
    $d = db()->prepare('SELECT 1 FROM lamps WHERE visitor = :v AND LOWER(name) = LOWER(:n) AND lit_at > NOW() - INTERVAL 1 MINUTE LIMIT 1'); $d->execute([':v' => $vid, ':n' => $name]);
    if ($d->fetchColumn()) { json_out(['success' => false, 'message' => 'This lamp is already burning.'], 409); }
    db()->prepare('INSERT INTO lamps (name, wish, visitor) VALUES (:n, :w, :v)')->execute([':n' => $name, ':w' => $wish ?: null, ':v' => $vid]);
    json_out(['success' => true, 'id' => (int) db()->lastInsertId(), 'name' => $name, 'message' => "Your lamp is lit, $name 🪔"]);
} catch (Throwable $e) {
    json_out(['success' => false, 'message' => APP_DEBUG ? $e->getMessage() : 'Something went wrong. Please try again.'], 500);
}
