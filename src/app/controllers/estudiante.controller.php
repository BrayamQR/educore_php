<?php
require_once '../models/estudiante.model.php';

class EstudianteController
{
    private $model;

    public function __construct()
    {
        $this->model = new EstudianteModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function ListarSinQR()
    {
        return $this->model->ListarSinQR();
    }

    public function Buscar($dato)
    {
        return $this->model->Buscar($dato);
    }

    public function BuscarPorDNI($dato)
    {
        return $this->model->BuscarPorDNI($dato);
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }
    public function Registrar(
        $idTipoDocumento,
        $docEstudiante,
        $nomEstudiante,
        $apaEstudiante,
        $amaEstudiante,
        $fechaNacimiento,
        $idSexo,
        $nomApoderado,
        $telApoderado,
        $estMatricula,
        $idAula
    ) {
        return $this->model->Registrar(
            $idTipoDocumento,
            $docEstudiante,
            $nomEstudiante,
            $apaEstudiante,
            $amaEstudiante,
            $fechaNacimiento,
            $idSexo,
            $nomApoderado,
            $telApoderado,
            $estMatricula,
            $idAula
        );
    }
    public function Editar(
        $idEstudiante,
        $idTipoDocumento,
        $docEstudiante,
        $nomEstudiante,
        $apaEstudiante,
        $amaEstudiante,
        $fechaNacimiento,
        $idSexo,
        $nomApoderado,
        $telApoderado,
        $estMatricula,
        $idAula
    ) {
        return $this->model->Editar(
            $idEstudiante,
            $idTipoDocumento,
            $docEstudiante,
            $nomEstudiante,
            $apaEstudiante,
            $amaEstudiante,
            $fechaNacimiento,
            $idSexo,
            $nomApoderado,
            $telApoderado,
            $estMatricula,
            $idAula
        );
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }

    public function ActualizarQR($id, $nombreQR)
    {
        return $this->model->ActualizarQR($id, $nombreQR);
    }

    public function LimpiarQR($id)
    {
        return $this->model->LimpiarQR($id);
    }
}
