<?php

namespace App\routes;

require_once __DIR__ . '/../../../vendor/autoload.php';

use App\controllers\MenuController;

class MenuRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new MenuController();
    }

    public function routeMethod($op)
    {
        switch ($op) {
            case 'listar':
                $rspta = $this->controller->Listar();
                $arrayResponse = empty($rspta)
                    ? ['status' => false, 'msg' => 'Datos no encontrados']
                    : ['status' => true, 'data' => $rspta];
                echo json_encode($arrayResponse);
                break;

            case 'listarByPerfil':
                if ($_POST) {
                    $id = intval($_POST['id']);
                    $rspta = $this->controller->listarByPerfil($id);
                    $arrayResponse = empty($rspta)
                        ? ['status' => false, 'msg' => 'Datos no encontrados']
                        : ['status' => true, 'data' => $rspta];
                    echo json_encode($arrayResponse);
                }
                break;

            default:
                echo json_encode(['status' => false, 'msg' => 'Operación no válida']);
                break;
        }
    }
}

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    $route = new MenuRoutes();
    $op = $_REQUEST["op"];
    $route->routeMethod($op);
}
