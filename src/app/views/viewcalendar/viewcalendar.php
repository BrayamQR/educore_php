<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Calendario académico | Educore</title>
</head>

<body>
    <?php
    include("../../../shared/global/global_loading.php");
    ?>
    <main class="bg-gray-200  min-h-[calc(100vh-60px)]">
        <div class="lg:ml-[350px] mt-[60px] p-5 flex flex-col gap-5">
            <div class="bg-white p-5 rounded-lg shadow-md">
                <div class="flex lg:flex-row gap-5 flex-col lg:items-center lg:justify-between">
                    <div class="flex gap-4 items-center">
                        <div class="w-12 h-12 bg-sky-300/40 rounded-xl flex items-center justify-center">
                            <i class="bi bi-calendar text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Calendario académico</h2>
                            <span class="text-sm text-gray-500">Vizualiza como esta organizado el calendario academico</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 justify-between">

                        <custom-button
                            id="btnToggleFiltros"
                            onclick="toggleFiltros()"
                            icon="bi bi-sliders"
                            label="Más filtros"
                            btn-class="lg:hidden hover:bg-gray-200 text-gray-700">
                        </custom-button>
                    </div>
                    <div class="flex gap-4 lg:flex-row flex-col">

                        <div class="">
                            <custom-select
                                label="Año lectivo"
                                name="filtroAnioLectivo">
                            </custom-select>
                        </div>
                        <div id="panelFiltros" class="hidden lg:flex flex-col lg:flex-row gap-4">
                            <div class="flex-1">
                                <custom-select
                                    label="Tipo de evento"
                                    name="filtroTipoEvento">
                                </custom-select>
                            </div>
                            <div class="shrink-0 flex items-center">
                                <custom-button
                                    btn-class="hover:bg-gray-200 text-gray-700"
                                    label="Limpiar"
                                    icon="bi bi-x-circle"
                                    onclick="LimpiarFiltros()">
                                </custom-button>
                            </div>
                        </div>

                    </div>
                </div>

            </div>
            <div class="bg-white rounded-lg shadow-md flex flex-col overflow-auto md:max-h-[calc(100vh-220px)] max-h-[calc(100vh-350px)] scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400 [-webkit-overflow-scrolling:touch]" id="contentCalendar">
                <div id="calendar" class="p-5 min-w-[1000px]"></div>
            </div>
        </div>
    </main>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./viewcalendar.js"></script>
</body>

</html>