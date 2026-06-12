<?php
require_once '../database/DBExecutor.php';

class EstudianteModel
{
    private $db;

    public function __construct()
    {
        $this->db = new DBExecutor;
    }

    public function Listar()
    {
        $sql = "SELECT e.*, g.id_grado, g.desc_grado, a.seccion_aula, n.id_nivel, n.desc_nivel FROM estudiante AS e INNER JOIN aula AS a ON e.id_aula = a.id_aula INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel WHERE e.vigente = 1 ORDER BY g.id_grado, e.apa_estudiante;";
        return $this->db->queryExecute($sql, []);
    }

    public function ListarSinQR()
    {
        $sql = "SELECT e.*, g.id_grado, g.desc_grado, a.seccion_aula, n.id_nivel, n.desc_nivel FROM estudiante AS e INNER JOIN aula AS a ON e.id_aula = a.id_aula INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel WHERE e.vigente = 1 AND (qr_estudiante is null OR qr_estudiante = '') ORDER BY g.id_grado, e.apa_estudiante;";
        return $this->db->queryExecute($sql, []);
    }

    public function Buscar($dato)
    {
        $sql = "SELECT e.*, g.id_grado, g.desc_grado, a.seccion_aula, n.id_nivel, n.desc_nivel FROM estudiante AS e INNER JOIN aula AS a ON e.id_aula = a.id_aula INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN nivel AS n ON a.id_nivel = n.id_nivel WHERE e.vigente  = 1 AND (e.doc_estudiante LIKE ? OR e.apa_estudiante LIKE ? OR e.ama_estudiante LIKE ? OR e.nom_estudiante LIKE ? OR g.desc_grado LIKE ? OR n.desc_nivel LIKE ? OR a.seccion_aula LIKE ?) ORDER BY g.id_grado, e.apa_estudiante;";
        $dato = "%{$dato}%";
        return $this->db->queryExecute($sql, [$dato, $dato, $dato, $dato, $dato, $dato, $dato]);
    }

    public function BuscarPorDNI($dato)
    {
        $sql = "SELECT e.*, g.desc_grado, a.seccion_aula, n.id_nivel, n.desc_nivel FROM estudiante AS e INNER JOIN aula as a ON e.id_aula = a.id_aula INNER JOIN grado AS g ON g.id_grado = a.id_grado INNER JOIN nivel AS n ON n.id_nivel = a.id_nivel WHERE e.doc_estudiante = ? AND e.vigente = 1;";
        $result = $this->db->queryExecute($sql, [$dato]);
        return !empty($result) ? $result[0] : null;
    }

    public function Mostrar($id)
    {
        $sql = "SELECT e.id_estudiante AS idEstudiante, e.id_tipodocumento AS idTipoDocumento, e.doc_estudiante AS docEstudiante, e.nom_estudiante AS nomEstudiante, e.apa_estudiante AS apaEstudiante, e.ama_estudiante AS amaEstudiante, e.fecha_nacimiento AS fechaNacimiento, e.id_sexo as idSexo, e.nom_apoderado as nomApoderado, e.tel_apoderado AS telApoderado, e.est_matricula as estMatricula, e.id_aula as idAula, e.qr_estudiante AS qrEstudiante, g.desc_grado AS descGrado, a.seccion_aula AS seccionAula, n.desc_nivel AS descNivel, e.vigente FROM estudiante AS e INNER JOIN aula AS a ON e.id_aula = a.id_aula INNER JOIN grado AS g ON a.id_grado = g.id_grado INNER JOIN nivel AS n ON n.id_nivel = a.id_nivel WHERE e.id_estudiante = ? AND e.vigente = 1 AND a.vigente = 1;";
        $result = $this->db->queryExecute($sql, [$id]);
        return !empty($result) ? $result[0] : null;
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
        $sql = "INSERT INTO estudiante (id_tipodocumento, doc_estudiante, nom_estudiante, apa_estudiante, ama_estudiante, fecha_nacimiento, id_sexo, nom_apoderado, tel_apoderado, est_matricula, id_aula) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);";
        return $this->db->queryExecute($sql, [$idTipoDocumento, $docEstudiante, $nomEstudiante, $apaEstudiante, $amaEstudiante, $fechaNacimiento, $idSexo, $nomApoderado, $telApoderado, $estMatricula, $idAula]);
    }

    public function editar(
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
        $sql = "UPDATE estudiante SET id_tipodocumento = ?, doc_estudiante = ?, nom_estudiante = ?, apa_estudiante = ?, ama_estudiante = ?, fecha_nacimiento = ?, id_sexo = ?, nom_apoderado = ?, tel_apoderado = ?, est_matricula = ?, id_aula = ? WHERE id_estudiante = ?;";
        return $this->db->queryExecute($sql, [$idTipoDocumento, $docEstudiante, $nomEstudiante, $apaEstudiante, $amaEstudiante, $fechaNacimiento, $idSexo, $nomApoderado, $telApoderado, $estMatricula, $idAula, $idEstudiante]);
    }

    public function Eliminar($id)
    {
        $sql = "UPDATE estudiante SET vigente = 0 WHERE id_estudiante = ?;";
        return $this->db->queryExecute($sql, [$id]);
    }

    public function ActualizarQR($id, $nombreQR)
    {
        $sql = "UPDATE estudiante 
            SET qr_estudiante = ? 
            WHERE id_estudiante = ?";

        return $this->db->queryExecute($sql, [$nombreQR, $id]);
    }

    public function LimpiarQR($id)
    {
        $sql = "UPDATE estudiante SET qr_estudiante = NULL WHERE id_estudiante = ?";
        return $this->db->queryExecute($sql, [$id]);
    }
}
