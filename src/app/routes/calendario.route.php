<?php
require_once '../controllers/calendario.controller.php';

class CalendarioRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new CalendarioController;
    }

    public function calendarioMethid($op)
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
$route->calendarioMethid($op);
