<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);

$USE_SMTP   = true;
$SMTP_HOST  = 'smtp.mail.ru';
$SMTP_PORT  = 465;
$SMTP_USER  = 'send.test123@mail.ru';
$SMTP_PASS  = 'PNgtciF7MflSKWPqMVl2';
$SMTP_SEC   = 'ssl';

$TO_EMAIL    = 'akcent.agency@yandex.ru';
$TO_NAME    = 'Service Manager';

$FROM_EMAIL = 'send.test123@mail.ru';
$FROM_NAME  = 'Website';

require_once 'mailer/Exception.php';
require_once 'mailer/PHPMailer.php';
require_once 'mailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

function fail($message, $httpCode = 400) {
    http_response_code($httpCode);
    echo json_encode(['ok' => false, 'error' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

try {

    $brand   = trim((string)($_POST['brand']   ?? ''));
    $model   = trim((string)($_POST['model']   ?? ''));
    $name    = trim((string)($_POST['name']    ?? $_POST['name-oil']  ?? ''));
    $phone   = trim((string)($_POST['phone']   ?? $_POST['phone-oil'] ?? ''));
    $comment = trim((string)($_POST['comment'] ?? ''));

    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';

    if ($USE_SMTP) {
        $mail->isSMTP();
        $mail->Host       = $SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = $SMTP_USER;
        $mail->Password   = $SMTP_PASS;
        $mail->SMTPSecure = $SMTP_SEC;
        $mail->Port       = $SMTP_PORT;
    }

    $mail->setFrom($FROM_EMAIL, $FROM_NAME);
    $mail->addAddress($TO_EMAIL, $TO_NAME);

    $subjectParts = [];
    if ($brand || $model) $subjectParts[] = trim($brand . ' ' . $model);
    $subjectParts[] = 'Заявка с сайта';
    $mail->Subject = implode(' — ', $subjectParts);

    $rows = [
        'Марка авто'        => $brand,
        'Модель авто'       => $model,
        'Имя'               => $name,
        'Телефон'           => $phone,
        'Комментарий'       => $comment,
        'Дата/время'        => date('Y-m-d H:i:s')
    ];

    $html  = '<h3>Новая заявка с сайта</h3>';
    $html .= '<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">';
    foreach ($rows as $k => $v) {
        if ($v === '') continue;
        $html .= '<tr><td><strong>' . htmlspecialchars($k, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8') .
                 '</strong></td><td>' . nl2br(htmlspecialchars($v, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8')) . '</td></tr>';
    }
    $html .= '</table>';

    $mail->isHTML(true);
    $mail->Body = $html;

    if (!empty($_FILES['images']['name'])) {
        $names = $_FILES['images']['name'];
        $tmps  = $_FILES['images']['tmp_name'];
        $errs  = $_FILES['images']['error'];
        $types = $_FILES['images']['type'];

        if (is_array($names)) {
            foreach ($names as $i => $name) {
                if (($errs[$i] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK && is_uploaded_file($tmps[$i])) {
                    $mail->addAttachment($tmps[$i], $name);
                }
            }
        } elseif (($errs ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_OK && is_uploaded_file($tmps)) {
            $mail->addAttachment($tmps, $names);
        }
    }

    if (!$mail->send()) {
        fail('Не удалось отправить письмо. ' . $mail->ErrorInfo, 500);
    }

    echo json_encode(['ok' => true], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    fail('Серверная ошибка: ' . $e->getMessage(), 500);
}
