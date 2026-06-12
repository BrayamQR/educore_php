<?php
require_once '../database/DBExecutor.php';

class HistorialModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor;
    }

    public function Listar()
    {
        $sql = "SELECT 
                    asi.id_asistencia,
                    e.doc_estudiante,
                    e.apa_estudiante,
                    e.ama_estudiante,
                    e.nom_estudiante,
                    au.seccion_aula,
                    g.id_grado,
                    g.desc_grado,
                    n.id_nivel,
                    n.desc_nivel,
                    asi.fecha_asistencia,
                    asi.hora_asistencia,
                    asi.id_estado,
                    CASE 
                        WHEN asi.id_estado = 1 THEN 'ASISTIÓ'
                        WHEN asi.id_estado = 2 THEN 'TARDE'
                        WHEN asi.id_estado = 3 THEN 'FALTA'
                        WHEN asi.id_estado = 4 THEN 'JUSTIFICADO'
                    END AS estado
                FROM asistencia AS asi
                INNER JOIN estudiante AS e  ON asi.id_estudiante = e.id_estudiante
                INNER JOIN aula       AS au ON e.id_aula         = au.id_aula
                INNER JOIN grado      AS g  ON au.id_grado       = g.id_grado
                INNER JOIN nivel      AS n  ON au.id_nivel       = n.id_nivel
                WHERE e.vigente = 1
                ORDER BY asi.fecha_asistencia DESC, e.apa_estudiante, e.ama_estudiante;";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarFechasPendientes()
    {
        $sql = "SELECT 
                fechas.fecha_asistencia AS fecha,
                COUNT(DISTINCT e.id_estudiante) AS total_alumnos,
                COUNT(DISTINCT e.id_estudiante) - COUNT(DISTINCT a.id_estudiante) AS total_faltas
            FROM (
                SELECT DISTINCT fecha_asistencia 
                FROM asistencia
            ) fechas
            CROSS JOIN estudiante e
            LEFT JOIN asistencia a 
                ON e.id_estudiante = a.id_estudiante 
                AND a.fecha_asistencia = fechas.fecha_asistencia
            LEFT JOIN feriado fer 
                ON fechas.fecha_asistencia = fer.fecha_feriado
            LEFT JOIN cierre_dia cd 
                ON fechas.fecha_asistencia = cd.fecha_cierre
            WHERE e.vigente = 1
            AND e.id_aula = 5
            AND fer.fecha_feriado IS NULL
            AND cd.fecha_cierre IS NULL
            AND fechas.fecha_asistencia <= CURDATE()
            GROUP BY fechas.fecha_asistencia
            ORDER BY fechas.fecha_asistencia DESC;";
        return $this->db->queryExecute($sql, []);
    }

    public function RealizarCierre($fecha)
    {
        $sqlFaltas = "INSERT INTO asistencia (fecha_asistencia, hora_asistencia, id_estado, id_estudiante)
                  SELECT ?, NULL, 3, e.id_estudiante
                  FROM estudiante e
                  WHERE e.vigente = 1
                  AND e.id_aula = 5
                  AND e.id_estudiante NOT IN (
                      SELECT id_estudiante 
                      FROM asistencia 
                      WHERE fecha_asistencia = ?
                  );";
        $this->db->queryExecute($sqlFaltas, [$fecha, $fecha]);

        $sqlCierre = "INSERT INTO cierre_dia (fecha_cierre) VALUES (?);";
        return $this->db->queryExecute($sqlCierre, [$fecha]);
    }

    public function TieneRegistrosHoy()
    {
        $sql = "SELECT COUNT(*) AS total 
            FROM asistencia 
            WHERE fecha_asistencia = CURDATE()";
        $result = $this->db->queryExecute($sql, []);
        return $result[0]['total'] > 0;
    }
    public function ListarFaltas()
    {
        $sql = "SELECT 
                asi.id_asistencia,
                e.doc_estudiante,
                e.apa_estudiante,
                e.ama_estudiante,
                e.nom_estudiante,
                au.seccion_aula,
                g.id_grado,
                g.desc_grado,
                n.id_nivel,
                n.desc_nivel,
                asi.fecha_asistencia
            FROM asistencia AS asi
            INNER JOIN estudiante AS e  ON asi.id_estudiante = e.id_estudiante
            INNER JOIN aula       AS au ON e.id_aula         = au.id_aula
            INNER JOIN grado      AS g  ON au.id_grado       = g.id_grado
            INNER JOIN nivel      AS n  ON au.id_nivel       = n.id_nivel
            WHERE asi.id_estado = 3
            AND e.vigente = 1
            ORDER BY asi.fecha_asistencia DESC, e.apa_estudiante, e.ama_estudiante;";
        return $this->db->queryExecute($sql, []);
    }

    public function JustificarFalta($idAsistencia)
    {
        $sql = "UPDATE asistencia SET id_estado = 4 WHERE id_asistencia = ?";
        return $this->db->queryExecute($sql, [$idAsistencia]);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $estado)
    {
        $sql = "SELECT 
                a.id_asistencia,
                a.fecha_asistencia,
                a.hora_asistencia,
                a.id_estado,
                e.id_estudiante,
                e.doc_estudiante,
                e.nom_estudiante,
                e.apa_estudiante,
                e.ama_estudiante,
                g.id_grado,
                g.desc_grado,
                au.seccion_aula,
                n.id_nivel,
                n.desc_nivel,
                CASE 
                    WHEN a.id_estado = 1 THEN 'ASISTIÓ'
                    WHEN a.id_estado = 2 THEN 'TARDE'
                    WHEN a.id_estado = 3 THEN 'FALTA'
                    WHEN a.id_estado = 4 THEN 'JUSTIFICADO'
                END AS estado
            FROM asistencia AS a
            INNER JOIN estudiante AS e  ON a.id_estudiante = e.id_estudiante
            INNER JOIN aula       AS au ON au.id_aula      = e.id_aula
            INNER JOIN grado      AS g  ON g.id_grado      = au.id_grado
            INNER JOIN nivel      AS n  ON n.id_nivel      = au.id_nivel
            WHERE e.vigente = 1";

        $params = [];

        if (!empty($dato)) {
            $sql .= " AND (
            e.doc_estudiante LIKE ? OR
            e.nom_estudiante LIKE ? OR
            e.apa_estudiante LIKE ? OR
            e.ama_estudiante LIKE ? OR
            g.desc_grado     LIKE ? OR
            au.seccion_aula  LIKE ? OR
            n.desc_nivel     LIKE ?
        )";
            $like = "%{$dato}%";
            array_push($params, $like, $like, $like, $like, $like, $like, $like);
        }

        if (!empty($fechaInicio)) {
            $sql .= " AND a.fecha_asistencia >= ?";
            $params[] = $fechaInicio;
        }

        if (!empty($fechaFin)) {
            $sql .= " AND a.fecha_asistencia <= ?";
            $params[] = $fechaFin;
        }

        if (!empty($estado)) {
            $sql .= " AND a.id_estado = ?";
            $params[] = $estado;
        }

        $sql .= " ORDER BY a.fecha_asistencia DESC, e.apa_estudiante, e.ama_estudiante";

        return $this->db->queryExecute($sql, $params);
    }

    public function ReportePorEstudiante($estudiante, $fechaInicio, $fechaFin, $estado)
    {
        $where = " WHERE e.vigente = 1";
        $params = [];

        if (!empty($estudiante)) {
            $where .= " AND e.id_estudiante = ?";
            $params[] = $estudiante;
        }
        if (!empty($fechaInicio)) {
            $where .= " AND asi.fecha_asistencia >= ?";
            $params[] = $fechaInicio;
        }
        if (!empty($fechaFin)) {
            $where .= " AND asi.fecha_asistencia <= ?";
            $params[] = $fechaFin;
        }
        if (!empty($estado)) {
            $where .= " AND asi.id_estado = ?";
            $params[] = $estado;
        }

        $joins = "FROM asistencia AS asi
              INNER JOIN estudiante AS e  ON asi.id_estudiante = e.id_estudiante
              INNER JOIN aula       AS au ON e.id_aula         = au.id_aula
              INNER JOIN grado      AS g  ON au.id_grado       = g.id_grado
              INNER JOIN nivel      AS n  ON au.id_nivel       = n.id_nivel";

        $sqlResumen = "SELECT 
                    e.doc_estudiante,
                    e.apa_estudiante,
                    e.ama_estudiante,
                    e.nom_estudiante,
                    au.seccion_aula,
                    g.desc_grado,
                    n.desc_nivel,
                    COUNT(asi.id_asistencia)                           AS total,
                    SUM(asi.id_estado = 1)                             AS asistencias,
                    SUM(asi.id_estado = 2)                             AS tardanzas,
                    SUM(asi.id_estado = 3)                             AS faltas,
                    SUM(asi.id_estado = 4)                             AS justificados,
                    ROUND(SUM(asi.id_estado = 1) / COUNT(*) * 100, 1) AS porcentaje_asistencia
                $joins $where
                GROUP BY e.id_estudiante
                ORDER BY e.apa_estudiante, e.ama_estudiante";

        $sqlDetalle = "SELECT 
                    e.doc_estudiante,
                    asi.fecha_asistencia,
                    asi.hora_asistencia,
                    asi.id_estado,
                    CASE 
                        WHEN asi.id_estado = 1 THEN 'ASISTIÓ'
                        WHEN asi.id_estado = 2 THEN 'TARDE'
                        WHEN asi.id_estado = 3 THEN 'FALTA'
                        WHEN asi.id_estado = 4 THEN 'JUSTIFICADO'
                    END AS estado
                $joins $where
                ORDER BY e.apa_estudiante, e.ama_estudiante, asi.fecha_asistencia";

        return $this->_combinarResumenDetalle($sqlResumen, $sqlDetalle, $params);
    }

    // ── POR FECHA ────────────────────────────────────────────────
    public function ReportePorFecha($fecha, $idAula, $estado)
    {
        $where = " WHERE e.vigente = 1";
        $params = [];

        if (!empty($fecha)) {
            $where .= " AND asi.fecha_asistencia = ?";
            $params[] = $fecha;
        }
        if (!empty($idAula)) {
            $where .= " AND au.id_aula = ?";
            $params[] = $idAula;
        }
        if (!empty($estado)) {
            $where .= " AND asi.id_estado = ?";
            $params[] = $estado;
        }

        $joins = "FROM asistencia AS asi
              INNER JOIN estudiante AS e  ON asi.id_estudiante = e.id_estudiante
              INNER JOIN aula       AS au ON e.id_aula         = au.id_aula
              INNER JOIN grado      AS g  ON au.id_grado       = g.id_grado
              INNER JOIN nivel      AS n  ON au.id_nivel       = n.id_nivel";

        $sqlResumen = "SELECT 
                    e.doc_estudiante,
                    e.apa_estudiante,
                    e.ama_estudiante,
                    e.nom_estudiante,
                    au.seccion_aula,
                    g.desc_grado,
                    n.desc_nivel,
                    COUNT(asi.id_asistencia)                           AS total,
                    SUM(asi.id_estado = 1)                             AS asistencias,
                    SUM(asi.id_estado = 2)                             AS tardanzas,
                    SUM(asi.id_estado = 3)                             AS faltas,
                    SUM(asi.id_estado = 4)                             AS justificados,
                    ROUND(SUM(asi.id_estado = 1) / COUNT(*) * 100, 1) AS porcentaje_asistencia
                $joins $where
                GROUP BY e.id_estudiante
                ORDER BY e.apa_estudiante, e.ama_estudiante";

        $sqlDetalle = "SELECT 
                    e.doc_estudiante,
                    asi.fecha_asistencia,
                    asi.hora_asistencia,
                    asi.id_estado,
                    CASE 
                        WHEN asi.id_estado = 1 THEN 'ASISTIÓ'
                        WHEN asi.id_estado = 2 THEN 'TARDE'
                        WHEN asi.id_estado = 3 THEN 'FALTA'
                        WHEN asi.id_estado = 4 THEN 'JUSTIFICADO'
                    END AS estado
                $joins $where
                ORDER BY e.apa_estudiante, e.ama_estudiante, asi.fecha_asistencia";

        return $this->_combinarResumenDetalle($sqlResumen, $sqlDetalle, $params);
    }

    // ── RESUMEN POR PERIODO ───────────────────────────────────────
    public function ReportePorPeriodo($fechaInicio, $fechaFin, $idAula, $estado)
    {
        $where = " WHERE e.vigente = 1";
        $params = [];

        if (!empty($fechaInicio)) {
            $where .= " AND asi.fecha_asistencia >= ?";
            $params[] = $fechaInicio;
        }
        if (!empty($fechaFin)) {
            $where .= " AND asi.fecha_asistencia <= ?";
            $params[] = $fechaFin;
        }
        if (!empty($idAula)) {
            $where .= " AND au.id_aula = ?";
            $params[] = $idAula;
        }
        if (!empty($estado)) {
            $where .= " AND asi.id_estado = ?";
            $params[] = $estado;
        }

        $joins = "FROM asistencia AS asi
              INNER JOIN estudiante AS e  ON asi.id_estudiante = e.id_estudiante
              INNER JOIN aula       AS au ON e.id_aula         = au.id_aula
              INNER JOIN grado      AS g  ON au.id_grado       = g.id_grado
              INNER JOIN nivel      AS n  ON au.id_nivel       = n.id_nivel";

        $sqlResumen = "SELECT 
                    e.doc_estudiante,
                    e.apa_estudiante,
                    e.ama_estudiante,
                    e.nom_estudiante,
                    au.seccion_aula,
                    g.desc_grado,
                    n.desc_nivel,
                    COUNT(asi.id_asistencia)                           AS total,
                    SUM(asi.id_estado = 1)                             AS asistencias,
                    SUM(asi.id_estado = 2)                             AS tardanzas,
                    SUM(asi.id_estado = 3)                             AS faltas,
                    SUM(asi.id_estado = 4)                             AS justificados,
                    ROUND(SUM(asi.id_estado = 1) / COUNT(*) * 100, 1) AS porcentaje_asistencia
                $joins $where
                GROUP BY e.id_estudiante
                ORDER BY e.apa_estudiante, e.ama_estudiante";

        $sqlDetalle = "SELECT 
                    e.doc_estudiante,
                    asi.fecha_asistencia,
                    asi.hora_asistencia,
                    asi.id_estado,
                    CASE 
                        WHEN asi.id_estado = 1 THEN 'ASISTIÓ'
                        WHEN asi.id_estado = 2 THEN 'TARDE'
                        WHEN asi.id_estado = 3 THEN 'FALTA'
                        WHEN asi.id_estado = 4 THEN 'JUSTIFICADO'
                    END AS estado
                $joins $where
                ORDER BY e.apa_estudiante, e.ama_estudiante, asi.fecha_asistencia";

        return $this->_combinarResumenDetalle($sqlResumen, $sqlDetalle, $params);
    }

    // ── HELPER PRIVADO ────────────────────────────────────────────
    private function _combinarResumenDetalle($sqlResumen, $sqlDetalle, $params)
    {
        $resumen = $this->db->queryExecute($sqlResumen, $params);
        $detalle = $this->db->queryExecute($sqlDetalle, $params);

        $detallePorEstudiante = [];
        foreach ($detalle as $row) {
            $detallePorEstudiante[$row['doc_estudiante']][] = $row;
        }

        foreach ($resumen as &$est) {
            $est['detalle'] = $detallePorEstudiante[$est['doc_estudiante']] ?? [];
        }

        return $resumen;
    }
}
