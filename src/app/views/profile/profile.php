<!DOCTYPE html>
<html lang="es">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Perfiles | Educore</title>
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
                            <i class="bi bi-shield text-blue-600 text-2xl"></i>
                        </div>
                        <div class="flex flex-col">
                            <h2 class="text-2xl font-bold text-gray-900">Perfiles</h2>
                            <span class="text-sm text-gray-500">Gestión de perfiles y permisos</span>
                        </div>
                    </div>
                    <div>
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
                        label="Buscar perfil..."
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


    <dialog-modal id="DialogformProfile" size="max-w-lg">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-green-100 w-10 h-10 rounded-md flex items-center justify-center">
                <i class="bi bi-shield text-green-600 text-xl"></i>
            </div>

            <div>
                <h3 class="font-bold">Formulario del perfil</h3>
                <p class="text-sm text-neutral-500">Registra o edita un perfil</p>
            </div>
        </div>
        <div slot="body">
            <form action="" id="formProfile" novalidate>
                <input type="hidden" name="idPerfil" id="idPerfil">
                <section class="flex flex-col gap-5">
                    <custom-text-field
                        class=""
                        label="Nombre del perfil"
                        name="nomPerfil"
                        required>
                    </custom-text-field>
                    <custom-textarea
                        class=""
                        label="Descripción"
                        name="descPerfil"
                        required>
                    </custom-textarea>
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
                form="formProfile"
                label="Grabar">
            </custom-button>
        </div>
    </dialog-modal>

    <dialog-modal id="DialogInfoProfile" size="max-w-3xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-sky-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-shield-check text-sky-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Detalles del perfil</h3>
                <p class="text-sm text-gray-500">Información y permisos del sistema</p>
            </div>
        </div>
        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <i class="bi bi-person-badge text-white text-2xl"></i>
                        </div>
                        <div>
                            <h2 id="profileName" class="text-xl font-bold text-gray-800"></h2>
                            <p id="profileDesc" class="text-sm text-gray-600"></p>
                        </div>
                    </div>
                    <span id="profileStatusBadge" class="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span id="profileStatusDot" class="w-2 h-2 rounded-full"></span>
                        <span id="profileStatusText"></span>
                    </span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                    <i class="bi bi-check2-circle text-blue-600"></i>
                    <span id="totalMenus" class="font-medium"></span>
                    <span class="text-gray-400">|</span>
                    <span id="menusPrincipales"></span>
                </div>
            </section>
            <section>
                <div class="flex items-center gap-2 mb-4">
                    <i class="bi bi-key text-gray-600"></i>
                    <h4 class="font-semibold text-gray-700">Permisos asignados</h4>
                </div>
                <div id="menusContainer" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
    <dialog-modal id="DialogAssign" size="max-w-2xl">
        <div slot="header" class="flex gap-3 items-center">
            <div class="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center">
                <i class="bi bi-shield-lock text-purple-600 text-xl"></i>
            </div>
            <div>
                <h3 class="font-bold text-gray-800">Asignar permisos</h3>
                <p class="text-sm text-gray-500">Configura los menús disponibles para el perfil</p>
            </div>
        </div>

        <div slot="body" class="flex flex-col gap-6">
            <section class="bg-linear-to-r from-blue-50 to-sky-50 p-5 rounded-xl border border-blue-100">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                            <i class="bi bi-person-badge text-white text-2xl"></i>
                        </div>
                        <div>
                            <!-- ✅ IDs únicos con prefijo "assign" -->
                            <h2 id="assignprofileName" class="text-xl font-bold text-gray-800"></h2>
                            <p id="assignprofileDesc" class="text-sm text-gray-600"></p>
                        </div>
                    </div>
                    <span id="assignprofileStatusBadge" class="px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <span id="assignprofileStatusDot" class="w-2 h-2 rounded-full"></span>
                        <span id="assignprofileStatusText"></span>
                    </span>
                </div>
                <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/50 px-3 py-2 rounded-lg">
                    <i class="bi bi-check2-circle text-blue-600"></i>
                    <span id="assigntotalMenus" class="font-medium"></span>
                    <span class="text-gray-400">|</span>
                    <span id="assignmenusPrincipales"></span>
                </div>
            </section>
            <section>
                <div class="relative">
                    <i class="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <input
                        type="text"
                        id="searchMenu"
                        placeholder="Buscar menú..."
                        class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none" />
                </div>
            </section>

            <!-- Contenedor de menús con checkboxes -->
            <section class="border border-gray-200 rounded-lg overflow-hidden">
                <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <div class="flex items-center justify-between">
                        <span class="text-sm font-medium text-gray-700">Menús disponibles</span>
                        <div class="flex gap-2">
                            <button
                                type="button"
                                id="btnSelectAll"
                                class="text-xs text-purple-600 hover:text-purple-700 font-medium cursor-pointer">
                                Seleccionar todos
                            </button>
                            <span class="text-gray-300">|</span>
                            <button
                                type="button"
                                id="btnClearAll"
                                class="text-xs text-gray-600 hover:text-gray-700 font-medium cursor-pointer">
                                Limpiar
                            </button>
                        </div>
                    </div>
                </div>

                <div id="menusCheckboxContainer" class="lg:max-h-80 overflow-y-auto p-4 scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400">
                </div>
            </section>
            <section class="flex items-center justify-between text-sm">
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
            </section>
        </div>

        <div slot="footer" class="flex md:flex-row flex-col gap-5 justify-between md:items-center">
            <button
                type="button"
                id="btnResetPermisos"
                class="cursor-pointer text-sm text-red-600 hover:text-red-700 font-medium flex items-center gap-1">
                <i class="bi bi-arrow-counterclockwise"></i>
                Resetear
            </button>

            <div class="flex justify-end gap-3">
                <custom-button
                    id="btnCerrarAssign"
                    btn-class="hover:bg-gray-200 text-gray-700"
                    label="Cancelar"
                    onclick="closeModalAsignar()">
                </custom-button>
                <custom-button
                    id="btnGuardarPermisos"
                    btn-class="bg-purple-600 hover:bg-purple-700 text-white"
                    label="Guardar permisos">
                </custom-button>
            </div>
        </div>
    </dialog-modal>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
    <script type="module" src="./profile.js"></script>
</body>

</html>