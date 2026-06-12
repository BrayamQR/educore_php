<?php
require_once '../models/aula.model.php';

class AulaController
{
    private $model;

    public function __construct()
    {
        $this->model = new AulaModel();
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

    public function Registrar($idNivel, $idGrado, $seccionAula, $idDocente)
    {
        return $this->model->Registrar($idNivel, $idGrado, $seccionAula, $idDocente);
    }

    public function Editar($idAula, $idNivel, $idGrado, $seccionAula, $idDocente)
    {
        return $this->model->Editar($idAula,  $idNivel, $idGrado, $seccionAula, $idDocente);
    }
    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
}
