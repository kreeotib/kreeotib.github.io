<?php
// send_email.php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('X-XSS-Protection: 1; mode=block');

// Проверка метода запроса
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Метод не разрешен']);
    exit;
}

// Базовая защита от CSRF (можно расширить с токенами)
if (!isset($_SERVER['HTTP_REFERER']) || parse_url($_SERVER['HTTP_REFERER'], PHP_URL_HOST) !== $_SERVER['HTTP_HOST']) {
    echo json_encode(['success' => false, 'message' => 'Недопустимый источник запроса']);
    exit;
}

// Проверка honeypot
if (!empty($_POST['honeypot'])) {
    echo json_encode(['success' => false, 'message' => 'Бот обнаружен']);
    exit;
}

// Валидация входных данных
$brand = filter_var(trim($_POST['brand'] ?? ''), FILTER_SANITIZE_STRING);
$model = filter_var(trim($_POST['model'] ?? ''), FILTER_SANITIZE_EMAIL);

// Защита от инъекций в заголовки
if (preg_match('/[\r\n]/', $name) || preg_match('/[\r\n]/', $email)) {
    echo json_encode(['success' => false, 'message' => 'Недопустимые символы']);
    exit;
}

require_once 'mailer/Exception.php';
require_once 'mailer/PHPMailer.php';
require_once 'mailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

try {
    $mail = new PHPMailer(true);

    // Настройки SMTP
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com'; // Замените на ваш SMTP сервер
    $mail->SMTPAuth = true;
    $mail->Username = 'your_email@gmail.com'; // Ваш email
    $mail->Password = 'your_app_password'; // Пароль приложения
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    // Кодировка
    $mail->CharSet = 'UTF-8';

    // Отправитель и получатель
    $mail->setFrom('your_email@gmail.com', 'Website Form');
    $mail->addAddress('recipient@example.com', 'Recipient Name'); // Куда отправлять
    $mail->addReplyTo($email, $name);

    // Тема и содержимое
    $mail->isHTML(true);
    $mail->Subject = 'Новое сообщение с формы от ' . $name;

    $mail->Body = "
        <h3>Новое сообщение с сайта</h3>
        <p><strong>Имя:</strong> " . htmlspecialchars($name) . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($email) . "</p>
        <p><strong>Время отправки:</strong> " . date('Y-m-d H:i:s') . "</p>
    ";

    // Обработка файлов
    $attachedFiles = 0;
    $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxFileSize = 5 * 1024 * 1024; // 5MB
    $totalSize = 0;

    if (!empty($_FILES['images'])) {
        for ($i = 0; $i < count($_FILES['images']['name']); $i++) {
            if ($_FILES['images']['error'][$i] === UPLOAD_ERR_OK) {
                $fileName = $_FILES['images']['name'][$i];
                $fileTmpPath = $_FILES['images']['tmp_name'][$i];
                $fileSize = $_FILES['images']['size'][$i];
                $fileType = $_FILES['images']['type'][$i];

                // Проверка типа файла
                $finfo = finfo_open(FILEINFO_MIME_TYPE);
                $realFileType = finfo_file($finfo, $fileTmpPath);
                finfo_close($finfo);

                if (!in_array($realFileType, $allowedTypes)) {
                    continue;
                }

                // Проверка размера
                if ($fileSize > $maxFileSize) {
                    continue;
                }

                $totalSize += $fileSize;
                if ($totalSize > 25 * 1024 * 1024) { // 25MB общий лимит
                    break;
                }

                // Безопасное имя файла
                $safeFileName = preg_replace('/[^a-zA-Z0-9._-]/', '_', $fileName);

                $mail->addAttachment($fileTmpPath, $safeFileName);
                $attachedFiles++;

                if ($attachedFiles >= 10) {
                    break;
                }
            }
        }
    }

    if ($attachedFiles > 0) {
        $mail->Body .= "<p><strong>Прикреплено файлов:</strong> " . $attachedFiles . "</p>";
    }

    // Отправка
    $mail->send();

    // Логирование успешной отправки
    error_log("Email sent successfully from: " . $email . " (" . $name . ")");

    echo json_encode([
        'success' => true,
        'message' => 'Письмо отправлено успешно',
        'files_attached' => $attachedFiles
    ]);

} catch (Exception $e) {
    // Логирование ошибки
    error_log("PHPMailer Error: " . $mail->ErrorInfo);

    echo json_encode([
        'success' => false,
        'message' => 'Ошибка при отправке письма'
    ]);
}
?>