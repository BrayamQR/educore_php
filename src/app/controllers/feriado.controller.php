<?php
require_once '../models/feriado.model.php';

class FeriadoController
{
    private $model;

    public function __construct()
    {
        $this->model = new FeriadoModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $tipoFeriado)
    {
        return $this->model->Buscar($dato, $fechaInicio, $fechaFin, $tipoFeriado);
    }
    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }
    public function Registrar($nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado)
    {
        return $this->model->Registrar($nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado);
    }
    public function Editar($idFeriado, $nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado)
    {
        return $this->model->Editar($idFeriado, $nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado);
    }
    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
}
