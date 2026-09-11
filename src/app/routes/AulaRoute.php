<?php

namespace App\routes;

require_once __DIR__ . '/../../../vendor/autoload.php';

use App\controllers\AulaController;
use App\utils\Helpers;

class AulaRoutes
{
    private AulaController $controller;
    public function __construct()
    {
        $this->controller = new AulaController();
    }

    private function DataForm()
    {
        return Helpers::TrimData($_POST);
    }

    public function routeMethod($op)
    {
        switch ($op) {
            case 'listar':
                $rspta = $this->controller->Listar();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'listaraulas':
                $rspta = $this->controller->ListarAulas();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'Datos no encontrados'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'buscar';
                if ($_POST) {
                    $data = array();
                    if (empty($_POST["textsearch"])) {
                        $arrayResponse = array('status' => false, 'msg' => "Error de datos");
                    } else {
                        $search = trim($_POST["textsearch"]);
                        $arrayResponse = array('status' => false, 'found' => 0, 'data' => '');

                        $rspta = $this->controller->Buscar($search);
                        if (!empty($rspta)) {
                            $data = $rspta;
                            $arrayResponse = array(
                                'status' => true,
                                'found' => count($data),
                                'data' => $data
                            );
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'mostrar':
                if ($_POST) {
                    $id = $_POST['id'];
                    $rspta = $this->controller->Mostrar($id);
                    if (empty($rspta)) {
                        $arrayResponse = array(
                            'status' => false,
                            'msg' => 'Datos no encontrados'
                        );
                    } else {
                        $arrayResponse = array('status' => true, 'msg' => 'Datos encontrados', 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'guardaryeditar':
                if ($_POST) {
                    $data = $this->DataForm();
                    if (
                        empty($data['idDocente']) ||
                        empty($data['idTurno']) ||
                        empty($data['idAnioLectivo'])
                    ) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $idAulaLectiva = $data['idAulaLectiva'] ?? '';
                        $idAula = $data['idAula'] ?? '';
                        unset($data['idAulaLectiva']);
                        unset($data['submit']);
                        unset($data['idAula']);
                        unset($data['idNivel']);

                        if (empty($idAulaLectiva)) {
                            if (empty($idAula)) {

                                if (empty($data['idGrado']) || empty($data['seccionAula'])) {
                                    $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                                } else {
                                    $rspta = $this->controller->RegistrarCompleto(
                                        $data['idGrado'],
                                        $data['seccionAula'],
                                        $data['idAnioLectivo'],
                                        $data['idDocente'],
                                        $data['idTurno']
                                    );
                                    $arrayResponse = $rspta
                                        ? array('status' => true, 'msg' => 'Datos registrados correctamente')
                                        : array('status' => false, 'msg' => 'No se pudieron registrar los datos');
                                }
                            } else {
                                $rsta = $this->controller->RegistrarAulaLectiva(
                                    $idAula,
                                    $data['idAnioLectivo'],
                                    $data['idDocente'],
                                    $data['idTurno']
                                );

                                $arrayResponse = $rsta
                                    ? array('status' => true, 'msg' => 'Datos registrados correctamente')
                                    : array('status' => false, 'msg' => 'No se pudieron registrar los datos');
                            }
                        } else {
                            $rspta = '';

                            $arrayResponse = $rspta
                                ? array('status' => true, 'msg' => 'Datos actualizados correctamente')
                                : array('status' => false, 'msg' => 'No se pudieron actualizar los datos');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'eliminar':
                if ($_POST) {
                    if (empty($_POST['id'])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $id = $_POST['id'];
                        $rspta = $this->controller->Eliminar($id);
                        if ($rspta) {
                            $arrayResponse = array('status' => true, 'msg' => 'Registro eliminado correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'Error al eliminar el registro');
                        }
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
$route = new AulaRoutes();
$op = $_REQUEST["op"];
$route->routeMethod($op);
