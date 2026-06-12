<?php
require_once '../controllers/aula.controller.php';

class AulaRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new AulaController();
    }

    private function DataForm()
    {
        return array_map('trim', $_POST);
    }

    public function aulaMethod($op)
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
                    if (empty($data["idAula"])) {
                        if (empty($data["idGrado"]) || empty($data["idNivel"]) || empty($data["idDocente"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            unset($data["idAula"]);
                            unset($data["submit"]);
                            $rspta = $this->controller->Registrar(...$data);
                            if ($rspta) {
                                $arrayResponse = array('status' => true, 'msg' => 'Datos registrados correctamente');
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => "No se pudieron registrar los datos");
                            }
                        }
                    } else {
                        if (empty($data["idAula"]) || empty($data["idNivel"]) || empty($data["idGrado"]) || empty($data["idDocente"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            unset($data["submit"]);
                            $rspta = $this->controller->Editar(...$data);
                            if ($rspta) {
                                $arrayResponse = array('status' => true, 'msg' => 'Datos actualizados correctamente');
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => "No se pudieron actualizar los datos");
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
                break;
        }
    }
}
$route = new AulaRoutes();
$op = $_REQUEST["op"];
$route->aulaMethod($op);
