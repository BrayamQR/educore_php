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
        }
    }
}

$route = new DiaNoLectivoRoutes();
$op = $_REQUEST["op"];
$route->diaNoLectivoMethod($op);
