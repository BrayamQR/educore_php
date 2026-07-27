<?php

namespace App\controllers;

use App\models\TurnoAcademicoModel;

class TurnoAcademicoController
{
    private TurnoAcademicoModel $model;

    public function __construct()
    {
        $this->model = new TurnoAcademicoModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }

    public function Registrar($idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia)
    {
        return $this->model->Registrar($idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia);
    }

    public function GenerarDias($idTurno, $diaSemana, $horaIngreso, $horaSalida)
    {
        return $this->model->GenerarDias($idTurno, $diaSemana, $horaIngreso, $horaSalida);
    }

    public function RegistrarCompleto($idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $diasSeleccionados)
    {
        return $this->model->RegistraCompleto($idAnioLectivo, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $diasSeleccionados);
    }

    public function RegistrarHistorial($idTurno, $descCambio, $usuRegistro)
    {
        return $this->model->RegistrarHistorial($idTurno, $descCambio, $usuRegistro);
    }
    public function Editar($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia)
    {
        return $this->model->Editar($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia);
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
    public function CambiarEstado($id)
    {
        return $this->model->CambiarEstado($id);
    }

    public function EditarDia($idTurnoDia, $horaIngreso, $horaSalida, $vigencia)
    {
        return $this->model->EditarDia($idTurnoDia, $horaIngreso, $horaSalida, $vigencia);
    }


    public function BuscarDia($idTurno, $diaSemana)
    {
        return $this->model->BuscarDia($idTurno, $diaSemana);
    }

    public function EditarCompleto($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $diasSeleccionados, $descCambio, $idUsuario)
    {
        return $this->model->EditarCompleto($idTurno, $nomTurno, $horaIngreso, $horaSalida, $minTolerancia, $diasSeleccionados, $descCambio, $idUsuario);
    }

    public function EditarDiaCompleto($idTurno, $diaSemana, $horaIngreso, $horaSalida, $idUsuario)
    {
        return $this->model->EditarDiaCompleto($idTurno, $diaSemana, $horaIngreso, $horaSalida, $idUsuario);
    }

    public function Buscar($dato, $idAnioLectivo)
    {
        return $this->model->Buscar($dato, $idAnioLectivo);
    }
}
