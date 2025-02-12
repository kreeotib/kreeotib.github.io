<?php
error_reporting(E_ALL);
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

require 'mailer/PHPMailer.php';
require 'mailer/SMTP.php';
require 'mailer/Exception.php';

$dataArray = $_POST;
$resultStr = '';
foreach($dataArray as $key => $value){
    $resultStr .= "<b>".$key."</b>: ".$value."<br>";
};

// 3HW5eFdt
$mail = new PHPMailer(true);

try {
    //Server settings
    $mail->SMTPDebug = SMTP::DEBUG_SERVER;                      //Enable verbose debug output
    $mail->isSMTP();                                            //Send using SMTP
    $mail->Host       = 'smtp.mail.ru';                     //Set the SMTP server to send through
    $mail->SMTPAuth   = true;                                   //Enable SMTP authentication
    $mail->Username   = 'send.test123@mail.ru';                     //SMTP username
    $mail->Password   = 'xx1DGFkFi5HVBEdWxd91';                               //SMTP password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;            //Enable implicit TLS encryption
    $mail->Port       = 465;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

    //Recipients
    $mail->setFrom('send.test123@mail.ru', 'Form');
    $mail->addAddress('mr.smirnov.maksim@mail.ru');     //Add a recipient

    //Attachments

    //Content
    $mail->CharSet = 'UTF-8'; // Set character encoding to UTF-8
    $mail->isHTML(true); // Set email format to HTML
    $mail->Subject = 'keibai';
    $mail->Body    = $resultStr;

    $mail->send();
    echo 'Message has been sent';
} catch (Exception $e) {
    echo "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
}