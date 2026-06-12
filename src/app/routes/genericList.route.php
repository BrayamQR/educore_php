<?php
require_once '../controllers/genericList.controller.php';

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
        }
    }
}

$route = new GenericListRoutes();
$op = $_REQUEST["op"];
$route->GenericListMethod($op);
