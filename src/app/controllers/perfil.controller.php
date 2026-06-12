<?php
require_once '../models/perfil.model.php';

class PerfilController
{
    private $model;

    public function __construct()
    {
        $this->model = new PerfilModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Buscar($dato)
    {
        return $this->model->Buscar($dato);
    }

    public function mostrar($id)
    {
        return $this->model->mostrar($id);
    }

    public function Registrar($nomPerfil, $descPerfil)
    {
        return $this->model->Registrar($nomPerfil, $descPerfil);
    }

    public function Editar($idPerfil, $nomPerfil, $descPerfil)
    {
        return $this->model->Editar($idPerfil, $nomPerfil, $descPerfil);
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
    public function CambiarEstado($id)
    {
        return $this->model->CambiarEstado($id);
    }
    public function AsignarPermisos($idPerfil, $permisos)
    {
        return $this->model->AsignarPermisos($idPerfil, $permisos);
    }
}
