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

            <div class="bg-white p-5 rounded-lg shadow-md">
                <p class="text-amber-500">
                    hola mundo
                </p>
                <input class="border border-gray-900 rounded-lg p-2" type="text" name="" id="" placeholder="usuario">
                <label for="">usuario</label>
            </div>
        </div>
    </main>



    <script type="module" src="./home.js"></script>
    <?php
    include("../../../shared/global/global_scripts.php")
    ?>
</body>

</html>