<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}
   $mail = new PHPMailer(true);
try {


    $mail->isSMTP();
    $mail->Host       = 'smtp.timeweb.ru';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'zayavka@cl270182.tw1.ru';
    $mail->Password   = 'uwPWO0eo1puW53';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = 465;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom('zayavka@cl270182.tw1.ru', 'Vpole');
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