<?php
require_once '../controllers/feriado.controller.php';

class FeriadoRoutes
{
    private $controller;

    public function __construct()
    {
        $this->controller = new FeriadoController();
    }

    private function DataForm()
    {
        return array_map('trim', $_POST);
    }

    public function feriadoMethod($op)
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
                    $dato        = $_POST['dato'] ?? '';
                    $fechaInicio = $_POST['fechaInicio'] ?? '';
                    $fechaFin    = $_POST['fechaFin'] ?? '';
                    $tipoFeriado = $_POST['tipoFeriado'] ?? '';

                    $rspta = $this->controller->Buscar($dato, $fechaInicio, $fechaFin, $tipoFeriado);
                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'No se encontraron resultados');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'mostrar':
                if ($_POST) {
                    $id = $_POST['id'];
                    $rspta = $this->controller->Mostrar($id);
                    if (empty($rspta)) {
                        $arrayResponse = array('status' => false, 'msg' => 'Datos no encontrados');
                    } else {
                        $arrayResponse = array('status' => true, 'data' => $rspta);
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'guardaryeditar':
                if ($_POST) {
                    $data = $this->DataForm();
                    if (empty($data["idFeriado"])) {
                        if (empty($data["nomFeriado"]) || empty($data["fechaFeriado"]) || empty($data["idTipoFeriado"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            try {
                                unset($data["idFeriado"]);
                                unset($data["submit"]);
                                $rspta = $this->controller->Registrar(...$data);
                                if ($rspta) {
                                    $arrayResponse = array('status' => true, 'msg' => 'Feriado registrado correctamente');
                                } else {
                                    $arrayResponse = array('status' => false, 'msg' => 'No se pudo registrar el feriado');
                                }
                            } catch (Exception $e) {
                                if ($e->getCode() == 23000) {
                                    $arrayResponse = array('status' => false, 'msg' => 'Ya existe un feriado registrado con esa fecha');
                                } else {
                                    $arrayResponse = array('status' => false, 'msg' => 'Error al registrar: ' . $e->getMessage());
                                }
                            }
                        }
                    } else {
                        if (empty($data["idFeriado"]) || empty($data["nomFeriado"]) || empty($data["fechaFeriado"]) || empty($data["idTipoFeriado"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            try {
                                unset($data["submit"]);
                                $rspta = $this->controller->Editar(...$data);
                                if ($rspta) {
                                    $arrayResponse = array('status' => true, 'msg' => 'Feriado actualizado correctamente');
                                } else {
                                    $arrayResponse = array('status' => false, 'msg' => 'No se pudieron actualizar los datos');
                                }
                            } catch (Exception $e) {
                                if ($e->getCode() == 23000) {
                                    $arrayResponse = array('status' => false, 'msg' => 'Ya existe un feriado registrado con esa fecha');
                                } else {
                                    $arrayResponse = array('status' => false, 'msg' => 'Error al actualizar: ' . $e->getMessage());
                                }
                            }
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
        }
    }
}

$route = new FeriadoRoutes();
$op = $_REQUEST["op"];
$route->feriadoMethod($op);
