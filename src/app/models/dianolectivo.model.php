<?php
require_once '../database/DBExecutor.php';
require_once '../models/anioacademico.model.php';
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
                WHERE p.vigente = 1 
                AND p.id_plantilladianolectivo NOT IN (
                    SELECT id_plantilladianolectivo 
                    FROM dianolectivo 
                    WHERE id_aniolectivo = ?
                    AND id_plantilladianolectivo IS NOT NULL 
                    AND vigente = 1
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
}
