<?php

namespace App\controllers;

use App\models\MenuModel;

class MenuController
{
    private MenuModel $model;

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
