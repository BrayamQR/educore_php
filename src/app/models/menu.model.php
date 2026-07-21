<?php
require_once __DIR__ . '/../database/DBExecutor.php';

class MenuModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function Listar()
    {
        $sql = "SELECT * from menu WHERE vigencia = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function listarByPerfil($id)
    {
        $sql = "SELECT m.* FROM menu as m INNER JOIN menubyperfil as mp ON m.id_menu = mp.id_menu WHERE mp.vigencia = 1 AND m.vigencia = 1 AND mp.id_perfil = ? ";

        return $this->db->queryExecute($sql, [$id]);
    }
}
