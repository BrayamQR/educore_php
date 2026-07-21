<?php
require_once '../database/DBExecutor.php';
require_once '../models/aniolectivo.model.php';
require_once '../utils/Helpers.php';

class DiaNoLectivoModel
{
    private $db;
    private $anioModel;

    public function __construct()
    {
        $this->db = new DBExecutor;
        $this->anioModel = new AnioAcademicoModel();
    }

    public function Listar()
    {
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return [];
        $idAnioLectivo = $anioLectivo['id_aniolectivo'];
        $sql = "SELECT
                    dl.id_dianolectivo,
                    a.id_aniolectivo,
                    a.anio,
                    dl.nom_evento,
                    dl.fecha_inicio,
                    dl.fecha_fin,
                    td.id_tipodianolectivo,
                    td.nom_tipodianolectivo,
                    dl.vigencia
                FROM dianolectivo AS dl 
                    INNER JOIN tipodianolectivo AS td 
                        ON dl.id_tipodianolectivo = td.id_tipodianolectivo
                    INNER JOIN aniolectivo AS a
                        ON dl.id_aniolectivo = a.id_aniolectivo
                            AND a.vigencia = 1
                WHERE dl.vigencia = 1 AND dl.id_aniolectivo = ?
                ORDER BY dl.fecha_inicio ASC";

        $rows = $this->db->queryExecute($sql, [$idAnioLectivo]);
        if (empty($rows)) return [];

        foreach ($rows as &$row) {
            $row['dia_inicio'] = Helpers::ObtenerDiaSemana($row['fecha_inicio']);
            $row['dia_fin']    = Helpers::ObtenerDiaSemana($row['fecha_fin']);
        }

        return $rows;
    }

    public function Mostrar($id)
    {
        $sql = "SELECT
                    dl.id_dianolectivo AS idDiaNoLectivo,
                    a.id_aniolectivo AS idAnioLectivo,
                    a.anio AS anio,
                    dl.nom_evento AS nomEvento,
                    dl.fecha_inicio AS fechaInicio,
                    dl.fecha_fin AS fechaFin,
                    td.id_tipodianolectivo AS idTipoDiaNoLectivo,
                    td.nom_tipodianolectivo AS nomTipoDiaNoLectivo
                FROM dianolectivo AS dl 
                    INNER JOIN tipodianolectivo AS td 
                        ON dl.id_tipodianolectivo = td.id_tipodianolectivo
                    INNER JOIN aniolectivo AS a
                        ON dl.id_aniolectivo = a.id_aniolectivo
                            AND a.vigencia = 1
                WHERE dl.vigencia = 1 AND dl.id_dianolectivo = ?";

        $rows = $this->db->queryExecute($sql, [$id]);
        if (empty($rows)) return [];

        foreach ($rows as &$row) {
            $row['diaInicio'] = Helpers::ObtenerDiaSemana($row['fechaInicio']);
            $row['diaFin']    = Helpers::ObtenerDiaSemana($row['fechaFin']);
        }

        return !empty($rows) ? $rows[0] : null;
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE dianolectivo SET vigencia = 0 WHERE id_dianolectivo = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function ObtenerPlantillaPendiente($idAnioLectivo)
    {
        $sql = "SELECT 
                    p.id_plantilladianolectivo,
                    p.nom_evento,
                    p.id_tipogeneracion,
                    p.cod_regla,
                    p.mes_inicio,
                    p.dia_inicio,
                    p.mes_fin,
                    p.dia_fin
                FROM plantilla_dianolectivo AS p 
                WHERE p.vigencia = 1 
                AND p.id_plantilladianolectivo NOT IN (
                    SELECT id_plantilladianolectivo 
                    FROM dianolectivo 
                    WHERE id_aniolectivo = ?
                    AND id_plantilladianolectivo IS NOT NULL 
                    AND vigencia = 1
                )";
        return $this->db->queryExecute($sql, [$idAnioLectivo]);
    }

    private function AplicarRegla(string $regla, int $anio): ?array
    {
        switch ($regla) {
            case 'JUEVES_SANTO':
                $pascua = easter_date($anio);
                $fecha  = date('Y-m-d', strtotime('-3 days', $pascua));
                return ['inicio' => $fecha, 'fin' => $fecha];

            case 'VIERNES_SANTO':
                $pascua = easter_date($anio);
                $fecha  = date('Y-m-d', strtotime('-2 days', $pascua));
                return ['inicio' => $fecha, 'fin' => $fecha];

            case 'SEGUNDO_DOMINGO_MAYO':
                $fecha = $this->NthDayOfMonth(2, 0, 5, $anio);
                return ['inicio' => $fecha, 'fin' => $fecha];

            case 'TERCER_DOMINGO_JUNIO':
                $fecha = $this->NthDayOfMonth(3, 0, 6, $anio);
                return ['inicio' => $fecha, 'fin' => $fecha];

            default:
                error_log("DiaNolectivoModel: regla no implementada -> $regla");
                return null;
        }
    }

    private function NthDayOfMonth(int $n, int $diaSemana, int $mes, int $anio): string
    {
        $diasEnMes = cal_days_in_month(CAL_GREGORIAN, $mes, $anio);
        $count     = 0;
        for ($dia = 1; $dia <= $diasEnMes; $dia++) {
            if ((int)date('w', mktime(0, 0, 0, $mes, $dia, $anio)) === $diaSemana) {
                $count++;
                if ($count === $n) {
                    return sprintf('%04d-%02d-%02d', $anio, $mes, $dia);
                }
            }
        }
        return '';
    }

    public function ObtenerFeriadosPendientes()
    {
        // Paso 1: obtener año lectivo activo
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return null;

        $idAnioLectivo = $anioLectivo['id_aniolectivo'];
        $anio          = (int)$anioLectivo['anio'];
        $fechaInicio   = $anioLectivo['fecha_inicio'];
        $fechaFin      = $anioLectivo['fecha_fin'];

        // Paso 2: obtener plantilla pendiente
        $plantillas = $this->ObtenerPlantillaPendiente($idAnioLectivo);
        if (empty($plantillas)) return [];

        // Paso 3: calcular fechas y filtrar por rango
        $feriados = [];
        foreach ($plantillas as $p) {
            if ((int)$p['id_tipogeneracion'] === 1) {
                $inicio = sprintf('%04d-%02d-%02d', $anio, $p['mes_inicio'], $p['dia_inicio']);
                $fin    = sprintf('%04d-%02d-%02d', $anio, $p['mes_fin'],    $p['dia_fin']);
            } else {
                $fechas = $this->AplicarRegla($p['cod_regla'], $anio);
                if (!$fechas) continue;
                $inicio = $fechas['inicio'];
                $fin    = $fechas['fin'];
            }

            // Validar rango del año lectivo
            if ($inicio >= $fechaInicio && $fin <= $fechaFin) {
                $feriados[] = [
                    'idPlantilla'    => $p['id_plantilladianolectivo'],
                    'nomEvento'      => $p['nom_evento'],
                    'fechaInicio'    => $inicio,
                    'fechaFin'       => $fin,
                    'diaInicio'      => Helpers::ObtenerDiaSemana($inicio),
                    'diaFin'         => Helpers::ObtenerDiaSemana($fin),
                ];
            }
        }

        return $feriados;
    }
    public function Registrar($idAnioLectivo, $nomEvento, $fechaInicio, $fechaFin, $tipoOrigen, $idTipoDiaNoLectivo, $idPlantillaDiaNoLectivo)
    {
        $sql = "INSERT INTO dianolectivo(id_aniolectivo, nom_evento, fecha_inicio, fecha_fin, tipo_origen, id_tipodianolectivo, id_plantilladianolectivo) VALUES (?, ?, ?, ?, ?, ?, ?)";
        return $this->db->queryExecute($sql, [
            $idAnioLectivo,
            $nomEvento,
            $fechaInicio,
            $fechaFin,
            $tipoOrigen,
            $idTipoDiaNoLectivo,
            $idPlantillaDiaNoLectivo
        ]);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $idTipoDiaNoLectivo, $idAnioLectivo)
    {
        if (empty($idAnioLectivo)) {
            $anioLectivo = $this->anioModel->ObtenerAnioActivo();
            if (!$anioLectivo) return [];
            $idAnioLectivo = $anioLectivo['id_aniolectivo'];
        }

        $sql = "SELECT
                    dl.id_dianolectivo,
                    a.id_aniolectivo,
                    a.anio,
                    dl.nom_evento,
                    dl.fecha_inicio,
                    dl.fecha_fin,
                    td.id_tipodianolectivo,
                    td.nom_tipodianolectivo,
                    dl.vigencia
                FROM dianolectivo AS dl 
                    INNER JOIN tipodianolectivo AS td 
                        ON dl.id_tipodianolectivo = td.id_tipodianolectivo
                    INNER JOIN aniolectivo AS a
                        ON dl.id_aniolectivo = a.id_aniolectivo
                            AND a.vigencia = 1
                WHERE dl.vigencia = 1
        ";
        $params = [];

        if (!empty($dato)) {
            $sql .= " AND dl.nom_evento LIKE ?";
            $params[] = "%$dato%";
        }
        if (!empty($fechaInicio)) {
            $sql .= " AND dl.fecha_inicio >= ?";
            $params[] = $fechaInicio;
        }
        if (!empty($fechaFin)) {
            $sql .= " AND dl.fecha_fin <= ?";
            $params[] = $fechaFin;
        }
        if (!empty($idTipoDiaNoLectivo)) {
            $sql .= " AND dl.id_tipodianolectivo = ?";
            $params[] = $idTipoDiaNoLectivo;
        }
        $sql .= " AND dl.id_aniolectivo = ? ORDER BY dl.fecha_inicio ASC";
        $params[] = $idAnioLectivo;

        return $this->db->queryExecute($sql, $params);
    }

    public function MostrarPlantillas($id)
    {
        // ✅ obtener año lectivo activo para calcular fechas
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return null;

        $anio = (int)$anioLectivo['anio'];

        $sql = "SELECT * FROM plantilla_dianolectivo WHERE id_plantilladianolectivo = ? AND vigencia = 1";
        $rows = $this->db->queryExecute($sql, [$id]);
        if (empty($rows)) return null;

        $p = $rows[0];

        if ((int)$p['id_tipogeneracion'] === 1) {
            $inicio = sprintf('%04d-%02d-%02d', $anio, $p['mes_inicio'], $p['dia_inicio']);
            $fin    = sprintf('%04d-%02d-%02d', $anio, $p['mes_fin'],    $p['dia_fin']);
        } else {
            $fechas = $this->AplicarRegla($p['cod_regla'], $anio);
            if (!$fechas) return null;
            $inicio = $fechas['inicio'];
            $fin    = $fechas['fin'];
        }

        return [
            'idPlantilla' => $p['id_plantilladianolectivo'],
            'nomEvento'   => $p['nom_evento'],
            'fechaInicio' => $inicio,
            'fechaFin'    => $fin,
        ];
    }
}
