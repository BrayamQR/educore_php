<?php

namespace App\models;

use App\database\DBExecutor;
use App\models\AnioLectivoModel;
use Exception;

class CalendarioModel
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
        if (!$anioLectivo) return null;

        $idAnioLectivo = $anioLectivo['id_aniolectivo'];

        return [
            'id_aniolectivo' => $anioLectivo['id_aniolectivo'],
            'anio'           => $anioLectivo['anio'],
            'fecha_inicio'   => $anioLectivo['fecha_inicio'],
            'fecha_fin'      => $anioLectivo['fecha_fin'],
            'periodos'       => $this->obtenerPeriodos($idAnioLectivo),
            'eventos'        => $this->obtenerEventos($idAnioLectivo),
        ];
    }

    private function obtenerEventos($idAnioLectivo, $origenTipo = null, $idTipo = null)
    {
        $filtroDia = "";
        $filtroAct = "";
        $paramsDia = [$idAnioLectivo];
        $paramsAct = [$idAnioLectivo];

        if ($origenTipo === 'dianolectivo') {
            $filtroDia = "AND t.id_tipodianolectivo = ?";
            $paramsDia[] = $idTipo;

            // Anula por completo la mitad de actividades
            $filtroAct = "AND 1 = 0";
        } elseif ($origenTipo === 'actividad') {
            $filtroAct = "AND ta.id_tipoactividad = ?";
            $paramsAct[] = $idTipo;

            // Anula por completo la mitad de días no lectivos
            $filtroDia = "AND 1 = 0";
        }

        $sql = "SELECT
                d.id_dianolectivo AS id,
                'dianolectivo' AS origen,
                d.nom_evento AS titulo,
                NULL AS descripcion,
                d.fecha_inicio,
                d.fecha_fin,
                NULL AS hora_ingreso,
                NULL AS hora_salida,
                NULL AS lugar,
                t.nom_tipodianolectivo AS tipo,
                t.color,
                1 AS todo_el_dia
            FROM dianolectivo AS d
            INNER JOIN tipodianolectivo AS t ON t.id_tipodianolectivo = d.id_tipodianolectivo
            WHERE d.vigencia = 1 AND t.vigencia = 1 AND d.id_aniolectivo = ?
            $filtroDia

            UNION ALL

            SELECT
                a.id_actividad AS id,
                'actividad' AS origen,
                a.nom_actividad AS titulo,
                a.desc_actividad AS descripcion,
                a.fecha_inicio,
                a.fecha_fin,
                a.hora_ingreso,
                a.hora_salida,
                a.lugar,
                ta.desc_tipoactividad AS tipo,
                ta.color,
                0 AS todo_el_dia
            FROM tm_actividadacademica AS a
            INNER JOIN tm_tipoactividad AS ta ON ta.id_tipoactividad = a.id_tipoactividad
            WHERE a.vigencia = 1 AND ta.vigencia = 1 AND a.estado = 1 AND a.id_aniolectivo = ?
            $filtroAct

            ORDER BY fecha_inicio ASC";

        return $this->db->queryExecute($sql, [...$paramsDia, ...$paramsAct]);
    }

    private function obtenerPeriodos($idAnioLectivo)
    {
        $sql = "SELECT
                    id_periodo,
                    desc_periodo,
                    fecha_inicio,
                    fecha_fin,
                    orden_periodo,
                    color
                FROM periodo
                WHERE vigencia = 1 AND estado = 1 AND id_aniolectivo = ?
                ORDER BY orden_periodo ASC";

        return $this->db->queryExecute($sql, [$idAnioLectivo]);
    }

    public function Buscar($idAnio, $tipoEvento = null)
    {
        $anioLectivo = $this->anioModel->Mostrar($idAnio);
        if (!$anioLectivo) return null;

        $origenTipo = null;
        $idTipo = null;

        if ($tipoEvento) {
            [$origenTipo, $idTipo] = explode('_', $tipoEvento, 2);
        }

        return [
            'id_aniolectivo' => $anioLectivo['idAnioLectivo'],
            'anio'           => $anioLectivo['anio'],
            'fecha_inicio'   => $anioLectivo['fechaInicio'],
            'fecha_fin'      => $anioLectivo['fechaFin'],
            'periodos'       => $this->obtenerPeriodos($idAnio),
            'eventos'        => $this->obtenerEventos($idAnio, $origenTipo, $idTipo),
        ];
    }
}
