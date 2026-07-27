<?php
require_once __DIR__ . '/../controllers/aniolectivo.controller.php';
require_once __DIR__ . '/../utils/helpers.php';

class AnioLectivoRoutes
{

    private $controller;

    public function __construct()
    {
        $this->controller = new AnioLectivoController();
    }

    private function DataForm()
    {
        return Helpers::TrimData($_POST);
    }

    public function anioLectivoMethod($op)
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
            case 'buscar':
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
            case 'obteneranioactivo':
                $rspta = $this->controller->ObtenerAnioActivo();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'No hay año lectivo activo'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta
                    );
                };
                echo json_encode($arrayResponse);
                break;
            case 'obtenerultimoanio':
                $rspta = $this->controller->ObtenerUltimoAnio();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'No se encontro registro'
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
                        empty($data['anio']) ||
                        empty($data['fechaInicio']) ||
                        empty($data['fechaFin']) ||
                        empty($data['idTipoPeriodo'])
                    ) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        unset($data['submit']);
                        if (empty($data['idAnioLectivo'])) {
                            unset($data['idAnioLectivo']);
                            $rspta = $this->controller->RegistrarCompleto(...$data);

                            $arrayResponse = $rspta
                                ? array('status' => true, 'msg' => 'Datos registrados correctamente')
                                : array('status' => false, 'msg' => 'No se pudieron registrar los datos');
                        } else {
                            $rspta = $this->controller->EditarCompleto(...$data);
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

            case 'obtenerperiodos':
                if ($_POST) {
                    $id = $_POST['id'];
                    $rspta = $this->controller->ObtenerPeriodos($id);
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
            case 'guardarperiodos':
                if ($_POST) {
                    $periodos = json_decode($_POST['periodos'], true);
                    if (empty($periodos)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se recibieron periodos');
                    } else {
                        $rspta = $this->controller->GuardarPeriodos($periodos);
                        if ($rspta) {
                            $arrayResponse = array('status' => true, 'msg' => 'Periodos guardados correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'No se pudieron guardar los periodos');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'obtenervencidos':
                $rspta = $this->controller->ObtenerVencidos();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'No hay años lectivos vencidos'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'obteneractivos':
                $rspta = $this->controller->ObtenerActivos();
                if (empty($rspta)) {
                    $arrayResponse = array(
                        'status' => false,
                        'msg' => 'No hay años lectivos activos'
                    );
                } else {
                    $arrayResponse = array(
                        'status' => true,
                        'data' => $rspta
                    );
                }
                echo json_encode($arrayResponse);
                break;
            case 'cerrarvencidos':
                $rspta = $this->controller->CerrarVencidos();
                $arrayResponse = $rspta
                    ? array('status' => true, 'msg' => 'Años lectivos vencidos cerrados correctamente')
                    : array('status' => false, 'msg' => 'No se pudieron cerrar los años lectivos');
                echo json_encode($arrayResponse);
                break;

            case 'activaranio':
                if ($_POST) {
                    if (empty($_POST['id'])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $id = $_POST['id'];
                        $rspta = $this->controller->ActivarAnio($id);
                        if ($rspta) {
                            $arrayResponse = array('status' => true, 'msg' => 'Año lectivo activado correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'Error al activar el año lectivo');
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

$route = new AnioLectivoRoutes();
$op = $_REQUEST["op"];
$route->anioLectivoMethod($op);
