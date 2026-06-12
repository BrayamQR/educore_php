<?php
require_once '../controllers/estudiante.controller.php';
require_once '../lib/tcpdf/tcpdf.php';

$jsonString = $_GET['estudiantes'] ?? null;

if (empty($jsonString)) {
    die('No se recibieron estudiantes');
}

$estudiantes = json_decode($jsonString, true);
if (!is_array($estudiantes) || empty($estudiantes)) {
    die('Datos inválidos');
}

$controller = new EstudianteController();

// Crear PDF con tamaño A6 (105 x 148 mm)
$pdf = new TCPDF('P', 'mm', array(105, 148), true, 'UTF-8', false);

// Configuración general
$pdf->SetCreator('Educore');
$pdf->SetAuthor('Educore');
$pdf->SetTitle('Carnets de estudiantes');
$pdf->SetMargins(8, 8, 8);
$pdf->SetAutoPageBreak(false);
$pdf->setPrintHeader(false);
$pdf->setPrintFooter(false);

$directorioQR = "../../../public/qr-students/";
$logoPath      = "../../../public/logo2.png";

foreach ($estudiantes as $item) {
    $idEstudiante  = intval($item['idEstudiante']);
    $infoEstudiante = $controller->Mostrar($idEstudiante);

    if (empty($infoEstudiante)) continue;

    $pdf->AddPage();

    // ── FONDO CABECERA ──────────────────────────────────────────
    $pdf->SetFillColor(219, 234, 254); // sky-500
    $pdf->Rect(0, 0, 105, 30, 'F');

    // ── LOGO ────────────────────────────────────────────────────
    if (file_exists($logoPath)) {
        $pdf->Image($logoPath, 5, 5, 18, 18, 'PNG');
    }

    // ── NOMBRE INSTITUCIÓN ──────────────────────────────────────
    $pdf->SetTextColor(30, 64, 175);
    $pdf->SetFont('helvetica', 'B', 11);
    $pdf->SetXY(26, 8);
    $pdf->Cell(74, 6, 'EDUCORE', 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetXY(26, 15);
    $pdf->Cell(74, 5, 'Sistema de Gestión Escolar', 0, 1, 'L');

    $pdf->SetFont('helvetica', '', 7);
    $pdf->SetXY(26, 21);
    $pdf->Cell(74, 5, 'Año lectivo 2025', 0, 1, 'L');

    // ── NOMBRE ESTUDIANTE ───────────────────────────────────────
    $pdf->SetTextColor(30, 41, 59); // gris oscuro
    $pdf->SetFont('helvetica', 'B', 12);
    $pdf->SetXY(8, 35);
    $nombreCompleto = strtoupper($infoEstudiante['apaEstudiante'] . ' ' . $infoEstudiante['amaEstudiante']);
    $pdf->Cell(89, 7, $nombreCompleto, 0, 1, 'C');

    $pdf->SetFont('helvetica', 'B', 10);
    $pdf->SetXY(8, 43);
    $pdf->Cell(89, 6, strtoupper($infoEstudiante['nomEstudiante']), 0, 1, 'C');

    // ── LINEA SEPARADORA ────────────────────────────────────────
    $pdf->SetDrawColor(14, 165, 233);
    $pdf->SetLineWidth(0.5);
    $pdf->Line(8, 52, 97, 52);

    // ── DATOS ───────────────────────────────────────────────────
    $pdf->SetFont('helvetica', '', 8);
    $pdf->SetTextColor(100, 116, 139); // gris medio

    $tipoDoc = $infoEstudiante['idTipoDocumento'] == 1 ? 'D.N.I.' : 'C.E.';

    $datos = [
        ['label' => $tipoDoc . ':', 'valor' => $infoEstudiante['docEstudiante']],
        ['label' => 'Grado:',       'valor' => $infoEstudiante['descGrado'] . ' - ' . $infoEstudiante['seccionAula']],
        ['label' => 'Nivel:',       'valor' => $infoEstudiante['descNivel']],
    ];

    $y = 56;
    foreach ($datos as $dato) {
        $pdf->SetFont('helvetica', 'B', 8);
        $pdf->SetTextColor(71, 85, 105);
        $pdf->SetXY(8, $y);
        $pdf->Cell(20, 6, $dato['label'], 0, 0, 'L');

        $pdf->SetFont('helvetica', '', 8);
        $pdf->SetTextColor(30, 41, 59);
        $pdf->SetXY(28, $y);
        $pdf->Cell(69, 6, $dato['valor'], 0, 1, 'L');
        $y += 7;
    }

    // ── QR ──────────────────────────────────────────────────────
    $rutaQR = $directorioQR . $infoEstudiante['qrEstudiante'];
    if (!empty($infoEstudiante['qrEstudiante']) && file_exists($rutaQR)) {
        // Fondo blanco redondeado para el QR
        $pdf->SetFillColor(248, 250, 252);
        $pdf->RoundedRect(27, 82, 51, 51, 3, '1111', 'F');

        $pdf->Image($rutaQR, 30, 84, 45, 45, 'PNG');
    }

    // ── TEXTO DEBAJO DEL QR ─────────────────────────────────────
    $pdf->SetFont('helvetica', 'I', 7);
    $pdf->SetTextColor(148, 163, 184);
    $pdf->SetXY(8, 135);
    $pdf->Cell(89, 5, 'Escanea el código QR para identificar al estudiante', 0, 0, 'C');

    // ── BORDE GENERAL ───────────────────────────────────────────
    $pdf->SetDrawColor(226, 232, 240);
    $pdf->SetLineWidth(0.3);
    $pdf->Rect(2, 2, 101, 144);
}

// Descargar PDF
$pdf->Output('carnets_estudiantes.pdf', 'I');
