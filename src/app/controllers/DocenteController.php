<?php

namespace App\controllers;

use App\models\DocenteModel;

class DocenteController
{
    private DocenteModel $model;

    public function __construct()
    {
        $this->model = new DocenteModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Buscar($dato)
    {
        return $this->model->Buscar($dato);
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }

    public function Registrar($idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente)
    {
        return $this->model->Registrar($idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente);
    }

    public function Editar($idDocente, $idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente)
    {
        return $this->model->Editar($idDocente, $idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente);
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
}
