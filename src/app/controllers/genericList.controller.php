<?php
require_once __DIR__ . '/../models/genericList.model.php';

class GenericListController
{
    private $model;

    public function __construct()
    {
        $this->model = new GenericListModel;
    }

    public function ListarPerfil()
    {
        return $this->model->ListarPerfil();
    }

    public function ListarDocente()
    {
        return $this->model->ListarDocente();
    }

    public function ListarAula()
    {
        return $this->model->ListarAula();
    }

    public function ListarEstudiante()
    {
        return $this->model->ListarEstudiante();
    }

    public function ListarTipoDiaNoLectivo()
    {
        return $this->model->ListarTipoDiaNoLectivo();
    }

    public function ListarTipoParticipante()
    {
        return $this->model->ListarTipoParticipante();
    }

    public function ListarTipoActividad()
    {
        return $this->model->ListarTipoActividad();
    }
    public function ListarTiposEvento()
    {
        return $this->model->ListarTiposEvento();
    }
}
