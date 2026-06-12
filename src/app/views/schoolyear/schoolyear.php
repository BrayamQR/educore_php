<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Año lectivo | Educore</title>
</head>

<body>
    <?php
    include("../../../shared/global/global_loading.php");
    ?>
    <main class="bg-gray-200  min-h-[calc(100vh-60px)]">
        <div class="lg:ml-[350px] mt-[60px] p-5 flex flex-col gap-5">
            <div class="bg-white p-5 rounded-lg shadow-md">
                <div class="flex lg:flex-row gap-5 flex-col lg:items-center lg:justify-between mb-5">
                    <div class="flex gap-4 items-center">
                        <div class="w-12 h-12 bg-sky-300/40 rounded-xl flex items-center justify-center">
                            <i class="bi bi-calendar3 text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Año lectivo</h2>
                            <span class="text-sm text-gray-500">Administración del año lectivo</span>
                        </div>
                    </div>
                    <div>
                        <custom-button
                            id="btnNuevo"
                            btn-class="bg-blue-500 hover:bg-blue-900 text-white"
                            label="Nuevo"
                            icon="bi bi-plus-lg"
                            onclick="openModalForm()">
                        </custom-button>
                    </div>
                </div>
                <div class="flex flex-col gap-4">
                    <custom-text-field
                        class=""
                        label="Buscar año lectivo..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>
                </div>
            </div>
            <div id="bannerAniosVencidos" class="hidden"></div>
            <div class="bg-white rounded-lg shadow-md flex flex-col  divide-neutral-200 divide-y overflow-y-auto lg:max-h-[calc(100vh-450px)] md:max-h-[calc(100vh-450px)]  scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentList">

            </div>
            <data-paginator id="paginatorList" items-per-page="20"></data-paginator>
        </div>
    </main>
    <dialog-modal id="DialogFormSchoolYear" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-calendar3 text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del año lectivo</h3>
                <p class="text-sm text-gray-500">Información del año lectivo</p>
            </div>
        </div>
        <div slot="body">
            <div class="flex flex-col gap-5">
                <form action="" id="formSchoolYear" novalidate>
                    <input type="hidden" name="idAnioLectivo" id="idAnioLectivo">

                    <section class="flex flex-col gap-5">
                        <custom-text-field label="Año" name="anio" required></custom-text-field>
                        <div class="grid lg:grid-cols-2 grid-cols-1 gap-5">

                            <custom-datepicker label="Fecha de inicio" name="fechaInicio" required></custom-datepicker>
                            <custom-datepicker label="Fecha de fin" name="fechaFin" required></custom-datepicker>
                        </div>
                        <custom-select label="Tipo de periodo" name="idTipoPeriodo" required>
                            <option value="1">BIMESTRAL</option>
                            <option value="2">TRIMESTRAL</option>
                        </custom-select>
                    </section>
                </form>
                <section id="seccionInfoPeriodo" class="hidden bg-blue-50 border border-blue-100 rounded-lg px-4 py-2 flex gap-3 items-start text-sm text-blue-600">
                    <i class="bi bi-stars text-lg"></i>
                    <p></p>
                </section>

                <section id="seccionListaPeriodos" class="hidden flex-col border-gray-300 border rounded-lg p-4 gap-2 text-sm">
                    <span class="font-medium">Periodos que se crearán automáticamente:</span>
                </section>

                <section id="seccionImportante" class="hidden bg-green-100 border border-green-200 rounded-lg px-4 py-2 flex gap-3 items-start text-sm text-green-600">
                    <i class="bi bi-info-circle text-lg"></i>
                    <div>
                        <span class="font-medium">Importante</span>
                        <p></p>
                    </div>
                </section>
            </div>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                id="btnCerrar"
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalForm()">
            </custom-button>
            <custom-button
                id="btnGrabar"
                type="submit"
                btn-class="bg-green-500 hover:bg-green-900 text-white"
                label="Grabar"
                form="formSchoolYear">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogConfigPeriod" size="max-w-4xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-calendar3 text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Configurar períodos del año académico</h3>
                <p class="text-sm text-gray-500">Define las fechas de inicio y fin de cada período</p>
            </div>
        </div>

        <div slot="body">
            <div class="flex flex-col gap-5">

                <!-- Info del año académico -->
                <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 grid grid-cols-3 gap-4 text-sm">
                    <div class="flex flex-col gap-1">
                        <span class="text-blue-400 font-medium">Año académico:</span>
                        <span id="infoAnio" class="font-bold text-blue-700">-</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-blue-400 font-medium">Tipo de período:</span>
                        <span id="infoTipoPeriodo" class="font-bold text-blue-700">-</span>
                    </div>
                    <div class="flex flex-col gap-1">
                        <span class="text-blue-400 font-medium">Períodos a configurar:</span>
                        <span id="infoCantidadPeriodos" class="font-bold text-blue-700">-</span>
                    </div>
                </div>

                <!-- Lista de períodos -->
                <div class="overflow-x-auto rounded-lg border border-gray-200">
                    <div class="min-w-[640px]">
                        <!-- Encabezado -->
                        <div class="grid grid-cols-[60px_1fr_1fr_1fr_100px] gap-4 px-4 py-3 bg-gray-50 border-b border-gray-200 font-medium text-gray-600 text-sm">
                            <span>#</span>
                            <span>Período</span>
                            <span>Fecha de inicio</span>
                            <span>Fecha de fin</span>
                            <span>Estado</span>
                        </div>
                        <!-- Filas dinámicas -->
                        <div id="listaPeriodos" class="flex flex-col divide-y divide-gray-100">
                            <!-- JS inserta aquí -->
                        </div>
                    </div>
                </div>

                <!-- Nota importante -->
                <div class="bg-amber-50 border border-amber-100 rounded-lg px-4 py-3 flex gap-3 items-start text-sm text-amber-700">
                    <i class="bi bi-exclamation-circle text-lg mt-0.5"></i>
                    <div class="flex flex-col gap-1">
                        <span class="font-medium">Importante</span>
                        <ul class="list-disc list-inside flex flex-col gap-1 text-amber-600">
                            <li id="notaRango">Las fechas de los períodos deben estar dentro del rango del año académico</li>
                            <li>Asegúrate de que no existan traslapes entre los períodos</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>

        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cancelar"
                onclick="closeModalConfigPeriod()">
            </custom-button>
            <custom-button
                btn-class="bg-blue-500 hover:bg-blue-700 text-white"
                icon="bi bi-floppy"
                label="Guardar períodos"
                onclick="guardarPeriodos()">
            </custom-button>
        </div>
    </dialog-modal>

    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./schoolyear.js"></script>

</body>

</html>