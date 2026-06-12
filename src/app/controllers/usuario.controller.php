<?php
require_once '../models/usuario.model.php';

class UsuarioController
{
    private $model;

    public function __construct()
    {
        $this->model = new UsuarioModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Registrar($codUsuario, $nomUsuario, $usuUsuario, $passUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil)
    {
        return $this->model->Registrar($codUsuario, $nomUsuario, $usuUsuario, $passUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil);
    }

    public function Editar($idUsuario, $codUsuario, $nomUsuario, $usuUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil)
    {
        return $this->model->Editar($idUsuario, $codUsuario, $nomUsuario, $usuUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil);
    }

    public function Buscar($dato)
    {
        return $this->model->Buscar($dato);
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }

    public function CambiarEstado($id)
    {
        return $this->model->CambiarEstado($id);
    }

    public function Login($usuUsuario)
    {
        return $this->model->Login($usuUsuario);
    }

    public function RestaurarPassword($id, $usuUsuario)
    {
        return $this->model->RestaurarPassword($id, $usuUsuario);
    }
}
