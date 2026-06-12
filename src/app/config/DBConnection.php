<?php
class DBConnection
{
    private static $pdo = null;

    private function __construct() {}
    private function __clone() {}

    public static function getConnection(): PDO
    {
        if (self::$pdo === null) {

            $dsn = "mysql:host=localhost;dbname=dbeducore;charset=utf8mb4";

            self::$pdo = new PDO(
                $dsn,
                "root",
                "12345678",
                [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => false,
                ]
            );
        }

        return self::$pdo;
    }
}
