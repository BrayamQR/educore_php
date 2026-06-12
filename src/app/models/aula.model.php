<?php
require_once '../database/DBExecutor.php';

class AulaModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function Listar()
    {
        $sql = "SELECT a.*, d.nom_docente, n.desc_nivel, g.desc_grado FROM aula AS a INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN docente AS d ON a.id_docente = d.id_docente WHERE a.vigente = 1 AND d.vigente = 1;";
        return $this->db->queryExecute($sql, []);
    }
    public function Buscar($dato)
    {
        $sql = "SELECT a.*, d.nom_docente, n.desc_nivel, g.desc_grado FROM aula AS a INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN docente AS d ON a.id_docente = d.id_docente WHERE a.vigente = 1 AND d.vigente = 1 AND (d.nom_docente LIKE ? OR a.seccion_aula LIKE ? OR n.desc_nivel LIKE ? OR g.desc_grado LIKE ?);";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato, $dato, $dato, $dato]);
    }
    public function Mostrar($id)
    {
        $sql = "SELECT a.id_aula AS idAula, g.id_grado AS idGrado, g.desc_grado AS descGrado, n.id_nivel AS idNivel, n.desc_nivel AS descNivel, a.seccion_aula AS seccionAula, d.id_docente AS idDocente, d.nom_docente as nomDocente FROM aula AS a INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel INNER JOIN docente AS d ON a.id_docente = d.id_docente WHERE id_aula = ? AND a.vigente = 1 AND d.vigente = 1";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }
    public function Registrar($idNivel, $idGrado, $seccionAula, $idDocente)
    {
        $sql = "INSERT INTO aula(id_grado, id_nivel, seccion_aula, id_docente) VALUES (?,?,?,?)";
        return $this->db->queryExecute($sql, [$idGrado, $idNivel, $seccionAula, $idDocente]);
    }
    public function Editar($idAula,  $idNivel, $idGrado, $seccionAula, $idDocente)
    {
        $sql = "UPDATE aula SET id_grado = ?, id_nivel = ?, seccion_aula = ?, id_docente = ? WHERE id_aula = ?";
        return $this->db->queryExecute($sql, [$idGrado, $idNivel, $seccionAula, $idDocente, $idAula]);
    }
    public function Eliminar($id)
    {
        $sql = "UPDATE aula SET vigente = 0 WHERE id_aula = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }
}
