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
        $sql = "SELECT * from menu WHERE vigente = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function listarByPerfil($id)
    {
        $sql = "SELECT m.* FROM menu as m INNER JOIN menubyperfil as mp ON m.id_menu = mp.id_menu WHERE mp.vigente = 1 AND m.vigente = 1 AND mp.id_perfil = ? ";

        return $this->db->queryExecute($sql, [$id]);
    }
}
