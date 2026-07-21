<?php
require_once '../database/DBExecutor.php';
require_once '../models/genericList.model.php';
require_once '../models/aniolectivo.model.php';

class ActividadAcademicaModel
{
    private $db;
    private $genericList;
    private $anioModel;

    public function __construct()
    {
        $this->db = new DBExecutor();
        $this->genericList = new GenericListModel();
        $this->anioModel = new AnioAcademicoModel();
    }

    public function Listar()
    {
        $anioLectivo = $this->anioModel->ObtenerAnioActivo();
        if (!$anioLectivo) return [];
        $idAnioLectivo = $anioLectivo['id_aniolectivo'];

        $sql = "SELECT 
                    aa.id_actividad,
                    al.id_aniolectivo,
                    al.anio,
                    aa.nom_actividad,
                    aa.desc_actividad,
                    aa.fecha_inicio,
                    aa.fecha_fin,
                    aa.registra_asistencia,
                    aa.suspende_clases,
                    aa.estado,
                    ta.id_tipoactividad,
                    ta.desc_tipoactividad,
                    ta.color
                FROM tm_actividadacademica AS aa 
                    INNER JOIN tm_tipoactividad AS ta
                        ON aa.id_tipoactividad = ta.id_tipoactividad
                            AND ta.vigencia = 1
                    INNER JOIN aniolectivo as al
                        ON al.id_aniolectivo = aa.id_aniolectivo
                            AND al.vigencia = 1
                WHERE aa.vigencia = 1 AND aa.id_aniolectivo = ?
                GROUP BY
                    aa.id_actividad,
                    al.id_aniolectivo,
                    al.anio,
                    aa.nom_actividad,
                    aa.desc_actividad,
                    aa.fecha_inicio,
                    aa.fecha_fin,
                    aa.registra_asistencia,
                    aa.suspende_clases,
                    aa.estado,
                    ta.id_tipoactividad,
                    ta.desc_tipoactividad,
                    ta.color";
        return $this->db->queryExecute($sql, [$idAnioLectivo]);
    }

    public function Mostrar($id)
    {
        $sql = "SELECT 
                    aa.id_actividad,
                    aa.nom_actividad,
                    aa.desc_actividad,
                    aa.fecha_inicio,
                    aa.fecha_fin,
                    aa.hora_ingreso,
                    aa.hora_salida,
                    aa.registra_asistencia,
                    aa.suspende_clases,
                    aa.lugar,
                    aa.estado,
                    ta.id_tipoactividad,
                    ta.desc_tipoactividad,
                    ta.color,
                    tp.id_tipoparticipante,
                    tp.desc_tipoparticipante,
                    al.id_aniolectivo,
                    al.anio
                FROM tm_actividadacademica AS aa 
                    INNER JOIN tm_tipoactividad AS ta
                        ON aa.id_tipoactividad = ta.id_tipoactividad
                            AND ta.vigencia = 1
                    INNER JOIN td_actividadparticipante AS ap
                        ON aa.id_actividad = ap.id_actividad
                            AND ap.vigencia = 1
                    INNER JOIN tm_tipoparticipante AS tp
                        ON tp.id_tipoparticipante = ap.id_tipoparticipante
                            AND tp.vigencia = 1
                    INNER JOIN aniolectivo as al
                    	ON al.id_aniolectivo = aa.id_aniolectivo
                        	AND al.vigencia = 1
                WHERE aa.vigencia = 1 AND aa.id_actividad = ?;";
        $rows = $this->db->queryExecute($sql, [$id]);
        if (empty($rows)) return null;

        $actividad = [
            'idActividad'          => $rows[0]['id_actividad'],
            'nomActividad'         => $rows[0]['nom_actividad'],
            'descActividad'        => $rows[0]['desc_actividad'],
            'fechaInicio'          => $rows[0]['fecha_inicio'],
            'fechaFin'             => $rows[0]['fecha_fin'],
            'diaInicio'            => Helpers::ObtenerDiaSemana($rows[0]['fecha_inicio']),
            'diaFin'               => Helpers::ObtenerDiaSemana($rows[0]['fecha_fin']),
            'horaIngreso'          => $rows[0]['hora_ingreso'],
            'horaSalida'           => $rows[0]['hora_salida'],
            'lugar'                => $rows[0]['lugar'],
            'registraAsistencia'   => $rows[0]['registra_asistencia'],
            'suspendeClases'       => $rows[0]['suspende_clases'],
            'estado'               => $rows[0]['estado'],
            'idTipoActividad'      => $rows[0]['id_tipoactividad'],
            'descTipoActividad'    => $rows[0]['desc_tipoactividad'],
            'color'                => $rows[0]['color'],
            'idAnioLectivo'        => $rows[0]['id_aniolectivo'],
            'anio'                 => $rows[0]['anio'],
            'participantes'        => [],
        ];
        foreach ($rows as $row) {
            $actividad['participantes'][] = [
                'idTipoParticipante'    => $row['id_tipoparticipante'],
                'descTipoParticipante'  => $row['desc_tipoparticipante'],
            ];
        }
        return $actividad;
    }

    public function Registrar(
        $idAnioLectivo,
        $idTipoActividad,
        $nomActividad,
        $descActividad,
        $fechaInicio,
        $fechaFin,
        $horaIngreso,
        $horaSalida,
        $lugar,
        $registraAsistencia,
        $suspendeClases
    ) {
        $sql = "INSERT INTO tm_actividadacademica
                (
                    id_aniolectivo, 
                    id_tipoactividad, 
                    nom_actividad, 
                    desc_actividad, 
                    fecha_inicio, 
                    fecha_fin, 
                    hora_ingreso, 
                    hora_salida, 
                    lugar, 
                    registra_asistencia, 
                    suspende_clases
                ) 
                VALUES 
                (
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?,
                    ?
                )";
        return $this->db->queryExecute($sql, [
            $idAnioLectivo,
            $idTipoActividad,
            $nomActividad,
            $descActividad,
            $fechaInicio,
            $fechaFin,
            $horaIngreso,
            $horaSalida,
            $lugar,
            $registraAsistencia,
            $suspendeClases
        ]);
    }

    public function RegistrarParticipante(
        $idActividad,
        $idTipoParticipante
    ) {
        $sql = "INSERT INTO td_actividadparticipante
                (
                    id_actividad, 
                    id_tipoparticipante
                ) 
                VALUES 
                (
                    ?,
                    ?
                )";
        return $this->db->queryExecute($sql, [
            $idActividad,
            $idTipoParticipante
        ]);
    }

    public function RegistrarCompleto(
        $idAnioLectivo,
        $idTipoActividad,
        $nomActividad,
        $descActividad,
        $fechaInicio,
        $fechaFin,
        $horaIngreso,
        $horaSalida,
        $lugar,
        $registraAsistencia,
        $suspendeClases,
        $participantesSeleccionados
    ) {
        try {
            $this->db->beginTransaction();

            $this->Registrar(
                $idAnioLectivo,
                $idTipoActividad,
                $nomActividad,
                $descActividad,
                $fechaInicio,
                $fechaFin,
                $horaIngreso,
                $horaSalida,
                $lugar,
                $registraAsistencia,
                $suspendeClases
            );

            $idActividad = $this->db->lastInsertId();

            foreach ($participantesSeleccionados as $idTipoParticipante) {
                $this->RegistrarParticipante($idActividad, $idTipoParticipante);
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en RegistrarCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function Editar(
        $idActividad,
        $idTipoActividad,
        $nomActividad,
        $descActividad,
        $fechaInicio,
        $fechaFin,
        $horaIngreso,
        $horaSalida,
        $lugar,
        $registraAsistencia,
        $suspendeClases
    ) {
        $sql = "UPDATE tm_actividadacademica 
                    SET 
                        id_tipoactividad = ?, 
                        nom_actividad = ?, 
                        desc_actividad = ?,
                        fecha_inicio = ?, 
                        fecha_fin = ?, 
                        hora_ingreso = ?, 
                        hora_salida = ?, 
                        lugar = ?, 
                        registra_asistencia = ?, 
                        suspende_clases = ? 
                WHERE id_actividad = ?";
        return $this->db->queryExecute($sql, [
            $idTipoActividad,
            $nomActividad,
            $descActividad,
            $fechaInicio,
            $fechaFin,
            $horaIngreso,
            $horaSalida,
            $lugar,
            $registraAsistencia,
            $suspendeClases,
            $idActividad,
        ]);
    }

    public function EditarParticipante(
        $idActividadParticipante,
        $idActividad,
        $idTipoParticipante,
        $vigencia
    ) {
        $sql = "UPDATE td_actividadparticipante SET id_actividad = ?,id_tipoparticipante = ?, vigencia = ? WHERE id_actividadparticipante = ?";
        return $this->db->queryExecute($sql, [
            $idActividad,
            $idTipoParticipante,
            $vigencia,
            $idActividadParticipante
        ]);
    }

    public function BuscarParticipante($idActividad, $idTipoParticipante)
    {
        $sql = "SELECT id_actividadparticipante, vigencia FROM td_actividadparticipante WHERE id_actividad = ? AND id_tipoparticipante = ?";
        return $this->db->queryExecute($sql, [$idActividad, $idTipoParticipante]);
    }

    public function EditarCompleto(
        $idActividad,
        $idTipoActividad,
        $nomActividad,
        $descActividad,
        $fechaInicio,
        $fechaFin,
        $horaIngreso,
        $horaSalida,
        $lugar,
        $registraAsistencia,
        $suspendeClases,
        $participantesSeleccionados
    ) {
        try {
            $this->db->beginTransaction();
            $this->Editar(
                $idActividad,
                $idTipoActividad,
                $nomActividad,
                $descActividad,
                $fechaInicio,
                $fechaFin,
                $horaIngreso,
                $horaSalida,
                $lugar,
                $registraAsistencia,
                $suspendeClases
            );

            $tiposParticipante = $this->genericList->ListarTipoParticipante();

            foreach ($tiposParticipante as $tipo) {
                $idTipoParticipante = $tipo['id_tipoparticipante'];
                $seleccionado = in_array($idTipoParticipante, $participantesSeleccionados);
                $resultado = $this->BuscarParticipante($idActividad, $idTipoParticipante);

                if (!empty($resultado)) {
                    $idActividadParticipante = $resultado[0]['id_actividadparticipante'];
                    $vigenciaActual = (bool)$resultado[0]['vigencia'];

                    if ($vigenciaActual === $seleccionado) {
                        continue;
                    }

                    $nuevoEstado = $seleccionado ? 1 : 0;
                    $this->EditarParticipante($idActividadParticipante, $idActividad, $idTipoParticipante, $nuevoEstado);
                } else {
                    if ($seleccionado) {
                        $this->RegistrarParticipante($idActividad, $idTipoParticipante);
                    }
                }
            }
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en EditarCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE tm_actividadacademica SET vigencia = 0 WHERE id_actividad = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function CambiarEstado($id)
    {
        $sql = "UPDATE tm_actividadacademica SET estado = NOT estado WHERE id_actividad = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $idTipoActividad, $idAnioLectivo)
    {

        $sql = "SELECT 
                    aa.id_actividad,
                    al.id_aniolectivo,
                    al.anio,
                    aa.nom_actividad,
                    aa.desc_actividad,
                    aa.fecha_inicio,
                    aa.fecha_fin,
                    aa.registra_asistencia,
                    aa.suspende_clases,
                    aa.estado,
                    ta.id_tipoactividad,
                    ta.desc_tipoactividad,
                    ta.color
                FROM tm_actividadacademica AS aa 
                    INNER JOIN tm_tipoactividad AS ta
                        ON aa.id_tipoactividad = ta.id_tipoactividad
                            AND ta.vigencia = 1
                    INNER JOIN aniolectivo as al
                        ON al.id_aniolectivo = aa.id_aniolectivo
                            AND al.vigencia = 1
                WHERE aa.vigencia = 1";
        $params = [];

        if (!empty($dato)) {
            $sql .= " AND aa.nom_actividad LIKE ?";
            $params[] = "%$dato%";
        }
        if (!empty($fechaInicio)) {
            $sql .= " AND aa.fecha_inicio >= ?";
            $params[] = $fechaInicio;
        }
        if (!empty($fechaFin)) {
            $sql .= " AND aa.fecha_fin <= ?";
            $params[] = $fechaFin;
        }
        if (!empty($idTipoActividad)) {
            $sql .= " AND aa.id_tipoactividad = ?";
            $params[] = $idTipoActividad;
        }

        $sql .= " AND aa.id_aniolectivo = ? 
                GROUP BY
                    aa.id_actividad,
                    al.id_aniolectivo,
                    al.anio,
                    aa.nom_actividad,
                    aa.desc_actividad,
                    aa.fecha_inicio,
                    aa.fecha_fin,
                    aa.registra_asistencia,
                    aa.suspende_clases,
                    aa.estado,
                    ta.id_tipoactividad,
                    ta.desc_tipoactividad,
                    ta.color";
        $params[] = $idAnioLectivo;

        return $this->db->queryExecute($sql, $params);
    }
}
