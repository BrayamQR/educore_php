<?php
class Helpers
{
    private static function DiasSemana(): array
    {
        return [
            1 => 'Lunes',
            2 => 'Martes',
            3 => 'Miércoles',
            4 => 'Jueves',
            5 => 'Viernes',
            6 => 'Sábado',
            7 => 'Domingo'
        ];
    }
    /**
     * Obtiene el día de la semana en español de una fecha
     * @param string $fecha formato Y-m-d
     * @return string Nombre del día en español
     */
    public static function ObtenerDiaSemana(string $fecha): string
    {
        return self::DiasSemana()[(int)date('N', strtotime($fecha))];
    }


    /**
     * Limpia (trim) recursivamente los valores de un array,
     * soportando campos simples y arrays (ej: checkboxes con name="dias[]")
     * @param array $data usualmente $_POST
     * @return array datos limpios
     */
    public static function TrimData(array $data): array
    {
        return array_map(function ($value) {
            if (is_array($value)) {
                return self::TrimData($value);
            }
            return is_string($value) ? trim($value) : $value;
        }, $data);
    }

    /**
     * Obtiene el nombre del día de la semana a partir de su número (1-7)
     * @param int $numeroDia 1=Lunes ... 7=Domingo
     * @return string Nombre del día en español
     */
    public static function ObtenerNombreDiaSemana(int $numeroDia): string
    {
        return self::DiasSemana()[$numeroDia] ?? '';
    }

    /**
     * Valida que un valor booleano recibido desde un formulario (checkbox
     * forzado como "0"/"1" en el front) sea exactamente uno de esos dos
     * valores. Evita los falsos negativos de empty("0") === true.
     * @param mixed $valor
     * @return bool
     */
    public static function EsBooleanoValido($valor): bool
    {
        return isset($valor) && in_array($valor, ['0', '1'], true);
    }
}
