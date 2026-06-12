<?php
require_once("../database/DBExecutor.php");

class UsuarioModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function Listar()
    {
        $sql = "SELECT u.*, p.nom_perfil AS nomPerfil FROM usuario AS u INNER JOIN perfil AS p ON u.id_perfil = p.id_perfil WHERE u.vigente = 1";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar($dato)
    {
        $sql = "SELECT u.*, p.nom_perfil AS nomPerfil FROM usuario AS u INNER JOIN perfil AS p ON u.id_perfil = p.id_perfil WHERE u.vigente = 1 AND p.vigente = 1 AND (u.nom_usuario LIKE ? OR u.usu_usuario LIKE ? OR u.email_usuario LIKE ? OR u.tel_usuario LIKE ? OR p.nom_perfil LIKE ?);";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato, $dato, $dato, $dato, $dato]);
    }

    public function Mostrar($id)
    {
        $sql = "SELECT u.id_usuario AS idUsuario, u.cod_usuario AS codUsuario, u.nom_usuario AS nomUsuario, u.tel_usuario AS telUsuario, u.email_usuario AS emailUsuario, u.dir_usuario AS dirUsuario, u.usu_usuario AS usuUsuario, p.id_perfil AS idPerfil, p.nom_perfil as nomPerfil FROM usuario AS u INNER JOIN perfil AS p ON u.id_perfil = p.id_perfil WHERE u.id_usuario = ? AND u.vigente = 1 AND p.vigente = 1;";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }

    public function Registrar($codUsuario, $nomUsuario, $usuUsuario, $passUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil)
    {
        $sql = "INSERT INTO usuario(cod_usuario, nom_usuario, usu_usuario, pass_usuario, tel_usuario, email_usuario, dir_usuario, id_perfil) VALUES (?,?,?,?,?,?,?,?)";
        return $this->db->queryExecute($sql, [$codUsuario, $nomUsuario, $usuUsuario, $passUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil]);
    }

    public function Editar($idUsuario, $codUsuario, $nomUsuario, $usuUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil)
    {
        $sql = "UPDATE usuario SET cod_usuario = ?, nom_usuario = ?, usu_usuario = ?,tel_usuario = ? ,email_usuario = ?,dir_usuario = ?, id_perfil = ? WHERE id_usuario = ? ";
        return $this->db->queryExecute($sql, [$codUsuario, $nomUsuario, $usuUsuario, $telUsuario, $emailUsuario, $dirUsuario, $idPerfil, $idUsuario]);
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE usuario SET vigente = 0 WHERE id_usuario = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function CambiarEstado($id)
    {
        $sql = "UPDATE usuario SET estado = NOT estado WHERE id_usuario = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function Login($usuUsuario)
    {
        $sql = "SELECT u.id_usuario AS idUsuario, u.nom_usuario AS nomUsuario, 
                   u.usu_usuario AS usuUsuario, u.email_usuario AS emailUsuario,
                   u.pass_usuario AS passUsuario,
                   p.id_perfil AS idPerfil, p.nom_perfil AS nomPerfil 
            FROM usuario AS u 
            INNER JOIN perfil AS p ON u.id_perfil = p.id_perfil 
            WHERE u.usu_usuario = ? 
            AND u.vigente = 1 
            AND u.estado = 1
            AND p.vigente = 1";

        $result = $this->db->queryExecute($sql, [$usuUsuario]);
        return !empty($result) ? $result[0] : null;
    }

    public function RestaurarPassword($id, $usuUsuario)
    {
        $newPass = password_hash($usuUsuario, PASSWORD_BCRYPT);
        $sql = "UPDATE usuario SET pass_usuario = ? WHERE id_usuario = ?";
        return $this->db->queryExecute($sql, [$newPass, $id]);
    }
}
