<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Asistencia | Educore</title>
</head>

<body>
    <?php
    include("../../../shared/global/global_loading.php");
    ?>
    <main class="bg-gray-200 min-h-[calc(100vh-60px)]">
        <div class="lg:ml-[350px] mt-[60px] p-5 flex flex-col gap-5">

            <!-- Header -->
            <div class="bg-white p-5 rounded-lg shadow-md">
                <div class="flex lg:flex-row gap-5 flex-col lg:items-center lg:justify-between mb-5">
                    <div class="flex gap-4 items-center">
                        <div class="w-12 h-12 bg-sky-300/40 rounded-xl flex items-center justify-center">
                            <i class="bi bi-qr-code-scan text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Marcar asistencia</h2>
                            <span class="text-sm text-gray-500">Marcar la asistencia por Codigo QR o busqueda</span>
                        </div>
                    </div>
                </div>
                <div>
                    <custom-autocomplete
                        class=""
                        label="Buscar alumno..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-autocomplete>
                </div>
            </div>

            <!-- Contenedor principal -->
            <div class="bg-black rounded-lg shadow-md overflow-hidden" id="content">

                <!-- Área de la cámara -->
                <div class="qr-camera-wrapper">

                    <!-- Video feed -->
                    <video id="cameraFeed" class="qr-video" autoplay playsinline muted></video>

                    <!-- Overlay: 4 paneles oscuros alrededor del recuadro -->
                    <div class="qr-overlay-top"></div>
                    <div class="qr-overlay-bottom"></div>
                    <div class="qr-overlay-left"></div>
                    <div class="qr-overlay-right"></div>

                    <!-- Marco con esquinas y línea de escaneo -->
                    <div class="qr-frame-wrapper">
                        <div class="qr-frame">
                            <span class="qr-corner qr-corner-tl"></span>
                            <span class="qr-corner qr-corner-tr"></span>
                            <span class="qr-corner qr-corner-bl"></span>
                            <span class="qr-corner qr-corner-br"></span>
                            <div class="qr-scan-line"></div>
                        </div>
                    </div>

                    <!-- Instrucción -->
                    <p class="qr-hint">
                        <i class="bi bi-qr-code-scan me-2"></i>Acerca el código QR al recuadro
                    </p>

                </div>

            </div>
        </div>
    </main>
    <dialog-modal id="DialogInfoScan" size="max-w-xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-blue-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-person-check-fill text-blue-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold">Información del estudiante</h3>
                <p class="text-sm text-neutral-500">Datos detectados por código QR</p>
            </div>
        </div>

        <div slot="body">
            <!-- Barra de progreso del cierre automático -->
            <div class="mb-4 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div id="autoCloseProgress" class="h-full bg-green-500 rounded-full transition-all duration-1000 ease-linear" style="width: 0%"></div>
            </div>

            <!-- Icono de confirmación grande -->
            <div class="flex justify-center mb-3">
                <div class="w-24 h-24 rounded-full bg-linear-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <i class="bi bi-person-check-fill text-white text-5xl"></i>
                </div>
            </div>

            <!-- Nombre centrado -->
            <div class="text-center mb-4">
                <h3 id="fullName" class="text-lg font-bold text-gray-900 mb-1">---</h3>
                <p class="text-xs text-emerald-600 font-medium flex items-center justify-center gap-1">
                    <i class="bi bi-check-circle-fill"></i>
                    Asistencia registrada
                </p>
            </div>

            <!-- Grid de información -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2">

                <!-- Documento -->
                <div class="lg:col-span-2 bg-slate-50 rounded-lg p-2.5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                            <i class="bi bi-card-text text-slate-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-slate-500 block">Documento</span>
                            <span id="docNumber" class="text-sm font-semibold text-slate-900 block truncate">---</span>
                        </div>
                    </div>
                </div>

                <!-- Grado -->
                <div class="bg-blue-50 rounded-lg p-2.5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                            <i class="bi bi-book text-blue-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-blue-600 block">Grado</span>
                            <span id="grade" class="text-sm font-semibold text-blue-900 block truncate">---</span>
                        </div>
                    </div>
                </div>

                <!-- Nivel -->
                <div class="bg-purple-50 rounded-lg p-2.5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                            <i class="bi bi-mortarboard text-purple-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-purple-600 block">Nivel</span>
                            <span id="level" class="text-sm font-semibold text-purple-900 block truncate">---</span>
                        </div>
                    </div>
                </div>

                <!-- Sexo -->
                <div class="bg-pink-50 rounded-lg p-2.5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-pink-100 flex items-center justify-center shrink-0">
                            <i class="bi bi-gender-ambiguous text-pink-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-pink-600 block">Sexo</span>
                            <span id="gender" class="text-sm font-semibold text-pink-900 block truncate">---</span>
                        </div>
                    </div>
                </div>

                <!-- Apoderado -->
                <div class="bg-emerald-50 rounded-lg p-2.5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                            <i class="bi bi-person-check text-emerald-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-emerald-600 block">Apoderado</span>
                            <span id="guardian" class="text-sm font-semibold text-emerald-900 block truncate">---</span>
                        </div>
                    </div>
                </div>

                <!-- Teléfono -->
                <div class="lg:col-span-2 bg-amber-50 rounded-lg p-2.5">
                    <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                            <i class="bi bi-telephone text-amber-600 text-sm"></i>
                        </div>
                        <div class="flex-1 min-w-0">
                            <span class="text-xs text-amber-600 block">Teléfono del apoderado</span>
                            <span id="phone" class="text-sm font-semibold text-amber-900 block truncate">---</span>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalInfoScan()">
            </custom-button>
        </div>
    </dialog-modal>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./insertatten.js"></script>
</body>

</html>