<?php
require_once __DIR__ . '/../controllers/genericList.controller.php';

class GenericListRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new GenericListController();
    }

    public function GenericListMethod($op)
    {
        switch ($op) {
            case 'perfil':
                $rspta = $this->controller->ListarPerfil();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'docente':
                $rspta = $this->controller->ListarDocente();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'aula':
                $rspta = $this->controller->ListarAula();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'estudiante':
                $rspta = $this->controller->ListarEstudiante();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'tipodianolectivo':
                $rspta = $this->controller->ListarTipoDianolectivo();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'tipoparticipante':
                $rspta = $this->controller->ListarTipoParticipante();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'tipoactividad':
                $rspta = $this->controller->ListarTipoActividad();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'tipoevento':
                $rspta = $this->controller->ListarTiposEvento();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta,
                    );
                }
                echo json_encode($arrayResponse);
                break;
            default:
                echo json_encode(['status' => false, 'msg' => 'Operación no válida']);
                break;
        }
    }
}

$route = new GenericListRoutes();
$op = $_REQUEST["op"];
$route->GenericListMethod($op);
