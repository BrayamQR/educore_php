<?php
require_once __DIR__ . '/../database/DBExecutor.php';

class AnioAcademicoModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function Listar()
    {
        $sql = "SELECT al.*,
                    (SELECT COUNT(*) FROM periodo p WHERE p.id_aniolectivo = al.id_aniolectivo AND p.vigencia = 1) as total_periodos,
                    (SELECT COUNT(*) FROM periodo p WHERE p.id_aniolectivo = al.id_aniolectivo 
                        AND p.vigencia = 1
                        AND p.fecha_inicio IS NOT NULL 
                        AND p.fecha_fin IS NOT NULL) as periodos_configurados
                FROM aniolectivo al
                WHERE al.vigencia = 1
                ORDER BY al.anio DESC";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar($dato)
    {
        $sql = "SELECT al.*,
                    (SELECT COUNT(*) FROM periodo p WHERE p.id_aniolectivo = al.id_aniolectivo AND p.vigencia = 1) as total_periodos,
                    (SELECT COUNT(*) FROM periodo p WHERE p.id_aniolectivo = al.id_aniolectivo 
                        AND p.vigencia = 1
                        AND p.fecha_inicio IS NOT NULL 
                        AND p.fecha_fin IS NOT NULL) as periodos_configurados
                FROM aniolectivo al
                WHERE al.vigencia = 1 AND al.anio LIKE ?";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato]);
    }

    public function Registrar($anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        $sql = "INSERT INTO aniolectivo(anio, fecha_inicio, fecha_fin, id_tipoperiodo) VALUES (?,?,?,?)";
        return $this->db->queryExecute($sql, [$anio, $fechaInicio, $fechaFin, $idTipoPeriodo]);
    }

    public function GenerarPeriodos($idAnioLectivo, $idTipoPeriodo)
    {
        $cantidad = $idTipoPeriodo == 1 ? 4 : 3;
        $label = $idTipoPeriodo == 1 ? 'Bimestre' : 'Trimestre';
        $romanos  = ['I', 'II', 'III', 'IV'];
        $colores  = ['#2563eb', '#16a34a', '#d97706', '#7c3aed'];
        $sql = "INSERT INTO periodo(id_aniolectivo, desc_periodo, orden_periodo,color) VALUES (?,?,?,?)";
        for ($i = 0; $i < $cantidad; $i++) {
            $this->db->queryExecute($sql, [
                $idAnioLectivo,
                "{$romanos[$i]} {$label}",
                $i + 1,
                $colores[$i]
            ]);
        }
        return true;
    }

    public function RegistrarCompleto($anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        try {
            $this->db->beginTransaction();
            $this->Registrar($anio, $fechaInicio, $fechaFin, $idTipoPeriodo);
            $idAnioLectivo = $this->db->lastInsertId();
            $this->GenerarPeriodos($idAnioLectivo, $idTipoPeriodo);
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en RegistrarCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function Editar($idAnioLectivo, $anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        $sql = "UPDATE aniolectivo SET anio=?,fecha_inicio=?,fecha_fin=?,id_tipoperiodo=? WHERE id_aniolectivo=?";
        return $this->db->queryExecute($sql, [$anio, $fechaInicio, $fechaFin, $idTipoPeriodo, $idAnioLectivo]);
    }

    public function EditarCompleto($idAnioLectivo, $anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        try {
            $this->db->beginTransaction();
            $actual = $this->Mostrar($idAnioLectivo);
            if (!$actual) {
                throw new Exception("Año lectivo no encontrado");
            }
            $cambioFechas = $actual['fechaInicio'] !== $fechaInicio || $actual['fechaFin'] !== $fechaFin;
            $cambioTipoPeriodo = (string)$actual['idTipoPeriodo'] !== $idTipoPeriodo;

            $this->Editar($idAnioLectivo, $anio, $fechaInicio, $fechaFin, $idTipoPeriodo);

            if ($cambioTipoPeriodo) {
                $this->EliminarPeriodos($idAnioLectivo);
                $this->GenerarPeriodos($idAnioLectivo, $idTipoPeriodo);
            } else if ($cambioFechas) {
                $this->ResetearPeriodos($idAnioLectivo);
            }
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en EditarrCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE aniolectivo SET vigencia = 0 WHERE id_aniolectivo = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }



    public function Mostrar($id)
    {
        $sql = "SELECT id_aniolectivo AS idAnioLectivo, anio AS anio, fecha_inicio AS fechaInicio, fecha_fin AS fechaFin, id_tipoperiodo AS idTipoPeriodo FROM aniolectivo WHERE id_aniolectivo = ?";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }

    public function ObtenerPeriodos($id)
    {
        $sql = "SELECT al.id_aniolectivo, p.id_periodo, p.desc_periodo, p.fecha_inicio, p.fecha_fin, 
                   p.orden_periodo, p.estado,
                   al.anio, al.fecha_inicio as anio_fecha_inicio, 
                   al.fecha_fin as anio_fecha_fin, al.id_tipoperiodo
            FROM periodo as p 
            INNER JOIN aniolectivo as al ON p.id_aniolectivo = al.id_aniolectivo 
            WHERE p.id_aniolectivo = ? AND p.vigencia = 1 AND al.vigencia = 1";

        $rows = $this->db->queryExecute($sql, [$id]);

        if (empty($rows)) return null;

        $result = [
            'idAnioLectivo'   => $rows[0]['id_aniolectivo'],
            'anio'            => $rows[0]['anio'],
            'fechaInicio'     => $rows[0]['anio_fecha_inicio'],
            'fechaFin'        => $rows[0]['anio_fecha_fin'],
            'idTipoPeriodo'   => $rows[0]['id_tipoperiodo'],
            'descTipoPeriodo' => $rows[0]['id_tipoperiodo'] == 1 ? 'Bimestral' : 'Trimestral',
            'periodos'        => []
        ];

        foreach ($rows as $row) {
            $result['periodos'][] = [
                'idPeriodo'    => $row['id_periodo'],
                'descPeriodo'  => $row['desc_periodo'],
                'ordenPeriodo' => $row['orden_periodo'],
                'fechaInicio'  => $row['fecha_inicio'],
                'fechaFin'     => $row['fecha_fin'],
                'estado'       => $row['estado']
            ];
        }

        return $result;
    }

    public function GuardarPeriodos($periodos)
    {
        try {
            $this->db->beginTransaction();
            $sql = "UPDATE periodo SET fecha_inicio = ?, fecha_fin = ?, estado = 1 WHERE id_periodo = ?";
            foreach ($periodos as $periodo) {
                $this->db->queryExecute($sql, [
                    $periodo['fechaInicio'],
                    $periodo['fechaFin'],
                    $periodo['idPeriodo']
                ]);
            }
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en GuardarPeriodos: " . $e->getMessage());
            return false;
        }
    }

    public function ObtenerVencidos()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
            FROM aniolectivo 
            WHERE vigencia = 1 
            AND estado != 2 
            AND fecha_fin < CURDATE()";
        return $this->db->queryExecute($sql, []);
    }
    public function ObtenerActivos()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
            FROM aniolectivo 
            WHERE vigencia = 1 
            AND estado = 1
            AND fecha_fin >= CURDATE()";
        return $this->db->queryExecute($sql, []);
    }

    public function CerrarVencidos()
    {
        $sql = "UPDATE aniolectivo 
            SET estado = 2 
            WHERE vigencia = 1 
            AND estado = 1 
            AND fecha_fin < CURDATE()";
        return $this->db->queryExecute($sql, []);
    }

    public function ActivarAnio($id)
    {
        $sql = "UPDATE aniolectivo SET estado = 1 WHERE id_aniolectivo = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function ResetearPeriodos($id)
    {
        $sql = "UPDATE periodo SET fecha_inicio = NULL, fecha_fin = NULL, estado = 0 WHERE id_aniolectivo = ? AND vigencia = 1";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function EliminarPeriodos($id)
    {
        $sql = "UPDATE periodo SET vigencia = 0 WHERE id_aniolectivo = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function ObtenerAnioActivo()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
            FROM aniolectivo 
            WHERE vigencia = 1 
            AND estado = 1
            AND fecha_fin >= CURDATE()
            LIMIT 1";
        $result = $this->db->queryExecute($sql, []);
        return !empty($result) ? $result[0] : null;
    }

    public function ObtenerUltimoAnio()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
        FROM aniolectivo 
        WHERE vigencia = 1 
        ORDER BY anio DESC 
        LIMIT 1";
        $result = $this->db->queryExecute($sql, []);
        return !empty($result) ? $result[0] : null;
    }
}
