let stream = null;
let cameraFeed = null;
let canvas = null;
let ctx = null;
let scanning = false;
let lastScanned = null;

let DialogInfoScan = null;
let autoCloseTimer = null;
let countdownInterval = null;

let scanCanvas = null;
let scanCtx = null;
let estudianteAutocomplete = null;

// Detectar dispositivo una sola vez
const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

async function init() {
  DialogInfoScan = document.getElementById("DialogInfoScan");
  cameraFeed = document.getElementById("cameraFeed");

  estudianteAutocomplete = document.querySelector(
    "custom-autocomplete[name='searchText']",
  );

  if (estudianteAutocomplete) {
    const opciones = await getEstudiante();
    estudianteAutocomplete.setOptions(opciones);

    // ← AGREGAR ESTO
    waitForComponent(estudianteAutocomplete, () => {
      estudianteAutocomplete.hiddenInput.addEventListener(
        "change",
        async () => {
          const { value } = estudianteAutocomplete.getValue();
          if (!value) return;

          await buscarPorDNI(value);
          estudianteAutocomplete.initInput();
        },
      );
    });
  }

  canvas = document.createElement("canvas");
  ctx = canvas.getContext("2d");

  scanCanvas = document.createElement("canvas");
  scanCtx = scanCanvas.getContext("2d");

  startCamera();
}

function waitForComponent(component, callback) {
  if (component._initialized) {
    callback();
  } else {
    const interval = setInterval(() => {
      if (component._initialized) {
        clearInterval(interval);
        callback();
      }
    }, 50);
  }
}

async function startCamera() {
  const videoConstraints = isMobile
    ? { facingMode: "environment" }
    : { width: { ideal: 1280 }, height: { ideal: 720 } };

  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: videoConstraints,
      audio: false,
    });

    cameraFeed.srcObject = stream;

    cameraFeed.addEventListener("loadedmetadata", () => {
      canvas.width = cameraFeed.videoWidth;
      canvas.height = cameraFeed.videoHeight;
      scanning = true;
      scanFrame();
    });
  } catch (error) {
    console.error("Error al acceder a la cámara:", error);
    showPermissionError(error);
  }
}

async function getEstudiante() {
  try {
    let resp = await fetch(
      "../../../app/routes/genericList.route.php?op=estudiante",
    );
    let json = await resp.json();
    if (json.status) {
      let data = json.data;
      let ops = data.map((p) => ({
        value: p.doc_estudiante,
        desc: `${p.doc_estudiante} - ${p.apa_estudiante} ${p.ama_estudiante} ${p.nom_estudiante}`,
      }));
      return ops;
    }
  } catch (error) {
    console.error(error);
  }
}

function scanFrame() {
  if (!scanning) return;

  if (cameraFeed.readyState === cameraFeed.HAVE_ENOUGH_DATA) {
    const videoW = cameraFeed.videoWidth;
    const videoH = cameraFeed.videoHeight;

    const frameSize = Math.min(videoW, videoH) * 0.6;
    const startX = (videoW - frameSize) / 2;
    const startY = (videoH - frameSize) / 2;

    if (scanCanvas.width !== frameSize) {
      scanCanvas.width = frameSize;
      scanCanvas.height = frameSize;
    }

    scanCtx.drawImage(
      cameraFeed,
      startX,
      startY,
      frameSize,
      frameSize,
      0,
      0,
      frameSize,
      frameSize,
    );

    const imageData = scanCtx.getImageData(0, 0, frameSize, frameSize);

    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: isMobile ? "dontInvert" : "attemptBoth",
    });

    if (code && code.data !== lastScanned) {
      lastScanned = code.data;
      scanning = false;
      onQRDetected(code.data);
    }
  }

  requestAnimationFrame(scanFrame);
}

async function onQRDetected(docEstudiante) {
  await buscarPorDNI(docEstudiante);
}

async function buscarPorDNI(doc) {
  try {
    const formData = new FormData();
    formData.append("docEstudiante", doc);

    const resp = await fetch(
      "../../../app/routes/estudiante.route.php?op=buscarpordni",
      {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        body: formData,
      },
    );

    const json = await resp.json();

    if (json.status) {
      poblarModalEstudiante(json.data);
      openModalInfoScan();
    } else {
      Swal.fire({
        icon: "warning",
        title: "No encontrado",
        text: "No se encontró ningún estudiante con ese código QR",
        confirmButtonColor: "#3b82f6",
      }).then(() => {
        reanudarEscaneo();
      });
    }
  } catch (error) {
    console.error("Error al buscar estudiante:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Error al buscar el estudiante",
      confirmButtonColor: "#3b82f6",
    }).then(() => {
      reanudarEscaneo();
    });
  }
}

function poblarModalEstudiante(data) {
  document.getElementById("fullName").textContent =
    `${data.apa_estudiante} ${data.ama_estudiante}, ${data.nom_estudiante}`;
  document.getElementById("docNumber").textContent = data.doc_estudiante;
  document.getElementById("grade").textContent =
    `${data.desc_grado} - ${data.seccion_aula}`;
  document.getElementById("level").textContent = data.desc_nivel;
  document.getElementById("gender").textContent =
    data.id_sexo === 1 ? "Masculino" : "Femenino";
  document.getElementById("guardian").textContent = data.nom_apoderado;
  document.getElementById("phone").textContent = data.tel_apoderado;
}

function startAutoCloseTimer() {
  const progressBar = document.getElementById("autoCloseProgress");

  if (progressBar) {
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
    progressBar.offsetWidth; // forzar reflow
    progressBar.style.transition = "width 5s linear";
    progressBar.style.width = "100%";
  }

  autoCloseTimer = setTimeout(() => {
    closeModalInfoScan();
  }, 5000);
}

function stopAutoCloseTimer() {
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer);
    autoCloseTimer = null;
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
    countdownInterval = null;
  }
}

function reanudarEscaneo() {
  lastScanned = null;
  scanning = true;
  scanFrame();
}

function showPermissionError(error) {
  cameraFeed.classList.add("hidden");

  let mensaje = "No se pudo acceder a la cámara";
  let detalle = "Ocurrió un error inesperado";

  if (
    error.name === "NotAllowedError" ||
    error.name === "PermissionDeniedError"
  ) {
    mensaje = "Permiso de cámara denegado";
    detalle =
      "Permite el acceso a la cámara en la configuración de tu navegador e intenta de nuevo";
  } else if (
    error.name === "NotFoundError" ||
    error.name === "DevicesNotFoundError"
  ) {
    mensaje = "No se encontró ninguna cámara";
    detalle = "Asegúrate de que tu dispositivo tenga una cámara disponible";
  } else if (error.name === "NotReadableError") {
    mensaje = "La cámara está en uso";
    detalle =
      "Otra aplicación está usando la cámara. Ciérrala e intenta de nuevo";
  }

  const container = cameraFeed.parentElement;
  const errorDiv = document.createElement("div");
  errorDiv.id = "cameraError";
  errorDiv.className =
    "absolute inset-0 flex flex-col items-center justify-center gap-3";
  errorDiv.innerHTML = `
    <div class="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
      <i class="bi bi-camera-video-off text-2xl text-red-400"></i>
    </div>
    <p class="text-base font-semibold text-red-400">${mensaje}</p>
    <p class="text-sm text-gray-500 text-center max-w-xs px-4">${detalle}</p>
    <button
      onclick="retryCamera()"
      class="mt-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2">
      <i class="bi bi-arrow-clockwise"></i>
      Reintentar
    </button>
  `;
  container.appendChild(errorDiv);
}

window.retryCamera = function () {
  const errorDiv = document.getElementById("cameraError");
  if (errorDiv) errorDiv.remove();
  cameraFeed.classList.remove("hidden");
  lastScanned = null;
  startCamera();
};

function stopCamera() {
  scanning = false;
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
    stream = null;
  }
  cameraFeed.srcObject = null;
}

window.addEventListener("beforeunload", stopCamera);

window.openModalInfoScan = function () {
  if (!DialogInfoScan) return;
  DialogInfoScan.open();
  startAutoCloseTimer();
};

window.closeModalInfoScan = function () {
  if (!DialogInfoScan) return;
  stopAutoCloseTimer();
  DialogInfoScan.close();

  const progressBar = document.getElementById("autoCloseProgress");
  if (progressBar) {
    progressBar.style.transition = "none";
    progressBar.style.width = "0%";
  }

  reanudarEscaneo();
};

init();
