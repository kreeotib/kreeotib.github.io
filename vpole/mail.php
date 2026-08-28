<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

try {
    $mail = new PHPMailer(true);

    $mail->isSMTP();
    $mail->Host       = 'smtp.mail.ru';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'send.test123@mail.ru';
    $mail->Password   = 'PNgtciF7MflSKWPqMVl2';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('hello@vpole.camp', 'Vpole');
    $mail->addAddress('hello@vpole.camp');

    $mail->isHTML(true);
    $mail->Subject = 'Новая заявка с сайта';

    $body = '';
    foreach ($_POST as $key => $value) {
        $key   = htmlspecialchars($key, ENT_QUOTES, 'UTF-8');
        $value = htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
        $body .= "<b>{$key}:</b> {$value}<br>";
    }

    $mail->Body = $body;

    $mail->send();

    echo json_encode(['success' => true]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}