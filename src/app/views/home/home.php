<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../../../css/main.css">
    <link rel="shortcut icon" href="../../../../public/logo2.png">
    <title>Dashboard</title>
</head>

<body>
    <main class="bg-gray-200  min-h-[calc(100vh-60px)]">
        <?php
        include("../../../shared/global/global_loading.php");
        ?>
        <div class="lg:ml-[350px] mt-[60px] p-5 flex flex-col gap-5">

            <custom-button
                id="btnNuevo"
                btn-class="bg-blue-500 hover:bg-blue-900 text-white "
                label="Nuevo"
                icon="bi bi-plus-lg"
                onclick="openModalForm()">
            </custom-button>
        </div>
    </main>
    <dialog-modal id="DialogModal1">
        <div slot="body">
            <custom-button
                id="btnBuscar"
                btn-class="bg-blue-500 hover:bg-blue-900 text-white "
                label="Buscar"
                icon="bi bi-search"
                onclick="openModalForm2()">

            </custom-button>
        </div>
    </dialog-modal>
    <dialog-modal id="DialogModal2">
        <div slot="body">
            <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Magni tempore aperiam adipisci necessitatibus, iure veniam. Molestiae debitis earum vero magnam culpa totam omnis odit sunt. Dolorum odit doloremque error quae?</p>
        </div>
    </dialog-modal>

    <script type="module" src="./home.js"></script>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
</body>

</html>