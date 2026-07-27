<?php

namespace App\config;

use Dotenv\Dotenv;

class Env
{
    private static bool $loaded = false;
    public const ROOT_PATH = __DIR__ . '/../../../';
    public static function load(): void
    {
        if (self::$loaded) {
            return;
        }

        $dotenv = Dotenv::createImmutable(self::ROOT_PATH);
        $dotenv->load();

        self::$loaded = true;
    }
}
