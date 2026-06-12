<?php
require_once '../models/historial.model.php';

class HistorialController
{
    private $model;

    public function __construct()
    {
        $this->model = new HistorialModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function ListarFechasPendientes()
    {
        return $this->model->ListarFechasPendientes();
    }
    public function RealizarCierre($fecha)
    {
        return $this->model->RealizarCierre($fecha);
    }

    public function TieneRegistrosHoy()
    {
        return $this->model->TieneRegistrosHoy();
    }

    public function ListarFaltas()
    {
        return $this->model->ListarFaltas();
    }

    public function JustificarFalta($idAsistencia)
    {
        return $this->model->JustificarFalta($idAsistencia);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $estado)
    {
        return $this->model->Buscar($dato, $fechaInicio, $fechaFin, $estado);
    }

    public function ReportePorEstudiante($estudiante, $fechaInicio, $fechaFin, $estado)
    {
        return $this->model->ReportePorEstudiante($estudiante, $fechaInicio, $fechaFin, $estado);
    }

    public function ReportePorFecha($fecha, $idAula, $estado)
    {
        return $this->model->ReportePorFecha($fecha, $idAula, $estado);
    }

    public function ReportePorPeriodo($fechaInicio, $fechaFin, $idAula, $estado)
    {
        return $this->model->ReportePorPeriodo($fechaInicio, $fechaFin, $idAula, $estado);
    }
}
