<?php
require_once __DIR__ . '/../controllers/actividadacademica.controller.php';
require_once __DIR__ . '/../utils/helpers.php';

class ActividadAcademicaRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new ActividadAcademicaController();
    }

    private function DataForm()
    {
        return Helpers::TrimData($_POST);
    }

    public function actividadAcademicaMethod($op)
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

                    if (empty($data['fechaFin'])) {
                        $data['fechaFin'] = $data['fechaInicio'] ?? '';
                    }

                    if (
                        empty($data['idAnioLectivo']) ||
                        empty($data['nomActividad']) ||
                        empty($data['fechaInicio']) ||
                        empty($data['horaIngreso']) ||
                        empty($data['horaSalida']) ||
                        empty($data['idTipoActividad']) ||
                        empty($data['lugar']) ||
                        empty($data['descActividad']) ||
                        !Helpers::EsBooleanoValido($data['registraAsistencia'] ?? null) ||
                        !Helpers::EsBooleanoValido($data['suspendeClases'] ?? null)
                    ) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $idActividad = $data['idActividad'] ?? '';
                        $participantes = $data['participantes'] ?? [];

                        unset($data['idActividad']);
                        unset($data['submit']);
                        unset($data['participantes']);

                        if (empty($participantes)) {
                            $arrayResponse = array('status' => false, 'msg' => 'Debe seleccionar al menos un participante');
                        } else {
                            if (empty($idActividad)) {
                                $rspta = $this->controller->RegistrarCompleto(
                                    $data['idAnioLectivo'],
                                    $data['idTipoActividad'],
                                    $data['nomActividad'],
                                    $data['descActividad'],
                                    $data['fechaInicio'],
                                    $data['fechaFin'],
                                    $data['horaIngreso'],
                                    $data['horaSalida'],
                                    $data['lugar'],
                                    $data['registraAsistencia'],
                                    $data['suspendeClases'],
                                    $participantes
                                );
                                $arrayResponse = $rspta
                                    ? array('status' => true, 'msg' => 'Datos registrados correctamente')
                                    : array('status' => false, 'msg' => 'No se pudieron registrar los datos');
                            } else {
                                $participantesSeleccionados = array_map('intval', $participantes);
                                $rspta = $this->controller->EditarCompleto(
                                    $idActividad,
                                    $data['idTipoActividad'],
                                    $data['nomActividad'],
                                    $data['descActividad'],
                                    $data['fechaInicio'],
                                    $data['fechaFin'],
                                    $data['horaIngreso'],
                                    $data['horaSalida'],
                                    $data['lugar'],
                                    $data['registraAsistencia'],
                                    $data['suspendeClases'],
                                    $participantesSeleccionados
                                );
                                $arrayResponse = $rspta
                                    ? array('status' => true, 'msg' => 'Datos actualizados correctamente')
                                    : array('status' => false, 'msg' => 'No se pudieron actualizar los datos');
                            }
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'mostrar':
                if ($_POST) {
                    if (empty($_POST['id'])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $id = $_POST['id'];
                        $rspta = $this->controller->Mostrar($id);
                        $arrayResponse = $rspta
                            ? array('status' => true, 'msg' => 'Dato encontrado', 'data' => $rspta)
                            : array(
                                'status' => false,
                                'msg' => 'Dato no encontrado'
                            );
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
                $dato           = $_POST['dato']        ?? '';
                $fechaInicio    = $_POST['fechaInicio'] ?? '';
                $fechaFin       = $_POST['fechaFin']    ?? '';
                $idTipoActividad  = $_POST['idTipoActividad'] ?? '';
                $idAnioLectivo  = $_POST['idAnioLectivo'] ?? '';
                $rspta = $this->controller->Buscar($dato, $fechaInicio, $fechaFin, $idTipoActividad, $idAnioLectivo);
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


$route = new ActividadAcademicaRoutes();
$op = $_REQUEST["op"];
$route->actividadAcademicaMethod($op);
