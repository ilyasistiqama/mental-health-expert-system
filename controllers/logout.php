<?php

require __DIR__ . '/../lib/bantu.php';

$_SESSION = [];
setcookie(session_name(), '', ['expires' => time() - 3600, 'path' => '/']);
session_destroy();

header("location:../index.php");
exit;
