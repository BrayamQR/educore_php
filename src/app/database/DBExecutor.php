<?php
require_once __DIR__ . '/../config/DBConnection.php';

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
            // Preparar y ejecutar consulta con prepared statements
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute($params);

            // Detección automática del tipo de consulta
            // Si retorna columnas → SELECT
            if ($stmt->columnCount() > 0) {
                $data = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Limpiar resultados adicionales de stored procedures
                while ($stmt->nextRowset()) {
                    // Consumir y descartar resultsets adicionales
                }

                $stmt->closeCursor();
                return $data;
            }

            // Es INSERT/UPDATE/DELETE
            $rowCount = $stmt->rowCount();
            $lastId = $this->pdo->lastInsertId();

            $stmt->closeCursor();

            // Si es INSERT y se generó un ID, retornarlo
            if (!empty($lastId)) {
                return $lastId;  // string: "15"
            }

            // Para UPDATE/DELETE: true si afectó filas, false si no
            return $rowCount > 0;
        } catch (PDOException $e) {
            throw new Exception("DB Error: " . $e->getMessage(), (int)$e->getCode());
        }
    }

    /**
     * Obtiene el último ID insertado
     * 
     * @return string ID del último registro insertado
     */
    public function lastInsertId(): string
    {
        return $this->pdo->lastInsertId();
    }

    /**
     * Inicia una transacción
     */
    public function beginTransaction(): bool
    {
        return $this->pdo->beginTransaction();
    }

    /**
     * Confirma una transacción
     */
    public function commit(): bool
    {
        return $this->pdo->commit();
    }

    /**
     * Revierte una transacción
     */
    public function rollBack(): bool
    {
        return $this->pdo->rollBack();
    }

    /**
     * Verifica si hay una transacción activa
     */
    public function inTransaction(): bool
    {
        return $this->pdo->inTransaction();
    }
}
