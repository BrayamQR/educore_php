<?php
require_once '../lib/tcpdf/tcpdf.php';
require_once '../controllers/historial.controller.php';

// ── PARÁMETROS ───────────────────────────────────────────────
$tipo        = $_GET['tipo']        ?? '';
$estudiante  = $_GET['reporteEstudiante']  ?? '';
$fechaInicio = $_GET['reporteFechaInicio'] ?? '';
$fechaFin    = $_GET['reporteFechaFin']    ?? '';
$fecha       = $_GET['reporteFechaEspecifica'] ?? '';
$aula        = $_GET['reporteAula']        ?? '';
$estado      = $_GET['reporteEstado']      ?? '';

if (empty($tipo)) die('Tipo de reporte requerido');

$controller = new HistorialController();

switch ($tipo) {
    case 'estudiante':
        $data   = $controller->ReportePorEstudiante($estudiante, $fechaInicio, $fechaFin, $estado);
        $titulo = 'Reporte por Estudiante';
        break;
    case 'fecha':
        $data   = $controller->ReportePorFecha($fecha, $aula, $estado);
        $titulo = 'Reporte por Fecha';
        break;
    case 'resumen':
        $data   = $controller->ReportePorPeriodo($fechaInicio, $fechaFin, $aula, $estado);
        $titulo = 'Resumen por Periodo';
        break;
    default:
        die('Tipo inválido');
}

if (empty($data)) die('No hay datos para generar el reporte');

// ── CONFIGURACIÓN PDF ────────────────────────────────────────
$pdf = new TCPDF('P', 'mm', 'A4', true, 'UTF-8', false);
$pdf->SetCreator('Educore');
$pdf->SetAuthor('Educore');
$pdf->SetTitle($titulo);
$pdf->SetMargins(15, 15, 15);
$pdf->SetAutoPageBreak(true, 15);
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

$logoPath = "../../../public/logo2.png";

// ── HELPERS ──────────────────────────────────────────────────
function colorEstado($idEstado)
{
    switch ($idEstado) {
        case 1:
            return ['bg' => [220, 252, 231], 'fg' => [21, 128, 61]];   // verde - asistió
        case 2:
            return ['bg' => [255, 237, 213], 'fg' => [154, 52, 18]];   // naranja - tarde
        case 3:
            return ['bg' => [254, 226, 226], 'fg' => [153, 27, 27]];   // rojo - falta
        case 4:
            return ['bg' => [219, 234, 254], 'fg' => [30, 64, 175]];   // azul - justificado
        default:
            return ['bg' => [248, 250, 252], 'fg' => [30, 41, 59]];
    }
}

function cabeceraPDF($pdf, $logoPath, $titulo, $subtitulo = '')
{
    $pdf->SetFillColor(219, 234, 254);
    $pdf->Rect(0, 0, 210, 28, 'F');

    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 10, 6, 15, 15, 'PNG');
    }

    $pdf->SetTextColor(30, 64, 175);
    $pdf->SetFont('helvetica', 'B', 14);
    $pdf->SetXY(28, 7);
    $pdf->Cell(170, 7, 'EDUCORE - ' . strtoupper($titulo), 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetTextColor(71, 85, 105);
    $pdf->SetXY(28, 15);
    $linea = 'Generado el ' . date('d/m/Y H:i');
    if (!empty($subtitulo)) $linea .= '   |   ' . $subtitulo;
    $pdf->Cell(170, 5, $linea, 0, 1, 'L');
}

function bloqueResumen($pdf, $est, &$y)
{
    // Fondo encabezado estudiante
    $pdf->SetFillColor(241, 245, 249);
    $pdf->Rect(15, $y, 180, 11, 'F');

    $pdf->SetTextColor(30, 41, 59);
    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetXY(17, $y + 2);
    $nombre = strtoupper($est['apa_estudiante'] . ' ' . $est['ama_estudiante'] . ', ' . $est['nom_estudiante']);
    $pdf->Cell(95, 6, $nombre, 0, 0, 'L');

    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetTextColor(71, 85, 105);
    $pdf->SetXY(115, $y + 2);
    $pdf->Cell(45, 5, $est['desc_grado'] . ' - ' . $est['seccion_aula'], 0, 0, 'L');
    $pdf->SetXY(160, $y + 2);
    $pdf->Cell(33, 5, 'Doc: ' . $est['doc_estudiante'], 0, 0, 'R');

    $y += 13;

    // Badges de conteo
    $badges = [
        ['label' => 'Total',        'valor' => $est['total'],                        'r' => 99,  'g' => 102, 'b' => 241],
        ['label' => 'Asistencias',  'valor' => $est['asistencias'],                  'r' => 34,  'g' => 197, 'b' => 94],
        ['label' => 'Tardanzas',    'valor' => $est['tardanzas'],                    'r' => 251, 'g' => 146, 'b' => 60],
        ['label' => 'Faltas',       'valor' => $est['faltas'],                       'r' => 239, 'g' => 68,  'b' => 68],
        ['label' => 'Justificados', 'valor' => $est['justificados'],                 'r' => 59,  'g' => 130, 'b' => 246],
        ['label' => '% Asistencia', 'valor' => $est['porcentaje_asistencia'] . '%',  'r' => 16,  'g' => 185, 'b' => 129],
    ];

    $xBadge = 15;
    $anchoBadge = 30;
    foreach ($badges as $b) {
        $pdf->SetFillColor($b['r'], $b['g'], $b['b']);
        $pdf->SetTextColor(255, 255, 255);
        $pdf->SetFont('helvetica', 'B', 11);
        $pdf->SetXY($xBadge, $y);
        $pdf->Cell($anchoBadge, 9, $b['valor'], 0, 0, 'C', true);
        $pdf->SetFont('helvetica', '', 6.5);
        $pdf->SetTextColor(71, 85, 105);
        $pdf->SetXY($xBadge, $y + 9);
        $pdf->Cell($anchoBadge, 4, $b['label'], 0, 0, 'C');
        $xBadge += $anchoBadge;
    }

    $y += 15;
}

function encabezadoTablaDetalle($pdf, &$y)
{
    $pdf->SetFillColor(30, 64, 175);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->SetXY(15, $y);
    $pdf->Cell(45, 6, 'Fecha', 1, 0, 'C', true);
    $pdf->Cell(40, 6, 'Hora entrada', 1, 0, 'C', true);
    $pdf->Cell(95, 6, 'Estado', 1, 1, 'C', true);
    $y += 6;
}

function filaDetalle($pdf, $fila, &$y)
{
    $c = colorEstado($fila['id_estado']);
    $pdf->SetFillColor($c['bg'][0], $c['bg'][1], $c['bg'][2]);
    $pdf->SetTextColor(30, 41, 59);
    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetXY(15, $y);
    $pdf->Cell(45, 6, date('d/m/Y', strtotime($fila['fecha_asistencia'])), 1, 0, 'C', true);
    $pdf->Cell(40, 6, $fila['hora_asistencia'] ?? '-', 1, 0, 'C', true);
    $pdf->SetTextColor($c['fg'][0], $c['fg'][1], $c['fg'][2]);
    $pdf->SetFont('helvetica', 'B', 8);
    $pdf->Cell(95, 6, $fila['estado'], 1, 1, 'C', true);
    $y += 6;
}

// ════════════════════════════════════════════════════════════
// ── REPORTE POR ESTUDIANTE ───────────────────────────────────
// ════════════════════════════════════════════════════════════
if ($tipo === 'estudiante') {
    $subtitulo = '';
    if (!empty($fechaInicio) && !empty($fechaFin))
        $subtitulo = 'Periodo: ' . date('d/m/Y', strtotime($fechaInicio)) . ' al ' . date('d/m/Y', strtotime($fechaFin));

    $pdf->AddPage();
    cabeceraPDF($pdf, $logoPath, $titulo, $subtitulo);
    $y = 35;

    foreach ($data as $est) {
        $alturaEstimada = 13 + 15 + 6 + (count($est['detalle']) * 6) + 10;
        if ($y + $alturaEstimada > 270 && $y > 35) {
            $pdf->AddPage();
            $y = 20;
        }

        bloqueResumen($pdf, $est, $y);
        encabezadoTablaDetalle($pdf, $y);

        foreach ($est['detalle'] as $fila) {
            if ($y > 272) {
                $pdf->AddPage();
                $y = 20;
                encabezadoTablaDetalle($pdf, $y);
            }
            filaDetalle($pdf, $fila, $y);
        }

        $y += 10;
    }
}

// ════════════════════════════════════════════════════════════
// ── REPORTE POR FECHA ────────────────────────────────────────
// ════════════════════════════════════════════════════════════
if ($tipo === 'fecha') {
    $subtitulo = !empty($fecha) ? 'Fecha: ' . date('d/m/Y', strtotime($fecha)) : '';

    $pdf->AddPage();
    cabeceraPDF($pdf, $logoPath, $titulo, $subtitulo);
    $y = 35;

    foreach ($data as $est) {
        if ($y > 250) {
            $pdf->AddPage();
            $y = 20;
        }

        bloqueResumen($pdf, $est, $y);
        encabezadoTablaDetalle($pdf, $y);

        foreach ($est['detalle'] as $fila) {
            if ($y > 272) {
                $pdf->AddPage();
                $y = 20;
                encabezadoTablaDetalle($pdf, $y);
            }
            filaDetalle($pdf, $fila, $y);
        }

        $y += 10;
    }
}

// ════════════════════════════════════════════════════════════
// ── RESUMEN POR PERIODO ──────────────────────────────────────
// ════════════════════════════════════════════════════════════
if ($tipo === 'resumen') {
    $subtitulo = '';
    if (!empty($fechaInicio) && !empty($fechaFin))
        $subtitulo = 'Periodo: ' . date('d/m/Y', strtotime($fechaInicio)) . ' al ' . date('d/m/Y', strtotime($fechaFin));

    $pdf->AddPage();
    cabeceraPDF($pdf, $logoPath, $titulo, $subtitulo);
    $y = 35;

    // Tabla resumen general (todos los alumnos en una sola tabla)
    $pdf->SetFillColor(30, 64, 175);
    $pdf->SetTextColor(255, 255, 255);
    $pdf->SetFont('helvetica', 'B', 7.5);
    $pdf->SetXY(15, $y);
    $pdf->Cell(55, 7, 'Estudiante', 1, 0, 'C', true);
    $pdf->Cell(30, 7, 'Grado / Sección', 1, 0, 'C', true);
    $pdf->Cell(17, 7, 'Total', 1, 0, 'C', true);
    $pdf->Cell(17, 7, 'Asistió', 1, 0, 'C', true);
    $pdf->Cell(17, 7, 'Tarde', 1, 0, 'C', true);
    $pdf->Cell(17, 7, 'Falta', 1, 0, 'C', true);
    $pdf->Cell(17, 7, 'Justif.', 1, 0, 'C', true);
    $pdf->Cell(10, 7, '%', 1, 1, 'C', true);
    $y += 7;

    $fila_par = false;
    foreach ($data as $est) {
        if ($y > 272) {
            $pdf->AddPage();
            $y = 20;
            // Repetir encabezado
            $pdf->SetFillColor(30, 64, 175);
            $pdf->SetTextColor(255, 255, 255);
            $pdf->SetFont('helvetica', 'B', 7.5);
            $pdf->SetXY(15, $y);
            $pdf->Cell(55, 7, 'Estudiante', 1, 0, 'C', true);
            $pdf->Cell(30, 7, 'Grado / Sección', 1, 0, 'C', true);
            $pdf->Cell(17, 7, 'Total', 1, 0, 'C', true);
            $pdf->Cell(17, 7, 'Asistió', 1, 0, 'C', true);
            $pdf->Cell(17, 7, 'Tarde', 1, 0, 'C', true);
            $pdf->Cell(17, 7, 'Falta', 1, 0, 'C', true);
            $pdf->Cell(17, 7, 'Justif.', 1, 0, 'C', true);
            $pdf->Cell(10, 7, '%', 1, 1, 'C', true);
            $y += 7;
        }

        $bg = $fila_par ? [248, 250, 252] : [255, 255, 255];
        $pdf->SetFillColor($bg[0], $bg[1], $bg[2]);
        $pdf->SetTextColor(30, 41, 59);
        $pdf->SetFont('helvetica', '', 7.5);
        $pdf->SetXY(15, $y);

        $nombre = $est['apa_estudiante'] . ' ' . $est['ama_estudiante'] . ', ' . $est['nom_estudiante'];
        $pdf->Cell(55, 6, $nombre, 1, 0, 'L', true);
        $pdf->Cell(30, 6, $est['desc_grado'] . ' ' . $est['seccion_aula'], 1, 0, 'C', true);
        $pdf->Cell(17, 6, $est['total'], 1, 0, 'C', true);

        // Asistencias en verde
        $pdf->SetFillColor(220, 252, 231);
        $pdf->SetTextColor(21, 128, 61);
        $pdf->Cell(17, 6, $est['asistencias'], 1, 0, 'C', true);

        // Tardanzas en naranja
        $pdf->SetFillColor(255, 237, 213);
        $pdf->SetTextColor(154, 52, 18);
        $pdf->Cell(17, 6, $est['tardanzas'], 1, 0, 'C', true);

        // Faltas en rojo
        $pdf->SetFillColor(254, 226, 226);
        $pdf->SetTextColor(153, 27, 27);
        $pdf->Cell(17, 6, $est['faltas'], 1, 0, 'C', true);

        // Justificados en azul
        $pdf->SetFillColor(219, 234, 254);
        $pdf->SetTextColor(30, 64, 175);
        $pdf->Cell(17, 6, $est['justificados'], 1, 0, 'C', true);

        // Porcentaje - color según valor
        $pct = floatval($est['porcentaje_asistencia']);
        if ($pct >= 90) {
            $pdf->SetFillColor(220, 252, 231);
            $pdf->SetTextColor(21, 128, 61);
        } elseif ($pct >= 75) {
            $pdf->SetFillColor(255, 237, 213);
            $pdf->SetTextColor(154, 52, 18);
        } else {
            $pdf->SetFillColor(254, 226, 226);
            $pdf->SetTextColor(153, 27, 27);
        }
        $pdf->Cell(10, 6, $pct . '%', 1, 1, 'C', true);

        $y += 6;
        $fila_par = !$fila_par;
    }

    // ── Detalle por alumno debajo de la tabla resumen ──────────
    $y += 10;
    foreach ($data as $est) {
        if ($y + 40 > 272) {
            $pdf->AddPage();
            $y = 20;
        }

        bloqueResumen($pdf, $est, $y);
        encabezadoTablaDetalle($pdf, $y);

        foreach ($est['detalle'] as $fila) {
            if ($y > 272) {
                $pdf->AddPage();
                $y = 20;
                encabezadoTablaDetalle($pdf, $y);
            }
            filaDetalle($pdf, $fila, $y);
        }

        $y += 10;
    }
}

$pdf->Output('reporte_asistencia.pdf', 'I');
