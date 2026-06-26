<?php
class Helpers
{
    /**
     * Obtiene el día de la semana en español de una fecha
     * @param string $fecha formato Y-m-d
     * @return string Nombre del día en español
     */
    public static function ObtenerDiaSemana(string $fecha): string
    {
        $dias = [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo'
        ];
        return $dias[(int)date('N', strtotime($fecha))];
    }
}
