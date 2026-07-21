<?php
require_once '../models/dianolectivo.model.php';

class DiaNoLectivoController
{
    private $model;

    public function __construct()
    {
        $this->model = new DiaNoLectivoModel();
    }

    public function Listar()
    {
        return $this->model->Listar();
    }

    public function Mostrar($id)
    {
        return $this->model->Mostrar($id);
    }

    public function Eliminar($id)
    {
        return $this->model->Eliminar($id);
    }

    public function ObtenerFeriadosPendientes()
    {
        return $this->model->ObtenerFeriadosPendientes();
    }

    public function Registrar($idAnioLectivo, $nomEvento, $fechaInicio, $fechaFin, $tipoOrigen, $idTipoDiaNoLectivo, $idPlantillaDiaNoLectivo)
    {
        return $this->model->Registrar($idAnioLectivo, $nomEvento, $fechaInicio, $fechaFin, $tipoOrigen, $idTipoDiaNoLectivo, $idPlantillaDiaNoLectivo);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $idTipoFeriado, $idAnioLectivo)
    {
        return $this->model->Buscar($dato, $fechaInicio, $fechaFin, $idTipoFeriado, $idAnioLectivo);
    }

    public function MostrarPlantillas($id)
    {
        return $this->model->MostrarPlantillas($id);
    }
}
