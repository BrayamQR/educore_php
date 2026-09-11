<?php

namespace App\models;

use App\database\DBExecutor;
use App\models\AnioLectivoModel;
use Exception;

class AulaModel
{
    private DBExecutor $db;
    private AnioLectivoModel $anioModel;

    public function __construct()
    {
        $this->db = new DBExecutor();
        $this->anioModel = new AnioLectivoModel();
    }

    public function Listar()
    {
        $sql = "
            SELECT 
                al.id_aulalectiva,
                a.id_aula,
                anl.id_aniolectivo,
                anl.anio,
                d.id_docente,
                d.nom_docente,
                g.id_grado, 
                g.desc_grado,
                n.id_nivel, 
                n.desc_nivel,
                a.seccion_aula,
                ta.id_turno,
                ta.nom_turno
            FROM aulalectiva AS al 
                INNER JOIN aula AS a 
                    ON al.id_aula = a.id_aula
                        AND a.vigencia = 1
                INNER JOIN grado AS g
                    ON g.id_grado = a.id_grado
                        AND g.vigencia = 1
                INNER JOIN nivel as n
                    ON n.id_nivel = g.id_nivel
                        AND n.vigencia = 1
                INNER JOIN aniolectivo AS anl
                    ON anl.id_aniolectivo = al.id_aniolectivo
                        AND anl.vigencia = 1
                INNER JOIN docente as d 
                    ON d.id_docente = al.id_docente
                        AND d.vigencia = 1
                INNER JOIN tm_turnoacademico as ta
                    ON ta.id_turno = al.id_turno
                        AND ta.vigencia = 1
            WHERE 
                al.vigencia = 1
            ORDER BY 
                n.id_nivel
        ";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarAulas()
    {
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return [];
        $idAnioLectivo = $anioLectivo['id_aniolectivo'];

        $sql = "
            SELECT 
                a.id_aula,
                g.id_grado,
                g.desc_grado,
                n.id_nivel,
                n.desc_nivel,
                a.seccion_aula
            FROM aula AS a
            LEFT JOIN aulalectiva AS al 
                ON al.id_aula = a.id_aula 
                    AND al.id_aniolectivo = ?
            INNER JOIN grado AS g
                ON g.id_grado = a.id_grado
                    AND g.vigencia = 1
            INNER JOIN nivel AS n
                ON n.id_nivel = g.id_nivel
                    AND n.vigencia  = 1
            WHERE a.vigencia = 1
                AND al.id_aulalectiva IS NULL;
        ";
        return $this->db->queryExecute($sql, [$idAnioLectivo]);
    }

    public function Buscar($dato)
    {
        $sql = "SELECT a.*, d.nom_docente, n.desc_nivel, g.desc_grado FROM aula AS a INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN docente AS d ON a.id_docente = d.id_docente WHERE a.vigencia = 1 AND d.vigencia = 1 AND (d.nom_docente LIKE ? OR a.seccion_aula LIKE ? OR n.desc_nivel LIKE ? OR g.desc_grado LIKE ?);";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato, $dato, $dato, $dato]);
    }
    public function Mostrar($id)
    {
        $sql = "SELECT a.id_aula AS idAula, g.id_grado AS idGrado, g.desc_grado AS descGrado, n.id_nivel AS idNivel, n.desc_nivel AS descNivel, a.seccion_aula AS seccionAula, d.id_docente AS idDocente, d.nom_docente as nomDocente FROM aula AS a INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel INNER JOIN docente AS d ON a.id_docente = d.id_docente WHERE id_aula = ? AND a.vigencia = 1 AND d.vigencia = 1";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }
    public function Registrar($idNivel, $idGrado, $seccionAula, $idDocente)
    {
        $sql = "INSERT INTO aula(id_grado, id_nivel, seccion_aula, id_docente) VALUES (?,?,?,?)";
        return $this->db->queryExecute($sql, [$idGrado, $idNivel, $seccionAula, $idDocente]);
    }

    public function RegistrarAula($idGrado, $seccionAula)
    {
        $sql = "INSERT INTO aula( id_grado, seccion_aula) VALUES (?,?)";
        return $this->db->queryExecute($sql, [$idGrado, $seccionAula]);
    }

    public function RegistrarAulaLectiva(
        $idAula,
        $idAnioLectivo,
        $idDocente,
        $idTurno
    ) {
        $sql = "INSERT INTO aulalectiva(id_aula, id_aniolectivo, id_docente, id_turno) VALUES (?,?,?,?)";
        return $this->db->queryExecute($sql, [$idAula, $idAnioLectivo, $idDocente, $idTurno]);
    }

    public function RegistrarCompleto(
        $idGrado,
        $seccionAula,
        $idAnioLectivo,
        $idDocente,
        $idTurno
    ) {
        try {
            $this->db->beginTransaction();
            $this->RegistrarAula($idGrado, $seccionAula);
            $idAula = $this->db->lastInsertId();
            $this->RegistrarAulaLectiva($idAula, $idAnioLectivo, $idDocente, $idTurno);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en RegistrarCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function Editar($idAula,  $idNivel, $idGrado, $seccionAula, $idDocente)
    {
        $sql = "UPDATE aula SET id_grado = ?, id_nivel = ?, seccion_aula = ?, id_docente = ? WHERE id_aula = ?";
        return $this->db->queryExecute($sql, [$idGrado, $idNivel, $seccionAula, $idDocente, $idAula]);
    }
    public function Eliminar($id)
    {
        $sql = "UPDATE aula SET vigencia = 0 WHERE id_aula = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }
}
