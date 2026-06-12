<?php
require_once '../database/DBExecutor.php';

class FeriadoModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor;
    }

    public function Listar()
    {
        $sql = "SELECT * FROM feriado ORDER BY fecha_feriado DESC;";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar($dato, $fechaInicio, $fechaFin, $tipoFeriado)
    {
        $sql = "SELECT * FROM feriado WHERE (nom_feriado LIKE ? OR desc_feriado LIKE ?)";

        $params = ["%$dato%", "%$dato%"];

        if (!empty($fechaInicio)) {
            $sql .= " AND fecha_feriado >= ?";
            $params[] = $fechaInicio;
        }

        if (!empty($fechaFin)) {
            $sql .= " AND fecha_feriado<= ?";
            $params[] = $fechaFin;
        }

        if (!empty($tipoFeriado)) {
            $sql .= " AND id_tipoferiado = ?";
            $params[] = $tipoFeriado;
        }

        return $this->db->queryExecute($sql, $params);
    }

    public function Mostrar($id)
    {
        $sql = "SELECT id_feriado as idFeriado, nom_feriado as nomFeriado, desc_feriado as descFeriado, fecha_feriado as fechaFeriado, id_tipoferiado as idTipoFeriado FROM feriado WHERE id_feriado = ?;";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }

    public function Registrar($nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado)
    {
        $sql = "INSERT INTO feriado(nom_feriado, desc_feriado, fecha_feriado, id_tipoferiado) VALUES (?,?,?,?);";
        return $this->db->queryExecute($sql, [$nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado]);
    }

    public function Editar($idFeriado, $nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado)
    {
        $sql = "UPDATE feriado SET nom_feriado = ?, desc_feriado = ?, fecha_feriado = ?, id_tipoferiado = ? WHERE id_feriado = ?;";
        return $this->db->queryExecute($sql, [$nomFeriado, $descFeriado, $fechaFeriado, $idTipoFeriado, $idFeriado]);
    }

    public function Eliminar($id)
    {
        $sql = "DELETE FROM feriado WHERE id_feriado = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }
}
