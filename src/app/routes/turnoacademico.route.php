<?php
require_once __DIR__ . '/../controllers/turnoacademico.controller.php';
require_once __DIR__ . '/../utils/helpers.php';

class TurnoAcademicoRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new TurnoAcademicoController();
    }

    private function DataForm()
    {
        return Helpers::TrimData($_POST);
    }

    public function turnoAcademicoMethod($op)
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
            case 'guardaryeditar':
                if ($_POST) {
                    $data = $this->DataForm();

                    if (
                        empty($data['idAnioLectivo']) ||
                        empty($data['nomTurno']) ||
                        empty($data['horaIngreso']) ||
                        empty($data['horaSalida']) ||
                        empty($data['minTolerancia']) ||
                        empty($data['dias'])
                    ) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $idTurno = $data['idTurno'] ?? '';
                        $dias = $data['dias'] ?? [];
                        unset($data['idTurno']);
                        unset($data['submit']);
                        unset($data['dias']);
                        if (empty($dias)) {
                            $arrayResponse = array('status' => false, 'msg' => 'Debe seleccionar al menos un dia');
                        } else {
                            if (empty($idTurno)) {
                                unset($data['descCambio']);
                                unset($data['idUsuario']);
                                $rspta = $this->controller->RegistrarCompleto(
                                    $data['idAnioLectivo'],
                                    $data['nomTurno'],
                                    $data['horaIngreso'],
                                    $data['horaSalida'],
                                    $data['minTolerancia'],
                                    $dias
                                );
                                $arrayResponse = $rspta
                                    ? array('status' => true, 'msg' => 'Datos registrados correctamente')
                                    : array('status' => false, 'msg' => 'No se pudieron registrar los datos');
                            } else {
                                if (empty($data['descCambio'])) {
                                    $arrayResponse = array('status' => false, 'msg' => 'Debe ingresar el motivo del cambio');
                                } else {
                                    $diasSeleccionados = array_map('intval', $dias);

                                    $rspta = $this->controller->EditarCompleto(
                                        $idTurno,
                                        $data['nomTurno'],
                                        $data['horaIngreso'],
                                        $data['horaSalida'],
                                        $data['minTolerancia'],
                                        $diasSeleccionados,
                                        $data['descCambio'],
                                        $data['idUsuario']
                                    );

                                    $arrayResponse = $rspta
                                        ? array('status' => true, 'msg' => 'Datos actualizados correctamente')
                                        : array('status' => false, 'msg' => 'No se pudieron actualizar los datos');
                                }
                            }
                        }
                    }

                    echo json_encode($arrayResponse);
                }
                break;
            case "mostrar":
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
            case 'cambiarestado':
                if ($_POST) {
                    if (empty($_POST['id'])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $id = $_POST['id'];
                        $rspta = $this->controller->CambiarEstado($id);
                        if ($rspta) {
                            $arrayResponse = array('status' => true, 'msg' => 'Estado modificado correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'Error al modificar el estado');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'buscar':
                $dato = $_POST['dato'] ?? '';
                $idAnioLectivo  = $_POST['idAnioLectivo'] ?? '';
                $rspta = $this->controller->Buscar($dato, $idAnioLectivo);
                if (empty($rspta)) {
                    $arrayResponse = array('status' => false, 'msg' => 'No se encontraron resultados');
                } else {
                    $arrayResponse = array('status' => true, 'data' => $rspta);
                }
                echo json_encode($arrayResponse);
                break;
            default:
                echo json_encode(['status' => false, 'msg' => 'Operación no válida']);
                break;
        }
    }
}
$route = new TurnoAcademicoRoutes();
$op = $_REQUEST["op"];
$route->turnoAcademicoMethod($op);
