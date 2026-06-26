<?php
require_once '../controllers/dianolectivo.controller.php';

class DiaNoLectivoRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new DiaNoLectivoController();
    }

    private function DataForm()
    {
        return array_map('trim', $_POST);
    }

    public function diaNoLectivoMethod($op)
    {
        switch ($op) {
            case 'obtenerferiadospendientes':
                $rspta = $this->controller->ObtenerFeriadosPendientes();
                if (is_null($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg'    => 'No se encontró un año lectivo activo'
                    );
                } elseif (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => true,
                        'msg'    => 'No hay feriados pendientes por generar',
                        'data'   => []
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data'   => $rspta
                    );
                }
                echo json_encode($arrayResponse);
                break;
        }
    }
}

$route = new DiaNoLectivoRoutes();
$op = $_REQUEST["op"];
$route->diaNoLectivoMethod($op);
