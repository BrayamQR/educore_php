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
}
