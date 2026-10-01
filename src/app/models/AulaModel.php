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
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return [];
        $idAnioLectivo = $anioLectivo['id_aniolectivo'];

        $sql = "SELECT 
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
                    al.vigencia = 1 AND anl.id_aniolectivo = ?
                ORDER BY 
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
        ";
        return $this->db->queryExecute($sql, [$idAnioLectivo]);
    }

    public function ListarAulas()
    {
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return [];
        $idAnioLectivo = $anioLectivo['id_aniolectivo'];

        $sql = "SELECT 
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
                    AND (al.id_aulalectiva IS NULL OR al.vigencia = 0)
                ORDER BY n.id_nivel, g.id_grado;
        ";
        return $this->db->queryExecute($sql, [$idAnioLectivo]);
    }

    public function Buscar($dato, $idNivelAcademico, $idTurnoAcademico, $idAnioLectivo)
    {
        $sql = "SELECT 
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
                    al.vigencia = 1 ";
        $params = [];

        if (!empty($dato)) {
            $sql .= " AND (
                g.desc_grado    LIKE ? OR
                a.seccion_aula  LIKE ? 
            )";
            $like = "%{$dato}%";
            array_push($params, $like, $like);
        }
        if (!empty($idNivelAcademico)) {
            $sql .= " AND n.id_nivel = ?";
            $params[] = $idNivelAcademico;
        }
        if (!empty($idTurnoAcademico)) {
            $sql .= " AND ta.id_turno = ?";
            $params[] = $idTurnoAcademico;
        }
        $sql .= " AND anl.id_aniolectivo = ?
                GROUP BY
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
                    ta.nom_turno";
        $params[] = $idAnioLectivo;

        return $this->db->queryExecute($sql, $params);
    }
    public function Mostrar($id)
    {
        $sql = "SELECT 
                    al.id_aulalectiva   AS idAulaLectiva,
                    a.id_aula           AS idAula,
                    anl.id_aniolectivo  AS idAnioLectivo,
                    anl.anio            AS anio,
                    d.id_docente        AS idDocente,
                    d.nom_docente       AS nomDocente,
                    g.id_grado          AS idGrado, 
                    g.desc_grado        AS descGrado,
                    n.id_nivel          AS idNivel, 
                    n.desc_nivel        AS descNivel,
                    a.seccion_aula      AS seccionAula,
                    ta.id_turno         AS idTurno,
                    ta.nom_turno        AS nomTurno
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
                    al.vigencia = 1 AND
                    al.id_aulalectiva = ?";
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

    public function Editar($idAulaLectiva, $idDocente, $idTurno)
    {
        $sql = "UPDATE aulalectiva SET id_docente = ?, id_turno = ? WHERE id_aulalectiva = ?";
        return $this->db->queryExecute($sql, [$idDocente, $idTurno, $idAulaLectiva]);
    }
    public function Eliminar($id)
    {
        $sql = "UPDATE aulalectiva SET vigencia = 0 WHERE id_aulalectiva = ?";
        return $this->db->queryExecute($sql, [$id]);
    }
}
