class DialogModal extends HTMLElement {
  constructor() {
    super();
    this._isInitialized = false;
    this._originalHeader = null;
    this._originalBody = null;
    this._originalFooter = null;
    this._isDynamic = false; // ✅ Flag para saber si es dinámico
  }

  handleEsc = (e) => {
    if (e.key === "Escape" && this.isOpen()) this.close();
  };

  connectedCallback() {
    if (this._isInitialized) return;

    const size = this.getAttribute("size") || "max-w-md";

    // Guardamos referencias a los elementos originales
    const headerSlot = this.querySelector('[slot="header"]');
    const bodySlot = this.querySelector('[slot="body"]');
    const footerSlot = this.querySelector('[slot="footer"]');

    // ✅ Solo guardar si existen slots estáticos
    if (headerSlot && !this._originalHeader) {
      this._originalHeader = headerSlot;
      this._originalHeader.removeAttribute("slot");
    }

    if (bodySlot && !this._originalBody) {
      this._originalBody = bodySlot;
      this._originalBody.removeAttribute("slot");
    }

    if (footerSlot && !this._originalFooter) {
      this._originalFooter = footerSlot;
      this._originalFooter.removeAttribute("slot");
    }

    // Creamos la estructura del modal
    this.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal ${size} scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400">
          <div class="modal-header">
            <div data-slot="header"></div>
            <button class="close-btn" data-close>
              <i class="bi bi-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div data-slot="body"></div>
          </div>

          <div class="modal-footer" style="display: none;">
            <div data-slot="footer"></div>
          </div>
        </div>
      </div>
    `;

    // Insertamos el contenido guardado
    const headerContainer = this.querySelector('[data-slot="header"]');
    const bodyContainer = this.querySelector('[data-slot="body"]');
    const footerContainer = this.querySelector('[data-slot="footer"]');
    const footerWrapper = this.querySelector(".modal-footer");

    if (this._originalHeader && headerContainer) {
      headerContainer.appendChild(this._originalHeader);
    }

    if (this._originalBody && bodyContainer) {
      bodyContainer.appendChild(this._originalBody);
    }

    if (this._originalFooter && footerContainer && footerWrapper) {
      footerContainer.appendChild(this._originalFooter);
      footerWrapper.style.display = "block";
    }

    // Referencias a elementos del DOM
    this.backdrop = this.querySelector(".modal-backdrop");
    this.modal = this.querySelector(".modal");
    this.closeBtn = this.querySelector("[data-close]");

    // Inicializar eventos
    this.initEvents();
    document.addEventListener("keydown", this.handleEsc);

    this._isInitialized = true;
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.handleEsc);

    if (this.closeBtn) {
      this.closeBtn.removeEventListener("click", this._handleClose);
    }

    if (this.backdrop) {
      this.backdrop.removeEventListener("click", this._handleBackdropClick);
    }

    if (this.isOpen()) {
      document.body.style.overflow = "";
    }
  }

  initEvents() {
    this._handleClose = () => this.close();
    this._handleBackdropClick = (e) => {
      if (e.target === this.backdrop) this.close();
    };

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", this._handleClose);
    }

    if (this.backdrop) {
      this.backdrop.addEventListener("click", this._handleBackdropClick);
    }
  }

  /**
   * ✅ NUEVO: Establece el contenido del modal dinámicamente
   * @param {Object} content - Objeto con header, body y footer (HTML strings)
   */
  setContent({ header = "", body = "", footer = "" }) {
    this._isDynamic = true; // Marcar como dinámico

    const headerContainer = this.querySelector('[data-slot="header"]');
    const bodyContainer = this.querySelector('[data-slot="body"]');
    const footerContainer = this.querySelector('[data-slot="footer"]');
    const footerWrapper = this.querySelector(".modal-footer");

    // Limpiar contenido actual
    if (headerContainer) headerContainer.innerHTML = header;
    if (bodyContainer) bodyContainer.innerHTML = body;

    if (footerContainer && footer) {
      footerContainer.innerHTML = footer;
      if (footerWrapper) footerWrapper.style.display = "block";
    } else if (footerWrapper) {
      if (footerContainer) footerContainer.innerHTML = "";
      footerWrapper.style.display = "none";
    }
  }

  /**
   * ✅ NUEVO: Limpia el contenido dinámico
   */
  clearContent() {
    if (!this._isDynamic) return; // Solo limpiar si es dinámico

    const headerContainer = this.querySelector('[data-slot="header"]');
    const bodyContainer = this.querySelector('[data-slot="body"]');
    const footerContainer = this.querySelector('[data-slot="footer"]');

    if (headerContainer) headerContainer.innerHTML = "";
    if (bodyContainer) bodyContainer.innerHTML = "";
    if (footerContainer) footerContainer.innerHTML = "";

    this._isDynamic = false;
  }

  open() {
    if (this.isOpen()) return;

    document.body.style.overflow = "hidden";
    this.classList.add("open");

    this.dispatchEvent(
      new CustomEvent("modal:open", {
        bubbles: true,
        detail: { modalId: this.id },
      })
    );
  }

  close() {
    if (!this.isOpen()) return;

    document.body.style.overflow = "";
    this.classList.remove("open");

    this.dispatchEvent(
      new CustomEvent("modal:close", {
        bubbles: true,
        detail: { modalId: this.id },
      })
    );
  }

  isOpen() {
    return this.classList.contains("open");
  }

  /**
   * Método para resetear al contenido original (slots estáticos)
   */
  reset() {
    // Si es dinámico, limpiar
    if (this._isDynamic) {
      this.clearContent();
      return;
    }

    // Si es estático, restaurar contenido original
    const headerContainer = this.querySelector('[data-slot="header"]');
    const bodyContainer = this.querySelector('[data-slot="body"]');
    const footerContainer = this.querySelector('[data-slot="footer"]');
    const footerWrapper = this.querySelector(".modal-footer");

    if (headerContainer) headerContainer.innerHTML = "";
    if (bodyContainer) bodyContainer.innerHTML = "";
    if (footerContainer) footerContainer.innerHTML = "";

    if (this._originalHeader && headerContainer) {
      headerContainer.appendChild(this._originalHeader);
    }

    if (this._originalBody && bodyContainer) {
      bodyContainer.appendChild(this._originalBody);
    }

    if (this._originalFooter && footerContainer && footerWrapper) {
      footerContainer.appendChild(this._originalFooter);
      footerWrapper.style.display = "block";
    } else if (footerWrapper) {
      footerWrapper.style.display = "none";
    }
  }
}

customElements.define("dialog-modal", DialogModal);
