<?php
require_once '../models/dianolectivo.model.php';

class DiaNoLectivoController
{
    private $model;

    public function __construct()
    {
        $this->model = new DiaNoLectivoModel();
    }

    public function ObtenerFeriadosPendientes()
    {
        return $this->model->ObtenerFeriadosPendientes();
    }

    public function Registrar($idAnioLectivo, $nomEvento, $fechaInicio, $fechaFin, $tipoOrigen, $idTipoDiaNoLectivo, $idPlantillaDiaNoLectivo)
    {
        return $this->model->Registrar($idAnioLectivo, $nomEvento, $fechaInicio, $fechaFin, $tipoOrigen, $idTipoDiaNoLectivo, $idPlantillaDiaNoLectivo);
    }

    public function MostrarPlantillas($id)
    {
        return $this->model->MostrarPlantillas($id);
    }
}
