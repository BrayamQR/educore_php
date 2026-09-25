<?php

namespace App\models;

use App\database\DBExecutor;

class MenuModel
{
    private DBExecutor $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function Listar()
    {
        $sql = "SELECT * from menu WHERE vigencia = 1";
        $rows = $this->db->queryExecute($sql, []);
        return $this->buildTree($rows);
    }

    public function listarByPerfil($id)
    {
        $sql = "SELECT m.* FROM menu as m INNER JOIN menubyperfil as mp ON m.id_menu = mp.id_menu WHERE mp.vigencia = 1 AND m.vigencia = 1 AND mp.id_perfil = ? ";
        $rows = $this->db->queryExecute($sql, [$id]);
        return $this->buildTree($rows);
    }

    private function buildTree(array $rows): array
    {
        if (empty($rows)) return [];

        $nodosPorId = [];
        foreach ($rows as $row) {
            $row['children'] = [];
            $nodosPorId[$row['id_menu']] = $row;
        }

        foreach ($nodosPorId as $idMenu => $nodo) {
            $idPadre = (int)$nodo['id_menupadre'];
            if ($idPadre !== 0 && isset($nodosPorId[$idPadre])) {
                $nodosPorId[$idPadre]['children'][] = $nodo;
            }
        }

        $arbol = [];
        foreach ($nodosPorId as $nodo) {
            if ((int)$nodo['id_menupadre'] === 0) {
                $arbol[] = $nodo;
            }
        }

        usort($arbol, fn($a, $b) => (int)$a['orden_menu'] <=> (int)$b['orden_menu']);

        foreach ($arbol as &$nodo) {
            usort($nodo['children'], fn($a, $b) => (int)$a['orden_menu'] <=> (int)$b['orden_menu']);
        }
        unset($nodo);

        return $arbol;
    }
}
