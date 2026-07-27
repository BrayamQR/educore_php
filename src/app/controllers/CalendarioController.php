<?php

namespace App\controllers;

use App\models\CalendarioModel;

class CalendarioController
{
    private CalendarioModel $model;

    public function __construct()
    {
        $this->model = new CalendarioModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Buscar($id, $tipoEvento)
    {
        return $this->model->Buscar($id, $tipoEvento);
    }
}
