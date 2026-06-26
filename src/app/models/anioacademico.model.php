<?php
require_once '../database/DBExecutor.php';

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
                (SELECT COUNT(*) FROM periodo p WHERE p.id_aniolectivo = al.id_aniolectivo AND p.vigente = 1) as total_periodos,
                (SELECT COUNT(*) FROM periodo p WHERE p.id_aniolectivo = al.id_aniolectivo 
                    AND p.vigente = 1
                    AND p.fecha_inicio IS NOT NULL 
                    AND p.fecha_fin IS NOT NULL) as periodos_configurados
            FROM aniolectivo al
            WHERE al.vigente = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar() {}

    public function Mostrar($id)
    {
        $sql = "SELECT id_aniolectivo AS idAnioLectivo, anio AS anio, fecha_inicio AS fechaInicio, fecha_fin AS fechaFin, id_tipoperiodo AS idTipoPeriodo FROM aniolectivo WHERE id_aniolectivo = ?";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }

    public function Registrar($anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        $sql = "INSERT INTO aniolectivo(anio, fecha_inicio, fecha_fin, id_tipoperiodo) VALUES (?,?,?,?)";
        return $this->db->queryExecute($sql, [$anio, $fechaInicio, $fechaFin, $idTipoPeriodo]);
    }

    public function Editar($idAnioLectivo, $anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        $sql = "UPDATE aniolectivo SET anio=?,fecha_inicio=?,fecha_fin=?,id_tipoperiodo=? WHERE id_aniolectivo=?";
        return $this->db->queryExecute($sql, [$anio, $fechaInicio, $fechaFin, $idTipoPeriodo, $idAnioLectivo]);
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE aniolectivo SET vigente = 0 WHERE id_aniolectivo = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function GenerarPeriodos($idAnioLectivo, $idTipoPeriodo)
    {
        $cantidad = $idTipoPeriodo == 1 ? 4 : 3;
        $label = $idTipoPeriodo == 1 ? 'Bimestre' : 'Trimestre';
        $romanos  = ['I', 'II', 'III', 'IV'];
        $sql = "INSERT INTO periodo(id_aniolectivo, desc_periodo, orden_periodo) VALUES (?,?,?)";
        for ($i = 0; $i < $cantidad; $i++) {
            $this->db->queryExecute($sql, [
                $idAnioLectivo,
                "{$romanos[$i]} {$label}",
                $i + 1
            ]);
        }
        return true;
    }

    public function ObtenerPeriodos($id)
    {
        $sql = "SELECT p.id_periodo, p.desc_periodo, p.fecha_inicio, p.fecha_fin, 
                   p.orden_periodo, p.estado,
                   al.anio, al.fecha_inicio as anio_fecha_inicio, 
                   al.fecha_fin as anio_fecha_fin, al.id_tipoperiodo
            FROM periodo as p 
            INNER JOIN aniolectivo as al ON p.id_aniolectivo = al.id_aniolectivo 
            WHERE p.id_aniolectivo = ? AND p.vigente = 1 AND al.vigente = 1";

        $rows = $this->db->queryExecute($sql, [$id]);

        if (empty($rows)) return null;

        $result = [
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
        $sql = "UPDATE periodo SET fecha_inicio = ?, fecha_fin = ?, estado = 1 WHERE id_periodo = ?";
        foreach ($periodos as $periodo) {
            $this->db->queryExecute($sql, [
                $periodo['fechaInicio'],
                $periodo['fechaFin'],
                $periodo['idPeriodo']
            ]);
        }
        return true;
    }

    public function ObtenerVencidos()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
            FROM aniolectivo 
            WHERE vigente = 1 
            AND estado != 2 
            AND fecha_fin < CURDATE()";
        return $this->db->queryExecute($sql, []);
    }
    public function ObtenerActivos()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
            FROM aniolectivo 
            WHERE vigente = 1 
            AND estado != 2";
        return $this->db->queryExecute($sql, []);
    }

    public function CerrarVencidos()
    {
        $sql = "UPDATE aniolectivo 
            SET estado = 2 
            WHERE vigente = 1 
            AND estado != 2 
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
        $sql = "UPDATE periodo SET fecha_inicio = NULL, fecha_fin = NULL, estado = 0 WHERE id_aniolectivo = ? AND vigente = 1";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function EliminarPeriodos($id)
    {
        $sql = "UPDATE periodo SET vigente = 0 WHERE id_aniolectivo = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function ObtenerAnioActivo()
    {
        $sql = "SELECT id_aniolectivo, anio, fecha_inicio, fecha_fin 
            FROM aniolectivo 
            WHERE vigente = 1 
            AND estado = 1
            LIMIT 1";
        $result = $this->db->queryExecute($sql, []);
        return !empty($result) ? $result[0] : null;
    }
}
