<?php
require_once __DIR__ . "/../database/DBExecutor.php";

class GenericListModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function ListarPerfil()
    {
        $sql = "SELECT * FROM perfil where vigencia = 1 AND estado = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarDocente()
    {
        $sql = "SELECT * FROM docente where vigencia = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarAula()
    {
        $sql = "SELECT a.*, g.desc_grado FROM aula AS a INNER JOIN grado AS g ON a.id_grado = g.id_grado WHERE a.vigencia = 1;";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarEstudiante()
    {
        $sql = "SELECT * FROM estudiante WHERE vigencia = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarTipoDiaNoLectivo()
    {
        $sql = "SELECT * FROM tipodianolectivo WHERE vigencia = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarAnioLectivo()
    {
        $sql = "SELECT * FROM aniolectivo WHERE vigencia = 1 AND estado !=1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarTipoParticipante()
    {
        $sql = "SELECT * FROM tm_tipoparticipante WHERE vigencia = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarTipoActividad()
    {
        $sql = "SELECT * FROM tm_tipoactividad WHERE vigencia = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarTiposEvento()
    {
        $sql = "SELECT
                CONCAT('actividad_', id_tipoactividad) AS value,
                desc_tipoactividad AS label
            FROM tm_tipoactividad
            WHERE vigencia = 1

            UNION ALL

            SELECT
                CONCAT('dianolectivo_', id_tipodianolectivo) AS value,
                nom_tipodianolectivo AS label
            FROM tipodianolectivo
            WHERE vigencia = 1

            ORDER BY label ASC";

        return $this->db->queryExecute($sql, []);
    }
}
