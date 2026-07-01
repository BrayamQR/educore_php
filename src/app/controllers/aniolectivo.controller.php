<?php
require_once '../models/anioacademico.model.php';

class AnioLectivoController
{
    private $model;

    public function __construct()
    {
        $this->model = new AnioAcademicoModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }
    public function Buscar() {}
    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }
    public function Registrar($anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        return $this->model->Registrar($anio, $fechaInicio, $fechaFin, $idTipoPeriodo);
    }
    public function Editar($idAnioLectivo, $anio, $fechaInicio, $fechaFin, $idTipoPeriodo)
    {
        return $this->model->Editar($idAnioLectivo, $anio, $fechaInicio, $fechaFin, $idTipoPeriodo);
    }
    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }
    public function GenerarPeriodos($idAnioLectivo, $idTipoPeriodo)
    {
        return $this->model->GenerarPeriodos($idAnioLectivo, $idTipoPeriodo);
    }

    public function ObtenerPeriodos($id)
    {
        return $this->model->ObtenerPeriodos($id);
    }

    public function GuardarPeriodos($periodos)
    {
        return $this->model->GuardarPeriodos($periodos);
    }
    public function ObtenerVencidos()
    {
        return $this->model->ObtenerVencidos();
    }

    public function ObtenerActivos()
    {
        return $this->model->ObtenerActivos();
    }
    public function CerrarVencidos()
    {
        return $this->model->CerrarVencidos();
    }

    public function ActivarAnio($id)
    {
        return $this->model->ActivarAnio($id);
    }

    public function ResetearPeriodos($id)
    {
        return $this->model->ResetearPeriodos($id);
    }

    public function EliminarPeriodos($id)
    {
        return $this->model->EliminarPeriodos($id);
    }

    public function ObtenerAnioActivo()
    {
        return $this->model->ObtenerAnioActivo();
    }
}
