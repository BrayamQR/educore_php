<?php
require_once '../controllers/historial.controller.php';

class HistorialRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new HistorialController();
    }

    public function historialMethod($op)
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
            case 'listarfechaspendientes':
                $rspta = $this->controller->ListarFechasPendientes();
                if (empty($rspta)) {
                    $arrayResponse = array('status' => false, 'msg' => 'No hay fechas pendientes de cierre');
                } else {
                    $arrayResponse = array('status' => true, 'data' => $rspta);
                }
                echo json_encode($arrayResponse);
                break;
            case 'realizarcierre':
                if ($_POST) {
                    $jsonString = $_POST['fechas'] ?? null;
                    if (empty($jsonString)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se recibieron fechas');
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $fechas = json_decode($jsonString, true);
                    if (!is_array($fechas) || empty($fechas)) {
                        $arrayResponse = array('status' => false, 'msg' => 'Datos inválidos');
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $exitosos = 0;
                    $errores  = 0;

                    foreach ($fechas as $fecha) {
                        $rspta = $this->controller->RealizarCierre($fecha);
                        if ($rspta) {
                            $exitosos++;
                        } else {
                            $errores++;
                        }
                    }

                    if ($exitosos > 0) {
                        $arrayResponse = array(
                            'status' => true,
                            'msg'    => "Cierre realizado correctamente en {$exitosos} fecha" . ($exitosos !== 1 ? 's' : '')
                        );
                    } else {
                        $arrayResponse = array('status' => false, 'msg' => 'No se pudo realizar el cierre');
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'tieneregistroshoy':
                $rspta = $this->controller->TieneRegistrosHoy();
                $arrayResponse = array('status' => true, 'tiene_registros' => $rspta);
                echo json_encode($arrayResponse);
                break;
            case 'listarfaltas':
                $rspta = $this->controller->ListarFaltas();
                if (empty($rspta)) {
                    $arrayResponse = array('status' => false, 'msg' => 'No hay faltas registradas');
                } else {
                    $arrayResponse = array('status' => true, 'data' => $rspta);
                }
                echo json_encode($arrayResponse);
                break;

            case 'justificarfalta':
                if ($_POST) {
                    $jsonString = $_POST['faltas'] ?? null;
                    if (empty($jsonString)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se recibieron datos');
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $faltas = json_decode($jsonString, true);
                    if (!is_array($faltas) || empty($faltas)) {
                        $arrayResponse = array('status' => false, 'msg' => 'Datos inválidos');
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $exitosos = 0;
                    $errores  = 0;

                    foreach ($faltas as $idAsistencia) {
                        $rspta = $this->controller->JustificarFalta($idAsistencia);
                        if ($rspta) $exitosos++;
                        else $errores++;
                    }

                    if ($exitosos > 0) {
                        $arrayResponse = array(
                            'status' => true,
                            'msg'    => "{$exitosos} falta" . ($exitosos !== 1 ? 's' : '') . " justificada" . ($exitosos !== 1 ? 's' : '') . " correctamente"
                        );
                    } else {
                        $arrayResponse = array('status' => false, 'msg' => 'No se pudo justificar las faltas');
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'buscar':
                if ($_POST) {
                    $dato        = $_POST['dato']        ?? '';
                    $fechaInicio = $_POST['fechaInicio'] ?? '';
                    $fechaFin    = $_POST['fechaFin']    ?? '';
                    $estado      = $_POST['estado']      ?? '';

                    $rspta = $this->controller->Buscar($dato, $fechaInicio, $fechaFin, $estado);

                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se encontraron resultados');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'porEstudiante':
                if ($_POST) {
                    $estudiante  = $_POST['reporteEstudiante']  ?? '';
                    $fechaInicio = $_POST['reporteFechaInicio'] ?? '';
                    $fechaFin    = $_POST['reporteFechaFin']    ?? '';
                    $estado      = $_POST['reporteEstado']      ?? '';

                    $rspta = $this->controller->ReportePorEstudiante($estudiante, $fechaInicio, $fechaFin, $estado);

                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se encontraron registros');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;

            case 'porFecha':
                if ($_POST) {
                    $fecha  = $_POST['reporteFechaEspecifica'] ?? '';
                    $idAula = $_POST['reporteAula']            ?? '';
                    $estado = $_POST['reporteEstado']          ?? '';

                    $rspta = $this->controller->ReportePorFecha($fecha, $idAula, $estado);

                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se encontraron registros para esa fecha');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;

            case 'porPeriodo':
                if ($_POST) {
                    $fechaInicio = $_POST['reporteFechaInicio'] ?? '';
                    $fechaFin    = $_POST['reporteFechaFin']    ?? '';
                    $idAula      = $_POST['reporteAula']        ?? '';
                    $estado      = $_POST['reporteEstado']      ?? '';

                    $rspta = $this->controller->ReportePorPeriodo($fechaInicio, $fechaFin, $idAula, $estado);

                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se encontraron registros en ese periodo');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;
        }
    }
}
$route = new HistorialRoutes();
$op = $_REQUEST["op"];
$route->historialMethod($op);
