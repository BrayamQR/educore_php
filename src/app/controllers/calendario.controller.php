<?php
require_once '../models/calendario.model.php';

class CalendarioController
{
    private $model;

    public function __construct()
    {
        $this->model = new CalendarioModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Buscar($id)
    {
        return $this->model->Buscar($id);
    }
}
