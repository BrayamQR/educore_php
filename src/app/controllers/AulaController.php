<?php

namespace App\controllers;

use App\models\AulaModel;

class AulaController
{
    private AulaModel $model;

    public function __construct()
    {
        $this->model = new AulaModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function ListarAulas()
    {
        return $this->model->ListarAulas();
    }

    public function Buscar($dato, $idNivelAcademico, $idTurnoAcademico, $idAnioLectivo)
    {
        return $this->model->Buscar($dato, $idNivelAcademico, $idTurnoAcademico, $idAnioLectivo);
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }

    public function Registrar($idNivel, $idGrado, $seccionAula, $idDocente)
    {
        return $this->model->Registrar($idNivel, $idGrado, $seccionAula, $idDocente);
    }

    public function RegistrarCompleto(
        $idGrado,
        $seccionAula,
        $idAnioLectivo,
        $idDocente,
        $idTurno
    ) {
        return $this->model->RegistrarCompleto(
            $idGrado,
            $seccionAula,
            $idAnioLectivo,
            $idDocente,
            $idTurno
        );
    }

    public function RegistrarAulaLectiva(
        $idAula,
        $idAnioLectivo,
        $idDocente,
        $idTurno
    ) {
        return $this->model->RegistrarAulaLectiva(
            $idAula,
            $idAnioLectivo,
            $idDocente,
            $idTurno
        );
    }

    public function Editar($idAulaLectiva, $idDocente, $idTurno)
    {
        return $this->model->Editar($idAulaLectiva, $idDocente, $idTurno);
    }
    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
}
