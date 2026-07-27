<?php

namespace App\routes;

require_once __DIR__ . '/../../../vendor/autoload.php';

use App\controllers\CalendarioController;

class CalendarioRoutes
{
    private CalendarioController $controller;
    public function __construct()
    {
        $this->controller = new CalendarioController;
    }

    public function routeMethod($op)
    {
        switch ($op) {
            case 'listar':
                $rspta = $this->controller->Listar();
                $arrayResponse = $rspta ? array(
                    'status' => true,
                    'data' => $rspta
                ) : array(
                    'status' => false,
                    'msg' => 'Datos no encontrados'
                );
                echo json_encode($arrayResponse);
                break;
            case 'buscar':
                if ($_POST) {
                    $id = $_POST['id'] ?? '';
                    $tipoEvento = $_POST['tipoEvento'] ?? '';
                    $tipoEvento = $tipoEvento !== '' ? $tipoEvento : null;
                    $rspta = $this->controller->Buscar($id, $tipoEvento);
                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se encontraron resultados');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            default:
                echo json_encode(['status' => false, 'msg' => 'Operación no válida']);
                break;
        }
    }
}

$route = new CalendarioRoutes();
$op = $_REQUEST["op"];
$route->routeMethod($op);
