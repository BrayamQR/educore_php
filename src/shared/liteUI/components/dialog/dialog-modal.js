class DialogModal extends HTMLElement {
  constructor() {
    super();
    this._isInitialized = false;
    this._originalHeader = null;
    this._originalBody = null;
    this._originalFooter = null;
    this._isDynamic = false;
  }

  connectedCallback() {
    if (this._isInitialized) return;

    const size = this.getAttribute("size") || "max-w-md";

    const headerSlot = this.querySelector('[slot="header"]');
    const bodySlot = this.querySelector('[slot="body"]');
    const footerSlot = this.querySelector('[slot="footer"]');

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

    this.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal ${size} scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400" role="dialog" aria-modal="true" tabindex="-1">
          <div class="modal-header">
            <div data-slot="header"></div>
            <button class="close-btn" data-close type="button" aria-label="Cerrar">
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

    this.backdrop = this.querySelector(".modal-backdrop");
    this.modal = this.querySelector(".modal");
    this.closeBtn = this.querySelector("[data-close]");

    this.initEvents();
    this._isInitialized = true;
  }

  disconnectedCallback() {
    if (this.closeBtn) {
      this.closeBtn.removeEventListener("click", this._handleClose);
    }
    if (this.backdrop) {
      this.backdrop.removeEventListener("click", this._handleBackdropClick);
    }
    // overflow, ESC, z-index y atenuado ya no los gestiona esta instancia:
    // los gestiona ModalManager, que reacciona al evento 'modal:close'.
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

  setContent({ header = "", body = "", footer = "" }) {
    this._isDynamic = true;

    const headerContainer = this.querySelector('[data-slot="header"]');
    const bodyContainer = this.querySelector('[data-slot="body"]');
    const footerContainer = this.querySelector('[data-slot="footer"]');
    const footerWrapper = this.querySelector(".modal-footer");

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

  clearContent() {
    if (!this._isDynamic) return;

    const headerContainer = this.querySelector('[data-slot="header"]');
    const bodyContainer = this.querySelector('[data-slot="body"]');
    const footerContainer = this.querySelector('[data-slot="footer"]');

    if (headerContainer) headerContainer.innerHTML = "";
    if (bodyContainer) bodyContainer.innerHTML = "";
    if (footerContainer) footerContainer.innerHTML = "";

    this._isDynamic = false;
  }

  /**
   * Abre el modal. "Tonto": solo dibuja y avisa. No toca overflow, ESC,
   * z-index ni atenuado; eso lo hace ModalManager al escuchar 'modal:open'.
   * Recomendado: no llames esto directo, usa ModalManager.open(modalEl).
   */
  open(data = null) {
    if (this.isOpen()) return;

    this.classList.add("open");

    this.dispatchEvent(
      new CustomEvent("modal:open", {
        bubbles: true,
        detail: { modalId: this.id, data },
      }),
    );
  }

  /**
   * Cierra el modal y opcionalmente devuelve un resultado.
   * Si se abrió con ModalManager.open(), ese resultado es lo que recibe
   * quien hizo "await ModalManager.open(...)".
   */
  close(result = null) {
    if (!this.isOpen()) return;

    this.classList.remove("open");

    this.dispatchEvent(
      new CustomEvent("modal:close", {
        bubbles: true,
        detail: { modalId: this.id, result },
      }),
    );
  }

  isOpen() {
    return this.classList.contains("open");
  }

  reset() {
    if (this._isDynamic) {
      this.clearContent();
      return;
    }

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
