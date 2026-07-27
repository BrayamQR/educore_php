<?php

namespace App\controllers;

use App\models\ActividadAcademicaModel;

class ActividadAcademicaController
{
    private ActividadAcademicaModel $model;

    public function __construct()
    {
        $this->model = new ActividadAcademicaModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
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
        return $this->model->Registrar(
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
    }

    public function RegistrarParticipante(
        $idActividad,
        $idTipoParticipante
    ) {
        return $this->model->RegistrarParticipante($idActividad, $idTipoParticipante);
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
        return $this->model->RegistrarCompleto(
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
        );
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
        return $this->model->Editar(
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
    }

    public function EditarParticipante(
        $idActividadParticipante,
        $idActividad,
        $idTipoParticipante,
        $vigencia
    ) {
        return $this->model->EditarParticipante(
            $idActividadParticipante,
            $idActividad,
            $idTipoParticipante,
            $vigencia
        );
    }

    public function BuscarParticipante($idActividad, $idTipoParticipante)
    {
        return $this->model->BuscarParticipante($idActividad, $idTipoParticipante);
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
        return $this->model->EditarCompleto(
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
        );
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
    public function CambiarEstado($id)
    {
        return $this->model->CambiarEstado($id);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $idTipoActividad, $idAnioLectivo)
    {
        return $this->model->Buscar($dato, $fechaInicio, $fechaFin, $idTipoActividad, $idAnioLectivo);
    }
}
