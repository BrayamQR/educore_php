<?php
require_once("../database/DBExecutor.php");

class GenericListModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function ListarPerfil()
    {
        $sql = "SELECT * FROM perfil where vigente = 1 AND estado = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarDocente()
    {
        $sql = "SELECT * FROM docente where vigente = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarAula()
    {
        $sql = "SELECT a.*, g.desc_grado FROM aula AS a INNER JOIN grado AS g ON a.id_grado = g.id_grado WHERE a.vigente = 1;";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarEstudiante()
    {
        $sql = "SELECT * FROM estudiante WHERE vigente = 1";
        return $this->db->queryExecute($sql, []);
    }
}
