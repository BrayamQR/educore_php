<?php

namespace App\database;

use App\config\DBConnection;
use PDO;
use PDOException;
use Exception;

class DBExecutor
{
    private PDO $pdo;

    public function __construct()
    {
        $this->pdo = DBConnection::getConnection();
    }

    /**
     * Ejecuta una consulta SQL de forma segura usando prepared statements
     * 
     * @param string $sql Consulta SQL con placeholders (?)
     * @param array $params Parámetros para los placeholders (previene SQL injection)
     * @return array|bool|string 
     *         - SELECT: array de resultados
     *         - INSERT: ID del registro insertado (string) o true si no hay auto-increment
     *         - UPDATE/DELETE: true si afectó filas, false si no hubo cambios
     * @throws Exception Si hay un error en la BD
     */
    public function queryExecute(string $sql, array $params = [])
    {
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);

            if ($stmt->columnCount() > 0) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

                while ($stmt->nextRowset()) {
                    // Consumir y descartar resultsets adicionales
                }

                $stmt->closeCursor();
                return $data;
            }

            $rowCount = $stmt->rowCount();
            $lastId = $this->pdo->lastInsertId();

            $stmt->closeCursor();

            if (!empty($lastId)) {
                return $lastId;
            }

            return $rowCount > 0;
        } catch (PDOException $e) {
            throw new Exception("DB Error: " . $e->getMessage(), (int)$e->getCode());
        }
    }

    public function lastInsertId(): string
    {
        return $this->pdo->lastInsertId();
    }

    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    public function rollBack(): bool
    {
        return $this->pdo->rollBack();
    }

    public function inTransaction(): bool
    {
        return $this->pdo->inTransaction();
    }
}
