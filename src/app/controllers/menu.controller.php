<?php

require_once __DIR__ . '/../models/menu.model.php';

class MenuController
{
    private $model;

    public function __construct()
    {
        $this->model = new MenuModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function listarByPerfil($id)
    {
        return $this->model->listarByPerfil($id);
    }
}
