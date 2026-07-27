<?php
require_once __DIR__ . '/../database/DBExecutor.php';
require_once __DIR__ . '/../models/aniolectivo.model.php';
require_once __DIR__ . '/../utils/Helpers.php';

class TurnoAcademicoModel
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
        if (!$anioLectivo) return [];
        $idAnioLectivo = $anioLectivo['id_aniolectivo'];

        $sql = "SELECT
                    t.id_turno,
                    al.id_aniolectivo,
                    al.anio,
                    t.nom_turno,
                    t.hora_ingreso,
                    t.hora_salida,
                    t.min_tolerancia,
                    t.estado,
                    td.dia_semana,
                    td.hora_ingreso AS dia_hora_ingreso,
                    td.hora_salida AS dia_hora_salida
                FROM tm_turnoacademico AS t
                    INNER JOIN td_turnodia AS td
                        ON t.id_turno = td.id_turno AND td.vigencia = 1
                    INNER JOIN aniolectivo AS al
                        ON t.id_aniolectivo = al.id_aniolectivo AND al.vigencia = 1
                WHERE t.vigencia = 1 AND t.id_aniolectivo = ?
                ORDER BY t.id_turno ASC";

        $rows = $this->db->queryExecute($sql, [$idAnioLectivo]);
        if (empty($rows)) return [];

        // Agrupar por turno
        $turnos = [];
        foreach ($rows as $row) {
            $idTurno = $row['id_turno'];

            if (!isset($turnos[$idTurno])) {
                $turnos[$idTurno] = [
                    'id_turno'       => $row['id_turno'],
                    'id_aniolectivo' => $row['id_aniolectivo'],
                    'anio'           => $row['anio'],
                    'nom_turno'      => $row['nom_turno'],
                    'hora_ingreso'   => $row['hora_ingreso'],
                    'hora_salida'    => $row['hora_salida'],
                    'min_tolerancia' => $row['min_tolerancia'],
                    'estado'         => $row['estado'],
                    'dias'           => [],
                ];
            }

            $turnos[$idTurno]['dias'][] = [
                'dia_semana'      => $row['dia_semana'],
                'nom_diasemana'   => Helpers::ObtenerNombreDiaSemana((int)$row['dia_semana']),
                'hora_ingreso'    => $row['dia_hora_ingreso'],
                'hora_salida'     => $row['dia_hora_salida'],
            ];
        }
        return array_values($turnos);
    }

    public function Mostrar($id)
    {
        $sql = "SELECT
                t.id_turno,
                al.id_aniolectivo,
                al.anio,
                t.nom_turno,
                t.hora_ingreso,
                t.hora_salida,
                t.min_tolerancia,
                t.estado,
                td.dia_semana,
                td.hora_ingreso AS dia_hora_ingreso,
                td.hora_salida AS dia_hora_salida
            FROM tm_turnoacademico AS t
                INNER JOIN td_turnodia AS td
                    ON t.id_turno = td.id_turno AND td.vigencia = 1
                INNER JOIN aniolectivo AS al
                    ON t.id_aniolectivo = al.id_aniolectivo AND al.vigencia = 1
            WHERE t.vigencia = 1 AND t.id_turno = ?";
        $rows = $this->db->queryExecute($sql, [$id]);
        if (empty($rows)) return null;

        $turno = [
            'idTurno'       => $rows[0]['id_turno'],
            'idAnioLectivo' => $rows[0]['id_aniolectivo'],
            'anio'           => $rows[0]['anio'],
            'nomTurno'      => $rows[0]['nom_turno'],
            'horaIngreso'   => $rows[0]['hora_ingreso'],
            'horaSalida'    => $rows[0]['hora_salida'],
            'minTolerancia' => $rows[0]['min_tolerancia'],
            'estado'         => $rows[0]['estado'],
            'dias'           => [],
        ];

        foreach ($rows as $row) {
            $turno['dias'][] = [
                'diaSemana'    => $row['dia_semana'],
                'nomDiasemana' => Helpers::ObtenerNombreDiaSemana((int)$row['dia_semana']),
                'horaIngreso'  => $row['dia_hora_ingreso'],
                'horaSalida'   => $row['dia_hora_salida'],
            ];
        }

        return $turno;
    }

    public function Registrar($idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia)
    {
        $sql = "INSERT INTO tm_turnoacademico(id_aniolectivo, nom_turno, hora_ingreso, hora_salida, min_tolerancia) VALUES (?,?,?,?,?)";
        return $this->db->queryExecute($sql, [$idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia]);
    }

    public function GenerarDias(
        $idTurno,
        $diaSemana,
        $horaIngreso,
        $horaSalida
    ) {
        $sql = "INSERT INTO td_turnodia(id_turno, dia_semana, hora_ingreso, hora_salida) VALUES (?,?,?,?)";
        return $this->db->queryExecute($sql, [
            $idTurno,
            $diaSemana,
            $horaIngreso,
            $horaSalida
        ]);
    }

    public function RegistraCompleto($idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $diasSeleccionados)
    {
        try {
            $this->db->beginTransaction();
            $this->Registrar(
                $idAnioLectivo,
                $nomTurno,
                $horaIngreso,
                $horaSalida,
                $minTolerancia
            );
            $idTurno = $this->db->lastInsertId();
            foreach ($diasSeleccionados as $diaSemana) {
                $this->GenerarDias($idTurno, $diaSemana, $horaIngreso, $horaSalida);
            }
            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en RegistrarCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function RegistrarHistorial($idTurno, $descCambio, $usuRegistro)
    {
        $sql = "INSERT INTO th_historialturno(id_turno, desc_cambio, usu_registro) VALUES (?,?,?)";
        return $this->db->queryExecute($sql, [$idTurno, $descCambio, $usuRegistro]);
    }

    public function Editar($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia)
    {
        $sql = "UPDATE tm_turnoacademico SET nom_turno = ?, hora_ingreso = ?, hora_salida = ?, min_tolerancia = ? WHERE id_turno = ?";
        return $this->db->queryExecute($sql, [$nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $idTurno]);
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE tm_turnoacademico SET vigencia = 0 WHERE id_turno = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function CambiarEstado($id)
    {
        $sql = "UPDATE tm_turnoacademico SET estado = NOT estado WHERE id_turno = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function EditarDia($idTurnoDia, $horaIngreso, $horaSalida, $vigencia)
    {
        $sql = "UPDATE td_turnodia SET hora_ingreso = ?, hora_salida = ?, vigencia = ? WHERE id_turnodia = ?";
        return $this->db->queryExecute($sql, [$horaIngreso, $horaSalida, $vigencia, $idTurnoDia]);
    }

    public function BuscarDia($idTurno, $diaSemana)
    {
        $sql = "SELECT id_turnodia, vigencia FROM td_turnodia WHERE id_turno = ? AND dia_semana = ?";
        return $this->db->queryExecute($sql, [$idTurno, $diaSemana]);
    }

    public function EditarCompleto($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $diasSeleccionados, $descCambio, $idUsuario)
    {
        try {
            $this->db->beginTransaction();

            $this->Editar($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia);

            for ($diaSemana = 1; $diaSemana <= 7; $diaSemana++) {
                $seleccionado = in_array($diaSemana, $diasSeleccionados);
                $resultado = $this->BuscarDia($idTurno, $diaSemana);

                if (!empty($resultado)) {
                    $idTurnoDia = $resultado[0]['id_turnodia'];
                    $vigenciaActual = (bool)$resultado[0]['vigencia'];

                    if ($vigenciaActual === $seleccionado) {
                        continue;
                    }

                    $nuevoEstado = $seleccionado ? 1 : 0;
                    $this->EditarDia($idTurnoDia, $horaIngreso, $horaSalida, $nuevoEstado);
                } else {
                    if ($seleccionado) {
                        $this->GenerarDias($idTurno, $diaSemana, $horaIngreso, $horaSalida);
                    }
                }
            }

            $this->RegistrarHistorial($idTurno, $descCambio, $idUsuario);

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en EditarCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function EditarDiaCompleto($idTurno, $diaSemana, $horaIngreso, $horaSalida, $idUsuario)
    {
        try {
            $this->db->beginTransaction();

            $resultado = $this->BuscarDia($idTurno, $diaSemana);
            if (empty($resultado)) {
                throw new Exception("El día no existe para este turno");
            }
            $idTurnoDia = $resultado[0]['id_turnodia'];

            if (!$this->EditarDia($idTurnoDia, $horaIngreso, $horaSalida, 1)) {
                throw new Exception("No se pudo actualizar el día");
            }

            $nombreDia = Helpers::ObtenerNombreDiaSemana((int)$diaSemana);
            $descCambio = "Se actualizó el horario del día {$nombreDia} a {$horaIngreso} - {$horaSalida}";

            if (!$this->RegistrarHistorial($idTurno, $descCambio, $idUsuario)) {
                throw new Exception("No se pudo registrar el historial");
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en EditarDiaCompleto: " . $e->getMessage());
            return false;
        }
    }

    public function Buscar($dato, $idAnioLectivo)
    {

        if (empty($idAnioLectivo)) {
            $anioLectivo = $this->anioModel->ObtenerAnioActivo();
            if (!$anioLectivo) return [];
            $idAnioLectivo = $anioLectivo['id_aniolectivo'];
        }
        $sql = "SELECT
                    t.id_turno,
                    al.id_aniolectivo,
                    al.anio,
                    t.nom_turno,
                    t.hora_ingreso,
                    t.hora_salida,
                    t.min_tolerancia,
                    t.estado,
                    td.dia_semana,
                    td.hora_ingreso AS dia_hora_ingreso,
                    td.hora_salida AS dia_hora_salida
                FROM tm_turnoacademico AS t
                    INNER JOIN td_turnodia AS td
                        ON t.id_turno = td.id_turno AND td.vigencia = 1
                    INNER JOIN aniolectivo AS al
                        ON t.id_aniolectivo = al.id_aniolectivo AND al.vigencia = 1
                WHERE t.vigencia = 1";
        $params = [];

        if (!empty($dato)) {
            $sql .= " AND t.nom_turno LIKE ?";
            $params[] = "%$dato%";
        }
        $sql .= " AND al.id_aniolectivo = ?";
        $params[] = $idAnioLectivo;

        return $this->db->queryExecute($sql, $params);
    }
}
