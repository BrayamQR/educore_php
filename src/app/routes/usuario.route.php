<?php
header('Content-Type: application/json');
require_once '../controllers/usuario.controller.php';
class UsuarioRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new UsuarioController();
    }
    private function DataForm()
    {
        return array_map('trim', $_POST);
    }

    public function usuarioMethod($op)
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
                    if (empty($data["idUsuario"])) {
                        if (empty($data["codUsuario"]) || empty($data["nomUsuario"]) || empty($data["telUsuario"]) || empty($data["emailUsuario"]) || empty($data["dirUsuario"]) || empty($data["usuUsuario"]) || empty($data["passUsuario"]) || empty($data["idPerfil"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            unset($data["idUsuario"]);
                            unset($data["submit"]);
                            unset($data["confPassword"]);

                            $data["passUsuario"] = password_hash($data["passUsuario"], PASSWORD_BCRYPT);

                            $rspta = $this->controller->Registrar(...$data);
                            if ($rspta) {
                                $arrayResponse = array('status' => true, 'msg' => "Datos registrados correctamente");
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => "No se pudieron registrar los datos");
                            }
                        }
                    } else {
                        if (empty($data["idUsuario"]) || empty($data["codUsuario"]) || empty($data["nomUsuario"]) || empty($data["telUsuario"]) || empty($data["emailUsuario"]) || empty($data["dirUsuario"]) || empty($data["usuUsuario"]) || empty($data["idPerfil"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            unset($data["submit"]);
                            unset($data["confPassword"]);
                            unset($data["passUsuario"]);

                            $rspta = $this->controller->Editar(...$data);
                            if ($rspta) {
                                $arrayResponse = array('status' => true, 'msg' => 'Datos modificados correctamente');
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => 'Error al modificar los datos');
                            }
                        }
                    }
                    echo json_encode($arrayResponse);
                }

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
            case 'login':
                if ($_POST) {
                    $data = $this->DataForm();

                    if (empty($data["usuUsuario"]) || empty($data["passUsuario"])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $usuario = $this->controller->Login($data["usuUsuario"]);

                        if (!$usuario) {
                            $arrayResponse = array('status' => false, 'msg' => 'Usuario no encontrado');
                        } elseif (!password_verify($data["passUsuario"], $usuario["passUsuario"])) {
                            $arrayResponse = array('status' => false, 'msg' => 'Contraseña incorrecta');
                        } else {
                            session_start();
                            $_SESSION['usuario'] = [
                                'idUsuario'  => $usuario["idUsuario"],
                                'nomUsuario' => $usuario["nomUsuario"],
                                'usuUsuario' => $usuario["usuUsuario"],
                                'idPerfil'   => $usuario["idPerfil"],
                                'nomPerfil'  => $usuario["nomPerfil"],
                            ];
                            $arrayResponse = array('status' => true, 'msg' => 'Inicio de sesión exitoso');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'restaurarpassword':
                if ($_POST) {
                    if (empty($_POST['id'])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                    } else {
                        $id = $_POST['id'];
                        $usuario = $this->controller->Mostrar($id);

                        if (!$usuario) {
                            $arrayResponse = array('status' => false, 'msg' => 'Usuario no encontrado');
                        } else {
                            $rspta = $this->controller->RestaurarPassword($id, $usuario["usuUsuario"]);
                            if ($rspta) {
                                $arrayResponse = array('status' => true, 'msg' => 'Contraseña restaurada correctamente');
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => 'Error al restaurar la contraseña');
                            }
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'cerrarsesion':
                session_start();
                session_destroy();
                $arrayResponse = array('status' => true, 'msg' => 'Sesión cerrada correctamente');
                echo json_encode($arrayResponse);
                break;
        }
    }
}

$route = new UsuarioRoutes();
$op = $_REQUEST["op"];
$route->usuarioMethod($op);
