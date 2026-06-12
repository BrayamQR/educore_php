<?php
require_once __DIR__ . '/../controllers/menu.controller.php';

class MenuRoutes
{
    private $controller;
    public function __construct()
    {
        $this->controller = new MenuController();
    }

    private function sortByOrden(&$items)
    {
        usort($items, function ($a, $b) {
            return intval($a['orden_menu']) <=> intval($b['orden_menu']);
        });
    }

    public function menuMethod($op)
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
                    $map = [];
                    foreach ($rspta as $item) {
                        $item['children'] = [];
                        $map[$item['id_menu']] = $item;
                    }

                    $tree = [];
                    foreach ($map as $idMenu => $item) {
                        if (intval($item['id_menupadre']) === 0) {
                            $tree[] = &$map[$idMenu];
                        } else {
                            $padre = intval($item['id_menupadre']);
                            if (isset($map[$padre])) {
                                $map[$padre]['children'][] = &$map[$idMenu];
                            }
                        }
                    }

                    $sortRecursive = function (&$nodes) use (&$sortRecursive) {
                        $this->sortByOrden($nodes);
                        foreach ($nodes as &$n) {
                            if (!empty($n['children'])) {
                                $sortRecursive($n['children']);
                            }
                        }
                    };
                    $sortRecursive($tree);

                    $arrayResponse = array(
                        'status' => true,
                        'data' => $tree
                    );
                }
                echo json_encode($arrayResponse);

                break;
            case 'listarByPerfil':
                if ($_POST) {
                    $id = intval($_POST['id']);
                    $rspta = $this->controller->listarByPerfil($id);
                    if (empty($rspta)) {
                        $arrayResponse = array(
                            'status' => false,
                            'msg' => 'Datos no encontrados'
                        );
                    } else {
                        $map = [];
                        foreach ($rspta as $item) {
                            $item['children'] = [];
                            $map[$item['id_menu']] = $item;
                        }

                        $tree = [];
                        foreach ($map as $idMenu => $item) {
                            if (intval($item['id_menupadre']) === 0) {
                                $tree[] = &$map[$idMenu];
                            } else {
                                $padre = intval($item['id_menupadre']);
                                if (isset($map[$padre])) {
                                    $map[$padre]['children'][] = &$map[$idMenu];
                                }
                            }
                        }

                        $sortRecursive = function (&$nodes) use (&$sortRecursive) {
                            $this->sortByOrden($nodes);
                            foreach ($nodes as &$n) {
                                if (!empty($n['children'])) {
                                    $sortRecursive($n['children']);
                                }
                            }
                        };
                        $sortRecursive($tree);

                        $arrayResponse = array(
                            'status' => true,
                            'data' => $tree
                        );
                    }
                    echo json_encode($arrayResponse);
                }
                break;
        }
    }
}

if (basename(__FILE__) === basename($_SERVER['SCRIPT_FILENAME'])) {
    $route = new MenuRoutes();
    $op = $_REQUEST["op"];
    $route->menuMethod($op);
}
