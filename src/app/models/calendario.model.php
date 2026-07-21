<?php
require_once("../database/DBExecutor.php");
require_once '../models/aniolectivo.model.php';

class CalendarioModel
{
    private $db;
    private $anioModel;

    public function __construct()
    {
        $this->db = new DBExecutor();
        $this->anioModel = new AnioAcademicoModel();
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

    private function obtenerEventos($idAnioLectivo)
    {
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

                ORDER BY fecha_inicio ASC";

        return $this->db->queryExecute($sql, [$idAnioLectivo, $idAnioLectivo]);
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

    public function Buscar($id)
    {
        $anioLectivo = $this->anioModel->Mostrar($id);
        if (!$anioLectivo) return null;

        return [
            'id_aniolectivo' => $anioLectivo['idAnioLectivo'],
            'anio'           => $anioLectivo['anio'],
            'fecha_inicio'   => $anioLectivo['fechaInicio'],
            'fecha_fin'      => $anioLectivo['fechaFin'],
            'periodos'       => $this->obtenerPeriodos($id),
            'eventos'        => $this->obtenerEventos($id),
        ];
    }
}
