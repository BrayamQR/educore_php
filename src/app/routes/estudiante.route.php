<?php
require_once '../controllers/estudiante.controller.php';

class EstuanteRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new EstudianteController();
    }
    private function DataForm()
    {
        return array_map('trim', $_POST);
    }

    public function estudianteMethod($op)
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
            case 'listarsinqr':
                $rspta = $this->controller->ListarSinQR();
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
            case 'buscarpordni':
                if ($_POST) {
                    $dato = $_POST['docEstudiante'];
                    $rspta = $this->controller->BuscarPorDNI($dato);
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
            case 'mostrar':
                if ($_POST) {
                    $id = $_POST["id"];
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
                    if (empty($data["idEstudiante"])) {
                        if (
                            empty($data["idTipoDocumento"]) ||
                            empty($data["docEstudiante"]) ||
                            empty($data["nomEstudiante"]) ||
                            empty($data["apaEstudiante"]) ||
                            empty($data["amaEstudiante"]) ||
                            empty($data["fechaNacimiento"]) ||
                            empty($data["idSexo"]) ||
                            empty($data["nomApoderado"]) ||
                            empty($data["telApoderado"]) ||
                            empty($data["estMatricula"]) ||
                            empty($data["idAula"])
                        ) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            unset($data["idEstudiante"]);
                            unset($data["submit"]);
                            $rspta = $this->controller->Registrar(...$data);
                            if ($rspta) {
                                $arrayResponse = array('status' => true, 'msg' => 'Datos registrados correctamente');
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => 'No se pudo registrar los datos');
                            }
                        }
                    } else {
                        if (
                            empty($data["idEstudiante"]) ||
                            empty($data["idTipoDocumento"]) ||
                            empty($data["docEstudiante"]) ||
                            empty($data["nomEstudiante"]) ||
                            empty($data["apaEstudiante"]) ||
                            empty($data["amaEstudiante"]) ||
                            empty($data["fechaNacimiento"]) ||
                            empty($data["idSexo"]) ||
                            empty($data["nomApoderado"]) ||
                            empty($data["telApoderado"]) ||
                            empty($data["estMatricula"]) ||
                            empty($data["idAula"])
                        ) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        } else {
                            unset($data["submit"]);
                            $actual = $this->controller->Mostrar($data["idEstudiante"]);
                            $docCambio = $actual && $actual['docEstudiante'] !== $data["docEstudiante"];

                            $rspta = $this->controller->Editar(...$data);

                            if ($rspta) {
                                if ($docCambio) {
                                    if (!empty($actual['qrEstudiante'])) {
                                        $rutaQR = "../../../public/qr-students/" . $actual['qrEstudiante'];
                                        if (file_exists($rutaQR)) {
                                            unlink($rutaQR);
                                        }
                                    }
                                    $this->controller->LimpiarQR($data["idEstudiante"]);
                                    $arrayResponse = array('status' => true, 'msg' => 'Datos actualizados correctamente, es recomendable volver a generar el QR');
                                } else {
                                    $arrayResponse = array('status' => true, 'msg' => 'Datos actualizados correctamente');
                                }
                            } else {
                                $arrayResponse = array('status' => false, 'msg' => 'No se pudo actualizar los datos');
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
                            $arrayResponse = array('status' => true, 'msg' => 'Datos eliminados correctamente');
                        } else {
                            $arrayResponse = array('status' => false, 'msg' => 'No se pudo eliminar los datos');
                        }
                    }
                    echo json_encode($arrayResponse);
                }
                break;
            case 'generarqrmasivo':
                if ($_POST) {
                    // Recibir el JSON desde FormData
                    $jsonString = $_POST['estudiantes'] ?? null;

                    if (empty($jsonString)) {
                        $arrayResponse = array(
                            'status' => false,
                            'msg' => 'No se recibieron estudiantes para generar QR'
                        );
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $estudiantes = json_decode($jsonString, true);

                    if (!is_array($estudiantes) || empty($estudiantes)) {
                        $arrayResponse = array(
                            'status' => false,
                            'msg' => 'Datos inválidos'
                        );
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $generados = 0;
                    $errores = 0;
                    $detalles = array();

                    // Requerir librería QR antes del loop
                    require_once '../lib/phpqrcode/qrlib.php';

                    // Definir directorio de QR
                    $directorioQR = "../../../public/qr-students/";

                    // Verificar que el directorio existe, si no, crearlo
                    if (!file_exists($directorioQR)) {
                        mkdir($directorioQR, 0777, true);
                    }

                    // Procesar cada estudiante
                    foreach ($estudiantes as $item) {
                        $idEstudiante = intval($item['idEstudiante']);

                        try {
                            // Obtener info del estudiante
                            $infoEstudiante = $this->controller->Mostrar($idEstudiante);

                            if (empty($infoEstudiante)) {
                                $errores++;
                                $detalles[] = array(
                                    'idEstudiante' => $idEstudiante,
                                    'status' => false,
                                    'msg' => 'Estudiante no encontrado'
                                );
                                continue;
                            }

                            // Generar nombre del QR basado en el documento
                            $docEstudiante = $infoEstudiante['docEstudiante'];
                            $nombreQR = "qr_" . $docEstudiante . ".png";
                            $rutaQR = $directorioQR . $nombreQR;

                            // Eliminar archivo anterior si existe
                            if (file_exists($rutaQR)) {
                                unlink($rutaQR);
                            }

                            // Generar el código QR
                            QRcode::png($docEstudiante, $rutaQR, "L", 10, 5);

                            // Verificar que el QR se generó correctamente
                            if (!file_exists($rutaQR)) {
                                $errores++;
                                $detalles[] = array(
                                    'idEstudiante' => $idEstudiante,
                                    'status' => false,
                                    'msg' => 'Error al generar archivo QR'
                                );
                                continue;
                            }

                            // Actualizar en la base de datos
                            $rspta = $this->controller->ActualizarQR($idEstudiante, $nombreQR);

                            if ($rspta) {
                                $generados++;
                                $detalles[] = array(
                                    'idEstudiante' => $idEstudiante,
                                    'status' => true,
                                    'qr' => $nombreQR
                                );
                            } else {
                                $errores++;
                                $detalles[] = array(
                                    'idEstudiante' => $idEstudiante,
                                    'status' => false,
                                    'msg' => 'Error al actualizar en BD'
                                );

                                // Si falla la BD, eliminar el QR generado
                                if (file_exists($rutaQR)) {
                                    unlink($rutaQR);
                                }
                            }
                        } catch (Exception $e) {
                            $errores++;
                            $detalles[] = array(
                                'idEstudiante' => $idEstudiante,
                                'status' => false,
                                'msg' => 'Error: ' . $e->getMessage()
                            );
                        }
                    }

                    // Respuesta final
                    $arrayResponse = array(
                        'status' => ($generados > 0),
                        'msg' => "QR generados: {$generados}, Errores: {$errores}",
                        'generados' => $generados,
                        'errores' => $errores,
                        'total' => count($estudiantes),
                        'detalles' => $detalles
                    );

                    echo json_encode($arrayResponse);
                }
                break;
            case 'generarqr':
                if ($_POST) {
                    if (empty($_POST['idEstudiante'])) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error de datos');
                        echo json_encode($arrayResponse);
                        break;
                    }

                    $idEstudiante = intval($_POST['idEstudiante']);

                    require_once '../lib/phpqrcode/qrlib.php';
                    $directorioQR = "../../../public/qr-students/";

                    if (!file_exists($directorioQR)) {
                        mkdir($directorioQR, 0777, true);
                    }

                    try {
                        $infoEstudiante = $this->controller->Mostrar($idEstudiante);

                        if (empty($infoEstudiante)) {
                            $arrayResponse = array('status' => false, 'msg' => 'Estudiante no encontrado');
                            echo json_encode($arrayResponse);
                            break;
                        }

                        $docEstudiante = $infoEstudiante['docEstudiante'];
                        $nombreQR      = "qr_" . $docEstudiante . ".png";
                        $rutaQR        = $directorioQR . $nombreQR;

                        // Eliminar archivo anterior si existe
                        if (file_exists($rutaQR)) {
                            unlink($rutaQR);
                        }

                        // Generar QR
                        QRcode::png($docEstudiante, $rutaQR, "L", 10, 5);

                        if (!file_exists($rutaQR)) {
                            $arrayResponse = array('status' => false, 'msg' => 'Error al generar el QR');
                            echo json_encode($arrayResponse);
                            break;
                        }

                        $rspta = $this->controller->ActualizarQR($idEstudiante, $nombreQR);

                        if ($rspta) {
                            $arrayResponse = array('status' => true, 'msg' => 'QR generado correctamente');
                        } else {
                            if (file_exists($rutaQR)) unlink($rutaQR);
                            $arrayResponse = array('status' => false, 'msg' => 'Error al actualizar en BD');
                        }
                    } catch (Exception $e) {
                        $arrayResponse = array('status' => false, 'msg' => 'Error: ' . $e->getMessage());
                    }

                    echo json_encode($arrayResponse);
                }
                break;
        }
    }
}
$route = new EstuanteRoutes();
$op = $_REQUEST["op"];
$route->estudianteMethod($op);
