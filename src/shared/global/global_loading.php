<?php

require_once __DIR__ . '/../../../vendor/autoload.php';

use App\controllers\MenuController;

session_start();
if (!isset($_SESSION['usuario'])) {
    header('Location: /educore/src/app/views/login/login.php');
    exit;
}

$currentPath = basename(dirname($_SERVER['PHP_SELF']));
$idPerfil = $_SESSION['usuario']['idPerfil'];

$menuController = new MenuController();
$menus = $menuController->listarByPerfil($idPerfil);

$pathsPermitidos = [];
if (!empty($menus)) {
    foreach ($menus as $menu) {
        $pathsPermitidos[] = $menu['path_menu'];
    }
}

if (!in_array($currentPath, $pathsPermitidos)) {
    header('Location: /educore/src/app/views/home/home.php');
    exit;
}

include("../../../shared/global/header/header.php");
include("../../../shared/global/sidebar/sidebar.php");
