<header class="flex bg-gray-900 items-center fixed justify-between px-6 py-3 w-full h-[60px] z-20 select-none border-b border-neutral-700 top-0 left-0">
    <div class="flex gap-4 items-center justify-center">
        <button id="menu-btn" class="lg:hidden cursor-pointer items-center text-center outline-none" type="button" aria-label="Abrir menu">
            <i class="bi bi-list text-white text-[30px] hover:bg-neutral-700 w-10 h-10 flex text-center justify-center items-center rounded-lg transition-all duration-300 ease-linear"></i>
        </button>
        <div class="flex gap-3">
            <div class="flex gap-3 items-center justify-center max-h-10">
                <img class="object-contain h-10 w-auto" src="../../../../public/logo2.png" alt="">
            </div>
            <div class="leading-10">
                <h1 class="text-[30px] font-semibold flex"><span class="text-sky-600">Edu</span><span class="text-green-600">Core</span></h1>
            </div>
        </div>
    </div>

    <!-- AVATAR -->
    <div class="relative" id="avatarContainer">
        <button id="avatarBtn" class="flex items-center gap-2 cursor-pointer">
            <div class="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center hover:bg-sky-700 transition-all duration-300 outline-none">
                <i class="bi bi-person-fill text-white text-lg"></i>
            </div>
        </button>

        <!-- DROPDOWN -->
        <div id="avatarDropdown"
            class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 transition-all duration-200 ease-out opacity-0 scale-95 pointer-events-none origin-top-right">
            <!-- INFO USUARIO -->
            <div class="px-4 py-3 bg-gray-50 border-b border-gray-100">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-full bg-sky-600 flex items-center justify-center shrink-0">
                        <i class="bi bi-person-fill text-white"></i>
                    </div>
                    <div class="overflow-hidden">
                        <p class="text-sm font-semibold text-gray-700 truncate">
                            <?php echo $_SESSION['usuario']['nomUsuario'] ?? ''; ?>
                        </p>
                        <p class="text-xs text-gray-400 truncate">
                            <?php echo $_SESSION['usuario']['nomPerfil'] ?? ''; ?>
                        </p>
                    </div>
                </div>
            </div>
            <!-- USUARIO -->
            <div class="px-4 py-2 border-b border-gray-100">
                <p class="text-xs text-gray-400">Usuario</p>
                <p class="text-sm text-gray-600">
                    <?php echo $_SESSION['usuario']['usuUsuario'] ?? ''; ?>
                </p>
            </div>
            <!-- CERRAR SESION -->
            <button onclick="CerrarSesion()" class="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-all duration-300 cursor-pointer outline-none">
                <i class="bi bi-box-arrow-right"></i>
                Cerrar sesión
            </button>
        </div>
    </div>
</header>

<script>
    window.ID_USUARIO = <?php echo json_encode($_SESSION['usuario']['idUsuario'] ?? null); ?>;
    window.ID_PERFIL = <?php echo json_encode($_SESSION['usuario']['idPerfil'] ?? null); ?>;
</script>