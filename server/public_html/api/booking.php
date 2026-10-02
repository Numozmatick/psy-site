<?php
declare(strict_types=1);
// PHP 8.2+. Never log contact data or return SMTP diagnostic messages.
ini_set('display_errors', '0');
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');
header('X-Content-Type-Options: nosniff');
function respond(array $body, int $status = 200): never {
    http_response_code($status);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    header('Allow: POST'); respond(['error' => 'method'], 405);
}
$private = dirname(__DIR__, 2) . '/private';
if (!is_file($private . '/mail-config.php')) respond(['error' => 'not_configured'], 503);
$config = require $private . '/mail-config.php';
$expected = rtrim((string)($config['site_url'] ?? ''), '/');
if (!$expected || ($_SERVER['HTTP_ORIGIN'] ?? '') !== $expected) respond(['error' => 'origin'], 403);
if (!str_starts_with(strtolower($_SERVER['CONTENT_TYPE'] ?? ''), 'application/json')) respond(['error' => 'content_type'], 415);
$body = file_get_contents('php://input', false, null, 0, 8193);
if ($body === false || strlen($body) > 8192) respond(['error' => 'too_large'], 413);
try { $raw = json_decode($body, true, 16, JSON_THROW_ON_ERROR); }
catch (Throwable $e) { respond(['error' => 'json'], 400); }
if (!is_array($raw) || array_is_list($raw)) respond(['error' => 'body'], 400);
if (!empty($raw['website'])) respond(['ok' => true, 'demo' => true]);
function value(array $raw, string $key): string { return isset($raw[$key]) && is_string($raw[$key]) ? trim($raw[$key]) : ''; }
function length(string $value): int { return preg_match_all('/./us', $value, $unused) ?: 0; }
$name = value($raw, 'name');
$phone = preg_replace('/\D/', '', value($raw, 'phone'));
if (str_starts_with($phone, '8')) $phone = '7' . substr($phone, 1);
$email = value($raw, 'email'); $time = value($raw, 'time'); $message = value($raw, 'message');
$errors = [];
if (length($name) < 2 || length($name) > 80 || preg_match('/[\r\n]/', $name)) $errors[] = 'name';
if (!preg_match('/^7\d{10}$/D', $phone)) $errors[] = 'phone';
if ($email !== '' && (strlen($email) > 254 || !filter_var($email, FILTER_VALIDATE_EMAIL))) $errors[] = 'email';
if (length($time) > 120) $errors[] = 'time';
if (length($message) > 1000) $errors[] = 'message';
if (($raw['consent'] ?? false) !== true) $errors[] = 'consent';
if ($errors) respond(['error' => 'validation', 'fields' => $errors], 422);
if (($config['enabled'] ?? false) !== true) respond(['ok' => true, 'demo' => true]);
foreach (['smtp_host','smtp_user','smtp_password','mail_from','mail_to'] as $key) {
    if (empty($config[$key])) respond(['error' => 'not_configured'], 503);
}
// Check installation before spending a submission attempt. No private paths exposed.
foreach (['Exception.php', 'PHPMailer.php', 'SMTP.php'] as $library) {
    if (!is_readable($private . '/phpmailer/' . $library)) {
        respond(['error' => 'delivery', 'reason' => 'missing_mail_library'], 503);
    }
}
if (!extension_loaded('openssl') || !function_exists('stream_socket_client') || !function_exists('ctype_alnum')) {
    respond(['error' => 'delivery', 'reason' => 'missing_php_extension'], 503);
}
// One locked file shared by PHP requests, unlike process-local serverless counters.
$storage = $private . '/storage';
if (!is_dir($storage) && !mkdir($storage, 0700, true) && !is_dir($storage)) respond(['error' => 'storage'], 503);
$lock = fopen($storage . '/limits.json', 'c+');
if (!$lock || !flock($lock, LOCK_EX)) respond(['error' => 'storage'], 503);
$state = json_decode(stream_get_contents($lock) ?: '{}', true) ?: [];
$now = time();
$key = hash_hmac('sha256', $_SERVER['REMOTE_ADDR'] ?? 'unknown', $config['rate_secret']);
$state['global'] = array_values(array_filter($state['global'] ?? [], fn($t) => is_int($t) && $t > $now - 3600));
$ips = [];
foreach (($state['ips'] ?? []) as $id => $times) {
    $recent = array_values(array_filter($times, fn($t) => is_int($t) && $t > $now - 900));
    if ($recent) $ips[$id] = $recent;
}
if (count($ips[$key] ?? []) >= 5 || count($state['global']) >= 60) {
    flock($lock, LOCK_UN); fclose($lock); header('Retry-After: 900'); respond(['error' => 'rate_limit'], 429);
}
$ips[$key][] = $now; $state['ips'] = $ips; $state['global'][] = $now;
rewind($lock); ftruncate($lock, 0); fwrite($lock, json_encode($state)); fflush($lock); flock($lock, LOCK_UN); fclose($lock);
try {
    require_once $private . '/phpmailer/Exception.php';
    require_once $private . '/phpmailer/PHPMailer.php';
    require_once $private . '/phpmailer/SMTP.php';
    $mail = new PHPMailer\PHPMailer\PHPMailer(true);
    $mail->isSMTP();
    $mail->Host = $config['smtp_host']; $mail->Port = (int)$config['smtp_port'];
    $mail->SMTPAuth = true; $mail->Username = $config['smtp_user']; $mail->Password = $config['smtp_password'];
    $mail->SMTPSecure = PHPMailer\PHPMailer\PHPMailer::ENCRYPTION_SMTPS;
    $mail->CharSet = 'UTF-8'; $mail->Timeout = 8; $mail->Timelimit = 15; $mail->SMTPDebug = 0;
    $mail->setFrom($config['mail_from'], $config['sender_name']); $mail->addAddress($config['mail_to']);
    if ($email !== '') $mail->addReplyTo($email);
    $mail->Subject = 'Новая заявка на консультацию с сайта';
    $mail->isHTML(false);
    $mail->Body = "Имя: $name\nТелефон: +$phone\nEmail: " . ($email ?: 'не указан') . "\nУдобное время: " . ($time ?: 'не указано') . "\nСообщение: " . ($message ?: 'не указано') . "\n\nСогласие: да\nВерсия согласия: 2026-09-30\nВремя (UTC): " . gmdate('c');
    $mail->send();
    respond(['ok' => true, 'demo' => false]);
} catch (Throwable $e) {
    // Return only a fixed category, never raw SMTP replies, addresses or credentials.
    $detail = strtolower($e->getMessage());
    $reason = 'smtp';
    if (str_contains($detail, 'authenticate')) $reason = 'authentication';
    elseif (str_contains($detail, 'connect')) $reason = 'connection';
    elseif (str_contains($detail, 'from address')) $reason = 'sender';
    elseif (str_contains($detail, 'recipient')) $reason = 'recipient';
    elseif (str_contains($detail, 'data not accepted')) $reason = 'rejected';
    elseif ($e instanceof Error) $reason = 'server_runtime';
    error_log('Booking mail failed: ' . $reason);
    respond(['error' => 'delivery', 'reason' => $reason], 502);
}
