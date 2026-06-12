<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Estudiantes | Educore</title>
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
                            <i class="bi bi-mortarboard text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Estudiantes</h2>
                            <span class="text-sm text-gray-500">Gestión del estudiante</span>
                        </div>
                    </div>
                    <div class="flex flex-wrap gap-5">
                        <custom-button
                            id="btnGenerarMasivo"
                            btn-class="bg-sky-500 hover:bg-sky-900 text-white"
                            label="Generar QR masivo"
                            icon="bi bi-qr-code"
                            onclick="openModalGenerarQRMasivo()">
                        </custom-button>
                        <custom-button
                            id="btnGenerarCarnet"
                            btn-class="bg-teal-500 hover:bg-teal-900 text-white"
                            label="Generar carnets"
                            icon="bi bi-person-badge"
                            onclick="openModalGenerarCarnet()">
                        </custom-button>
                        <custom-button
                            id="btnNuevo"
                            btn-class="bg-blue-500 hover:bg-blue-900 text-white "
                            label="Nuevo"
                            icon="bi bi-plus-lg"
                            onclick="openModalForm()">
                        </custom-button>
                    </div>
                </div>
                <div>
                    <custom-text-field
                        class=""
                        label="Buscar estudiante..."
                        name="searchText"
                        icon="bi bi-search"
                        clearable>
                    </custom-text-field>
                </div>
            </div>
            <div class="bg-white rounded-lg shadow-md flex flex-col  divide-neutral-200 divide-y overflow-y-auto lg:max-h-[calc(100vh-380px)] md:max-h-[calc(100vh-450px)]  scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentList">

            </div>
            <data-paginator id="paginatorList" items-per-page="20"></data-paginator>
        </div>
    </main>

    <dialog-modal id="DialogFormStudent" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-luggage-fill text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario del estudiante</h3>
                <p class="text-sm text-neutral-500">Registra o edita un estudiante</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formStudent" novalidate>
                <input type="hidden" name="idEstudiante" id="idEstudiante">
                <section class="flex flex-col gap-5">
                    <custom-select
                        label="Tipo de documento"
                        name="idTipoDocumento"
                        required>
                        <option value="1">D.N.I.</option>
                        <option value="2">CARNET DE EXTRANJERIA</option>
                    </custom-select>
                    <custom-text-field
                        label="Doc. de identidad"
                        name="docEstudiante"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Nombres"
                        name="nomEstudiante"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Apellido paterno"
                        name="apaEstudiante"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Apellido materno"
                        name="amaEstudiante"
                        required>
                    </custom-text-field>
                    <custom-datepicker
                        label="Fecha de nacimiento"
                        name="fechaNacimiento"
                        required>
                    </custom-datepicker>
                    <custom-select
                        label="Sexo"
                        name="idSexo"
                        required>
                        <option value="1">MASCULINO</option>
                        <option value="2">FEMENINO</option>
                    </custom-select>
                    <custom-text-field
                        label="Nombre del apoderado"
                        name="nomApoderado"
                        required>
                    </custom-text-field>
                    <custom-text-field
                        label="Teléfono del apoderado"
                        name="telApoderado"
                        required>
                    </custom-text-field>
                    <custom-select
                        label="Estado de matricula"
                        name="estMatricula"
                        required>
                        <option value="1">NORMAL</option>
                        <option value="2">TRASLADADO</option>
                    </custom-select>
                    <custom-autocomplete
                        label="Grado y sección"
                        name="idAula"
                        required>
                    </custom-autocomplete>
                </section>
            </form>
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
                form="formStudent"
                label="Grabar">
            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogGenararQRMasivo" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-purple-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-qr-code text-purple-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Generar QR masivo</h3>
                <p class="text-sm text-neutral-500">Generacion de codigo QR del estudiante de forma masiva</p>
            </div>
        </div>
        <div slot="body">
            <section class="flex flex-col gap-4">
                <!-- Barra de búsqueda -->
                <div>
                    <div class="relative">
                        <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            id="searchTextQR"
                            placeholder="Buscar estudiante..."
                            class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                    </div>
                </div>



                <!-- Encabezado de acciones -->
                <div class="flex items-center justify-between flex-wrap">
                    <h4 class="text-sm font-medium text-gray-700">Estudiantes sin QR</h4>
                    <div class="flex flex-wrap gap-3 text-sm">
                        <button
                            type="button"
                            class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            onclick="seleccionarPaginaQR()">
                            Seleccionar página
                        </button>
                        <button
                            type="button"
                            class="text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer"
                            onclick="seleccionarTodosQR()">
                            Seleccionar todos
                        </button>

                        <button
                            type="button"
                            class="text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer"
                            onclick="limpiarSeleccionQR()">
                            Limpiar
                        </button>
                    </div>
                </div>

                <!-- Lista de estudiantes con scroll -->
                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="overflow-y-auto lg:max-h-108 divide-y divide-gray-200 scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" id="contentListGenerarQR">
                    </div>

                </div>
                <data-paginator id="paginatorQR" items-per-page="10"></data-paginator>
                <!-- Contador en la parte inferior -->
                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2 text-gray-600">
                        <i class="bi bi-info-circle"></i>
                        <span>
                            <span id="countSelected" class="font-semibold text-purple-600">0</span>
                            menús seleccionados
                        </span>
                    </div>
                    <div class="text-gray-500">
                        Total: <span id="totalMenusAvailable" class="font-semibold">0</span>
                    </div>
                </div>
            </section>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                id="btnCerrar"
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalGenerarQRMasivo()">
            </custom-button>
            <custom-button
                id="btnGrabar"
                btn-class="bg-purple-500 hover:bg-purple-900 text-white"
                label="Generar"
                onclick="generarQRMasivo()">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogInfoStudent" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-mortarboard-fill text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del estudiante</h3>
                <p class="text-sm text-gray-500">Información del estudiante</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos personales</h2>
                <div class="flex flex-col mb-4 gap-3">
                    <!-- Nombre e icono -->
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center shrink-0">
                            <i class="bi bi-backpack2 text-white text-2xl"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600">Nombre del estudiante</p>
                            <h2 id="studentName" class="text-xl font-bold text-gray-800"></h2>
                        </div>
                    </div>
                    <!-- QR centrado debajo -->
                    <div id="qrContainer"
                        class="w-50 h-50 rounded-lg border border-blue-100 shadow-sm bg-white p-1 flex items-center justify-center self-center">
                        <img id="qrStudent"
                            src=""
                            alt="QR Estudiante"
                            class="w-full h-full object-contain" />
                    </div>
                </div>
                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-video text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Tipo de documento</span>
                            <span id="tipoDocStudent" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-vcard text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nro. de documento</span>
                            <span id="numDocStudent" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-cake text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Fecha de nacimiento</span>
                            <span id="fechaNacimientoStudent" class="font-medium "></span>
                        </div>
                    </div>

                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-gender-ambiguous text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Sexo</span>
                            <span id="sexoStudent" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-workspace text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Grado y sección</span>
                            <span id="gradoSeccionStudent" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-check2-square text-blue-600 w-8 h-8 bg-blue-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nivel academico</span>
                            <span id="nivelAcademicoStudent" class="font-medium "></span>
                        </div>
                    </div>
                </div>
            </section>
            <section class="bg-linear-to-r from-purple-50 to-purple-100 p-5 rounded-xl border border-purple-100">
                <h2 class="font-bold text-lg mb-4 text-center">Datos del apoderado</h2>

                <div class="flex flex-col gap-3">
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-person-vcard text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Nombre</span>
                            <span id="nombreApoderado" class="font-medium "></span>
                        </div>
                    </div>
                    <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                        <i class="bi bi-telephone text-purple-600 w-8 h-8 bg-purple-100 text-lg items-center flex justify-center rounded-full"></i>
                        <div class="flex flex-col">
                            <span class="text-xs">Teléfono</span>
                            <span id="telefonoApoderado" class="font-medium "></span>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                id="btnCerrarInfo"
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalInfo()">
            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogGenerarCarnet" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-teal-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-person-badge text-teal-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold">Generar carnets</h3>
                <p class="text-sm text-neutral-500">Generación de carnets de identificación</p>
            </div>
        </div>
        <div slot="body">
            <section class="flex flex-col gap-4">
                <div class="relative">
                    <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        id="searchTextCarnet"
                        placeholder="Buscar estudiante..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent outline-none" />
                </div>

                <div class="flex items-center justify-between flex-wrap">
                    <h4 class="text-sm font-medium text-gray-700">Estudiantes</h4>
                    <div class="flex flex-wrap gap-3 text-sm">
                        <button type="button"
                            class="text-xs text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                            onclick="seleccionarPaginaCarnet()">
                            Seleccionar página
                        </button>
                        <button type="button"
                            class="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                            onclick="seleccionarTodosCarnet()">
                            Seleccionar todos
                        </button>
                        <button type="button"
                            class="text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer"
                            onclick="limpiarSeleccionCarnet()">
                            Limpiar
                        </button>
                    </div>
                </div>

                <div class="border border-gray-200 rounded-lg overflow-hidden">
                    <div class="overflow-y-auto lg:max-h-108 divide-y divide-gray-200 scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400"
                        id="contentListCarnet">
                    </div>
                </div>
                <data-paginator id="paginatorCarnet" items-per-page="10"></data-paginator>

                <div class="flex items-center justify-between text-sm">
                    <div class="flex items-center gap-2 text-gray-600">
                        <i class="bi bi-info-circle"></i>
                        <span>
                            <span id="countSelectedCarnet" class="font-semibold text-teal-600">0</span>
                            estudiantes seleccionados
                        </span>
                    </div>
                    <div class="text-gray-500">
                        Total: <span id="totalCarnetAvailable" class="font-semibold">0</span>
                    </div>
                </div>
            </section>
        </div>
        <div slot="footer" class="flex justify-end gap-3">
            <custom-button
                btn-class="hover:bg-gray-200 text-gray-700"
                label="Cerrar"
                onclick="closeModalGenerarCarnet()">
            </custom-button>
            <custom-button
                btn-class="bg-teal-500 hover:bg-teal-900 text-white"
                label="Generar PDF"
                icon="bi bi-file-earmark-pdf"
                onclick="generarCarnetMasivo()">
            </custom-button>
        </div>
    </dialog-modal>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./student.js"></script>
</body>

</html>