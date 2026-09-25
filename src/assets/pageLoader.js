class PageLoader {
  constructor() {
    this.overlayId = "pageLoaderOverlay";
    this.stylesId = "pageLoaderStyles";
    this.minDuration = 3000; // ms — se muestra al menos 3s mientras carga la página
    this.shownAt = null;
    this._ensureStyles();
  }

  _ensureStyles() {
    if (document.getElementById(this.stylesId)) return;

    const style = document.createElement("style");
    style.id = this.stylesId;
    style.textContent = `
      @keyframes pageLoaderRing {
        to { transform: rotate(360deg); }
      }
      @keyframes pageLoaderDot {
        0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
        40% { transform: translateY(-6px); opacity: 1; }
      }
      @keyframes pageLoaderPulse {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.08); }
        45% { transform: scale(0.98); }
        60% { transform: scale(1.05); }
        100% { transform: scale(1); }
      }
      #${this.overlayId} .pl-ring {
        position: absolute;
        inset: -10px;
        border: 3px solid transparent;
        border-top-color: #3b82f6;
        border-radius: 9999px;
        animation: pageLoaderRing 1s linear infinite;
      }
      #${this.overlayId} .pl-logo-wrap {
        animation: pageLoaderPulse 1.4s ease-in-out infinite;
      }
      #${this.overlayId} .pl-dot {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 9999px;
        background-color: #3b82f6;
        animation: pageLoaderDot 1.4s ease-in-out infinite;
      }
      #${this.overlayId} .pl-dot:nth-child(2) { animation-delay: 0.16s; }
      #${this.overlayId} .pl-dot:nth-child(3) { animation-delay: 0.32s; }
    `;
    document.head.appendChild(style);
  }

  _renderContent() {
    return `
      <div class="flex flex-col items-center gap-6 px-12 py-10 rounded-2xl">
        <div class="pl-logo-wrap relative flex items-center justify-center w-24 h-24">
          <span class="pl-ring"></span>
          <img src="/educore/public/logo2.png" alt="Cargando..." class="h-16 w-auto relative z-10" />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-lg font-bold text-blue-900 tracking-wide">Cargando</span>
          <span class="flex items-end gap-1 pb-1">
            <span class="pl-dot"></span><span class="pl-dot"></span><span class="pl-dot"></span>
          </span>
        </div>
      </div>
    `;
  }

  show() {
    this.shownAt = Date.now();
    this._ensureStyles();

    let el = document.getElementById(this.overlayId);

    if (el) {
      el.style.transition = "opacity 600ms ease-in-out";
      el.style.opacity = "1";
      el.style.pointerEvents = "auto";
      return;
    }

    el = document.createElement("div");
    el.id = this.overlayId;
    el.className =
      "fixed inset-0 bg-gray-200 flex items-center justify-center z-[9999]";
    el.style.opacity = "0";
    el.innerHTML = this._renderContent();
    document.body.appendChild(el);

    void el.offsetWidth;

    el.style.transition = "opacity 600ms ease-in-out";
    el.style.opacity = "1";
  }

  hide() {
    const el = document.getElementById(this.overlayId);
    if (!el) return;

    // Si el overlay ya venía en el HTML (login.php / global_loading.php) y
    // nunca se llamó show(), asumimos que "apareció" justo ahora, para que
    // igual respete el mínimo de minDuration en vez de ocultarse de inmediato.
    const elapsed = this.shownAt ? Date.now() - this.shownAt : 0;
    const remaining = Math.max(300 - elapsed, 0);

    setTimeout(() => {
      el.style.transition = "opacity 600ms ease-in-out";
      el.style.opacity = "0";
      el.style.pointerEvents = "none";
      setTimeout(() => el.remove(), 600);
    }, remaining);
  }
}

export const PageLoaderService = new PageLoader();
