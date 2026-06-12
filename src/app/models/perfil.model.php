<?php
require_once("../database/DBExecutor.php");

class PerfilModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor();
    }

    public function Listar()
    {
        $sql = "SELECT p.*, COUNT(mp.id_menu) AS total_menus FROM perfil AS p LEFT JOIN menubyperfil AS mp ON p.id_perfil = mp.id_perfil AND mp.vigente = 1 WHERE p.vigente = 1 GROUP BY p.id_perfil, p.nom_perfil, p.desc_perfil, p.estado, p.vigente";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar($dato)
    {
        $sql = "SELECT p.*, COUNT(mp.id_menu) AS total_menus FROM perfil AS p LEFT JOIN menubyperfil AS mp ON p.id_perfil = mp.id_perfil AND mp.vigente = 1 WHERE p.vigente = 1 AND p.nom_perfil LIKE ? GROUP BY p.id_perfil, p.nom_perfil, p.desc_perfil, p.estado, p.vigente";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato]);
    }

    public function mostrar($id)
    {
        $sql = "SELECT p.id_perfil AS idPerfil, p.nom_perfil AS nomPerfil, p.desc_perfil AS descPerfil, p.estado, p.vigente, COUNT(mp.id_menu) AS totalMenus, COUNT(CASE WHEN m.id_menupadre = 0 THEN 1 END) AS totalMenusPrincipales FROM perfil AS p LEFT JOIN menubyperfil AS mp ON p.id_perfil = mp.id_perfil AND mp.vigente = 1 LEFT JOIN menu AS m ON mp.id_menu = m.id_menu WHERE p.id_perfil = ? AND p.vigente = 1 GROUP BY p.id_perfil, p.nom_perfil, p.desc_perfil, p.estado, p.vigente";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
    }

    public function Registrar($nomPerfil, $descPerfil)
    {
        $sql = "INSERT INTO perfil (nom_perfil, desc_perfil) VALUES (?, ?)";
        return $this->db->queryExecute($sql, [$nomPerfil, $descPerfil]);
    }

    public function Editar($idPerfil, $nomPerfil, $descPerfil)
    {
        $sql = "UPDATE perfil SET nom_perfil = ?, desc_perfil = ? WHERE id_perfil = ?";
        return $this->db->queryExecute($sql, [$nomPerfil, $descPerfil, $idPerfil]);
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE perfil SET vigente = 0 WHERE id_perfil = ?";
        return $this->db->queryExecute($sql, [$id]);
    }
    public function CambiarEstado($id)
    {
        $sql = "UPDATE perfil SET estado = NOT estado WHERE id_perfil = ?";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function AsignarPermisos($idPerfil, $permisos)
    {
        try {
            $this->db->beginTransaction();

            foreach ($permisos as $permiso) {
                $idMenu = $permiso['idMenu'];
                $seleccionado = $permiso['seleccionado'];
                $sqlCheck = "SELECT vigente FROM menubyperfil WHERE id_perfil = ? AND id_menu = ?";
                $resultado = $this->db->queryExecute($sqlCheck, [$idPerfil, $idMenu]);
                if (!empty($resultado)) {
                    $vigenteActual = (bool)$resultado[0]['vigente'];

                    if ($vigenteActual === $seleccionado) {
                        continue;
                    } else {
                        $nuevoEstado = $seleccionado ? 1 : 0;
                        $sqlUpdate = "UPDATE menubyperfil SET vigente = ? WHERE id_perfil = ? AND id_menu = ?";
                        $this->db->queryExecute($sqlUpdate, [$nuevoEstado, $idPerfil, $idMenu]);
                    }
                } else {
                    if ($seleccionado) {
                        $sqlInsert = "INSERT INTO menubyperfil (id_perfil, id_menu, vigente) VALUES (?, ?, 1)";
                        $this->db->queryExecute($sqlInsert, [$idPerfil, $idMenu]);
                    }
                }
            }

            $this->db->commit();
            return true;
        } catch (Exception $e) {
            $this->db->rollback();
            error_log("Error en AsignarPermisos: " . $e->getMessage());
            return false;
        }
    }
}
