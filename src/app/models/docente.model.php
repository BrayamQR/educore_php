<?php
require_once '../database/DBExecutor.php';

class DocenteModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor;
    }

    public function Listar()
    {
        $sql = "SELECT * FROM docente WHERE vigente = 1;";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar($dato)
    {
        $sql = "SELECT * FROM docente WHERE vigente = 1 AND (nom_docente LIKE ? OR doc_docente LIKE ?);";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato, $dato]);
    }

    public function Mostrar($id)
    {
        $sql = "SELECT id_docente AS idDocente, id_tipodocumento AS idTipoDocumento, doc_docente AS docDocente, nom_docente AS nomDocente, id_cargo AS idCargo, id_tipocontrato AS idTipoContrato, dir_docente AS dirDocente, tel_docente AS telDocente, email_docente AS emailDocente FROM docente WHERE id_docente = ? AND vigente = 1;";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }

    public function Registrar($idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente)
    {
        $sql = "INSERT INTO docente(id_tipodocumento, doc_docente, nom_docente, id_cargo, id_tipocontrato, dir_docente, tel_docente, email_docente) VALUES (?, ?, ?, ?, ?, ?, ?, ?);";
        return $this->db->queryExecute($sql, [$idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente]);
    }

    public function Editar($idDocente, $idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente)
    {
        $sql = "UPDATE docente SET id_tipodocumento = ?, doc_docente = ?,nom_docente = ?, id_cargo = ?, id_tipocontrato = ?, dir_docente = ?, tel_docente = ?, email_docente = ? WHERE id_docente = ?;";
        return $this->db->queryExecute($sql, [$idTipoDocumento, $docDocente, $nomDocente, $idCargo, $idTipoContrato, $dirDocente, $telDocente, $emailDocente, $idDocente]);
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE docente SET vigente = 0 WHERE id_docente = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }
}
