<?php
require_once '../controllers/dianolectivo.controller.php';
require_once '../utils/helpers.php';

class DiaNoLectivoRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new DiaNoLectivoController();
    }

    private function DataForm()
    {
        return Helpers::TrimData($_POST);
    }

    public function diaNoLectivoMethod($op)
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
            case 'guardarferiadosnacionales':
                if ($_POST) {
                    $idAnioLectivo = $_POST['idAnioLectivo'];
                    $feriados      = json_decode($_POST['feriados'], true);

                    if (empty($idAnioLectivo) || empty($feriados)) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $errores = 0;
                        foreach ($feriados as $feriado) {
                            $plantilla = $this->controller->MostrarPlantillas($feriado['idPlantilla']);
                            if ($plantilla) {
                                $rspta = $this->controller->Registrar(
                                    $idAnioLectivo,
                                    $plantilla['nomEvento'],
                                    $plantilla['fechaInicio'],
                                    $plantilla['fechaFin'],
                                    1,
                                    1,
                                    $feriado['idPlantilla']
                                );
                                if (!$rspta) $errores++;
                            }
                        }
                        if ($errores === 0) {
                            $arrayResponse = array('status' => true, 'msg' => 'Feriados registrados correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'Algunos feriados no pudieron registrarse');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'guardarmanual':
                if ($_POST) {
                    $data = $this->DataForm();
                    if (
                        empty($data['idAnioLectivo']) ||
                        empty($data['nomEvento']) ||
                        empty($data['fechaInicio']) ||
                        empty($data['fechaFin']) ||
                        empty($data['idTipoDiaNoLectivo'])
                    ) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $rspta = $this->controller->Registrar(
                            $data['idAnioLectivo'],
                            $data['nomEvento'],
                            $data['fechaInicio'],
                            $data['fechaFin'],
                            2, // tipo_origen = manual
                            $data['idTipoDiaNoLectivo'],
                            null // id_plantilladianolectivo = null
                        );
                        if ($rspta) {
                            $arrayResponse = array('status' => true, 'msg' => 'Día no lectivo registrado correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'No se pudo registrar el día no lectivo');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'buscar':
                $dato           = $_POST['dato']        ?? '';
                $fechaInicio    = $_POST['fechaInicio'] ?? '';
                $fechaFin       = $_POST['fechaFin']    ?? '';
                $idTipoFeriado  = $_POST['idTipoFeriado'] ?? '';
                $idAnioLectivo  = $_POST['idAnioLectivo'] ?? '';
                $rspta = $this->controller->Buscar($dato, $fechaInicio, $fechaFin, $idTipoFeriado, $idAnioLectivo);
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

$route = new DiaNoLectivoRoutes();
$op = $_REQUEST["op"];
$route->diaNoLectivoMethod($op);
