class CustomSelect extends HTMLElement {
  static instances = {};

  constructor() {
    super();
    this.options = [];
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this._updateOptionsPosition = this._updateOptionsPosition.bind(this);
    this.highlightedIndex = -1;
    this.lastKey = null;
    this._initialized = false;
  }

  connectedCallback() {
    requestAnimationFrame(() => {
      this._initialize();
    });
  }

  _initialize() {
    if (this._initialized) return;

    const label = this.getAttribute("label") || "";
    const name = this.getAttribute("name") || "";
    const required = this.hasAttribute("required");
    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";
    const optionsAttr = this.getAttribute("options");

    const visibleId = `${name}_display`;

    const htmlOptions = Array.from(this.querySelectorAll("option")).map(
      (opt) => ({
        value: opt.getAttribute("value") || opt.textContent.trim(),
        desc: opt.textContent.trim(),
        selected: opt.hasAttribute("selected"),
        disabled: opt.hasAttribute("disabled"),
      }),
    );

    this.innerHTML = `
      <div class="custom-component">
        <div class="input-container">
          <input type="hidden" name="${name}" id="${name}">
          <input 
            class="input-select"
            type="text" 
            id="${visibleId}"  
            placeholder=" "
            autocomplete="off"
            readonly
            ${required ? "required" : ""}>
          <label for="${visibleId}">
            ${label}${
              required ? '<span class="required-asterisk">*</span>' : ""
            }
          </label>
          <span class="validation-icon"></span>
          <span class="select-arrow">
            <i class="bi bi-chevron-down"></i>
          </span>
        </div>
        <span class="validation-message"></span>
      </div>
    `;

    this.hiddenInput = this.querySelector("input[type='hidden']");
    this.input = this.querySelector(".input-select");
    this.label = this.querySelector("label");
    this.icon = this.querySelector(".validation-icon");
    this.message = this.querySelector(".validation-message");
    this._createDropdownContainer();

    if (htmlOptions.length > 0) {
      const validOptions = htmlOptions
        .filter((opt) => !opt.disabled)
        .map((opt) => ({ value: opt.value, desc: opt.desc }));

      this.setOptions(validOptions);

      const selectedOption = htmlOptions.find((opt) => opt.selected);
      if (selectedOption) {
        setTimeout(() => this.setValue(selectedOption.value), 0);
      }
    } else if (optionsAttr) {
      this.parseOptionsAttribute(optionsAttr);
    }

    this.input.addEventListener("keydown", (e) => this.handleKeyDown(e));
    this.input.addEventListener("keypress", (e) => this.handleKeyPress(e));
    this.input.addEventListener("blur", () => this.checkValidity());

    if (name) CustomSelect.instances[name] = this;

    this._initialized = true;
  }

  _createDropdownContainer() {
    const containerId = `dropdown-${this.getAttribute("name") || Math.random().toString(36).substr(2, 9)}`;

    // Si ya existe, removerlo
    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    // Crear el contenedor
    const container = document.createElement("div");
    container.id = containerId;
    container.className =
      "options-container scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400";
    container.innerHTML = '<ul class="select-list"></ul>';

    // Agregarlo al body
    document.body.appendChild(container);

    this.contentList = container;
    this._dropdownId = containerId;
  }

  parseOptionsAttribute(optionsAttr) {
    try {
      const parsed = JSON.parse(optionsAttr);
      this.setOptions(parsed);
      return;
    } catch (e) {
      try {
        const varName = optionsAttr.trim();

        if (varName.endsWith("()")) {
          const funcName = varName.slice(0, -2);
          if (typeof window[funcName] === "function") {
            const result = window[funcName]();
            this.setOptions(result);
            return;
          }
        }

        if (window[varName] && Array.isArray(window[varName])) {
          this.setOptions(window[varName]);
          return;
        }

        console.error(`No se pudo resolver las opciones: ${optionsAttr}`);
      } catch (err) {
        console.error("Error al parsear opciones:", err);
      }
    }
  }

  loadOptions(options, selectedValue = null) {
    this.setOptions(options);
    if (selectedValue) {
      this.setValue(selectedValue);
    }
  }

  _updateOptionsPosition() {
    if (!this.contentList || !this.input) return;

    const rect = this.input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // Obtener la altura máxima del dropdown (considerando el max-height del CSS)
    const maxDropdownHeight = 220; // Debe coincidir con max-height de .options-container.open
    const dropdownHeight = Math.min(
      this.contentList.scrollHeight,
      maxDropdownHeight,
    );

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const gap = 5; // Espacio entre el input y el dropdown

    let top;
    let shouldOpenUpward = false;

    // Decidir si abrir hacia arriba o hacia abajo
    // Solo abrir hacia arriba si:
    // 1. No hay suficiente espacio abajo (menos de la altura del dropdown)
    // 2. HAY suficiente espacio arriba
    // 3. El espacio arriba es significativamente mayor que abajo
    if (
      spaceBelow < dropdownHeight &&
      spaceAbove > dropdownHeight &&
      spaceAbove > spaceBelow + 50
    ) {
      // Abrir hacia arriba
      top = rect.top - dropdownHeight - gap;
      shouldOpenUpward = true;
    } else {
      // Abrir hacia abajo (comportamiento por defecto)
      top = rect.bottom + gap;
    }

    // Ajustar si se sale de la pantalla por arriba
    if (top < 0) {
      top = gap;
    }

    // Ajustar si se sale de la pantalla por abajo
    if (top + dropdownHeight > viewportHeight) {
      top = viewportHeight - dropdownHeight - gap;
    }

    // Calcular posición horizontal
    let left = rect.left;

    // Ajustar si se sale por la derecha
    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - gap;
    }

    // Ajustar si se sale por la izquierda
    if (left < 0) {
      left = gap;
    }

    // Aplicar posición y ancho
    this.contentList.style.top = `${top}px`;
    this.contentList.style.left = `${left}px`;
    this.contentList.style.width = `${rect.width}px`;

    // Agregar clase para animación diferente si abre hacia arriba
    if (shouldOpenUpward) {
      this.contentList.classList.add("open-upward");
    } else {
      this.contentList.classList.remove("open-upward");
    }
  }

  setOptions(options) {
    this.options = options;

    if (!this.contentList) {
      console.error("contentList no existe!");
      return;
    }

    const ul = this.contentList.querySelector(".select-list");
    if (!ul) {
      console.error("select-list no encontrado en contentList");
      return;
    }

    ul.innerHTML = "";

    options.forEach((opt) => {
      const li = document.createElement("li");
      li.textContent = opt.desc;
      li.dataset.value = opt.value;

      li.addEventListener("click", (e) => {
        e.stopPropagation();
        this.highlightedIndex = -1;
        this.setValue(opt.value);
        this.closeList();
      });

      ul.appendChild(li);
    });

    if (!this._clickHandlerAttached) {
      this.input.addEventListener("click", (e) => {
        e.stopPropagation();

        const isOpen = this.contentList.classList.contains("open");

        // Cerrar todos los otros dropdowns
        document.querySelectorAll(".options-container.open").forEach((el) => {
          if (el !== this.contentList) {
            el.classList.remove("open");
          }
        });

        if (!isOpen) {
          this._updateOptionsPosition();
          this.contentList.classList.add("open");

          const arrow = this.querySelector(".select-arrow i");
          if (arrow) arrow.classList.add("rotated");

          // ✅ Agregar todos los event listeners necesarios
          this._attachGlobalListeners();

          setTimeout(() => {
            document.addEventListener("click", this.handleOutsideClick);
          }, 10);
        } else {
          this.closeList();
        }
      });
      this._clickHandlerAttached = true;
    }
  }

  /**
   * ✅ Agrega listeners globales cuando el dropdown está abierto
   */
  _attachGlobalListeners() {
    // Reposicionar en scroll
    window.addEventListener("scroll", this._updateOptionsPosition, true);

    // Manejar resize/orientación
    window.addEventListener("resize", this._handleResize);

    // Cerrar cuando la ventana pierde foco (cambio de pestaña, app en segundo plano)
    window.addEventListener("blur", this._handleWindowBlur);

    // ✅ NUEVO: Detectar clicks/interacciones en cualquier parte del documento
    document.addEventListener(
      "mousedown",
      this._handleDocumentInteraction,
      true,
    );
    document.addEventListener(
      "touchstart",
      this._handleDocumentInteraction,
      true,
    );

    // ✅ NUEVO: Detectar cambios de foco
    document.addEventListener("focusin", this._handleFocusChange, true);

    // Verificación de visibilidad como respaldo (menos frecuente)
    this._startVisibilityCheck();
  }

  /**
   * ✅ Remueve todos los listeners globales
   */
  _detachGlobalListeners() {
    window.removeEventListener("scroll", this._updateOptionsPosition, true);
    window.removeEventListener("resize", this._handleResize);
    window.removeEventListener("blur", this._handleWindowBlur);
    document.removeEventListener("click", this.handleOutsideClick);
    document.removeEventListener(
      "mousedown",
      this._handleDocumentInteraction,
      true,
    );
    document.removeEventListener(
      "touchstart",
      this._handleDocumentInteraction,
      true,
    );
    document.removeEventListener("focusin", this._handleFocusChange, true);

    // Detener verificación de visibilidad
    if (this._visibilityInterval) {
      clearInterval(this._visibilityInterval);
      this._visibilityInterval = null;
    }
  }

  /**
   * ✅ NUEVO: Handler para cualquier interacción en el documento
   * Se ejecuta ANTES del click normal (fase de captura)
   */
  _handleDocumentInteraction = (e) => {
    // Si el click/touch es en nuestro componente o dropdown, ignorar
    if (this.contains(e.target) || this.contentList.contains(e.target)) {
      return;
    }

    // Verificar si el click fue en un elemento que puede ocultar nuestro input
    // (menús, overlays, modals, etc.)
    const clickedElement = e.target;

    // Si es un botón de menú, overlay, o elemento que típicamente oculta contenido
    if (
      clickedElement.closest(
        'button, [role="button"], .sidebar, .menu, .nav, .overlay, .backdrop, .modal',
      )
    ) {
      // Dar un momento para que el elemento se renderice
      requestAnimationFrame(() => {
        this._checkIfInputIsObscured();
      });
    }
  };

  /**
   * ✅ NUEVO: Handler para cambios de foco
   */
  _handleFocusChange = (e) => {
    // Si el foco se movió fuera de nuestro componente
    if (!this.contains(e.target) && !this.contentList.contains(e.target)) {
      this.closeList();
    }
  };

  /**
   * ✅ NUEVO: Verifica si el input está siendo tapado por otro elemento
   */
  _checkIfInputIsObscured() {
    if (!this.isOpen()) return;

    const rect = this.input.getBoundingClientRect();

    // Verificar el centro del input
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtPoint = document.elementFromPoint(centerX, centerY);

    // Si hay algo tapando el input, cerrar inmediatamente
    if (
      elementAtPoint &&
      !this.contains(elementAtPoint) &&
      elementAtPoint !== this.input
    ) {
      this.closeList();
    }
  }

  /**
   * ✅ Verificación de visibilidad como respaldo (menos frecuente ahora)
   */
  _startVisibilityCheck() {
    // Ahora solo verificamos cada 500ms como respaldo
    // Los eventos mousedown/touchstart/focusin son la detección principal
    this._visibilityInterval = setInterval(() => {
      if (!this.isOpen()) {
        clearInterval(this._visibilityInterval);
        return;
      }

      const rect = this.input.getBoundingClientRect();

      // Verificación 1: Dimensiones y viewport
      if (
        rect.width === 0 ||
        rect.height === 0 ||
        rect.top < -100 ||
        rect.bottom > window.innerHeight + 100 ||
        rect.left < -100 ||
        rect.right > window.innerWidth + 100
      ) {
        this.closeList();
        return;
      }

      // Verificación 2: Display/visibility
      const computedStyle = window.getComputedStyle(this.input);
      if (
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden" ||
        computedStyle.opacity === "0"
      ) {
        this.closeList();
        return;
      }

      // Verificación 3: Elemento encima
      this._checkIfInputIsObscured();
    }, 500); // Ahora 500ms porque los eventos lo detectan primero
  }

  /**
   * ✅ Handler para resize de ventana
   */
  _handleResize = () => {
    if (this.isOpen()) {
      // Reposicionar el dropdown
      this._updateOptionsPosition();
    }
  };

  /**
   * ✅ Handler cuando la ventana pierde foco
   */
  _handleWindowBlur = () => {
    if (this.isOpen()) {
      this.closeList();
    }
  };

  /**
   * ✅ Verifica si el dropdown está abierto
   */
  isOpen() {
    return this.contentList && this.contentList.classList.contains("open");
  }

  closeList() {
    if (this.contentList) this.contentList.classList.remove("open");
    const arrow = this.querySelector(".select-arrow i");
    if (arrow) arrow.classList.remove("rotated");

    // ✅ Usar el método centralizado para remover listeners
    this._detachGlobalListeners();
  }

  handleOutsideClick(e) {
    if (!this.contains(e.target) && !this.contentList.contains(e.target)) {
      this.closeList();
    }
  }

  handleKeyDown(e) {
    if (!this.contentList) return;

    const items = this.contentList.querySelectorAll(".select-list li");
    if (!items.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.highlightedIndex = (this.highlightedIndex + 1) % items.length;
        this.updateHighlight(items);
        break;
      case "ArrowUp":
        e.preventDefault();
        this.highlightedIndex =
          (this.highlightedIndex - 1 + items.length) % items.length;
        this.updateHighlight(items);
        break;
      case "Enter":
        e.preventDefault();
        if (this.highlightedIndex >= 0) {
          const li = items[this.highlightedIndex];
          this.setValue(li.dataset.value);
          this.closeList();
        }
        break;
    }
  }

  updateHighlight(items) {
    items.forEach((li) => li.classList.remove("highlighted"));

    if (this.highlightedIndex >= 0) {
      const li = items[this.highlightedIndex];
      li.classList.add("highlighted");
      li.scrollIntoView({ block: "nearest" });

      this.setValue(li.dataset.value);
    }
  }

  handleKeyPress(e) {
    const char = e.key.toLowerCase();
    if (char.length !== 1 || !/[a-zñáéíóú]/i.test(char)) return;

    if (!this.contentList) return;

    const items = this.contentList.querySelectorAll(".select-list li");
    if (!items.length) return;

    if (this.lastKey === char) {
      const nextIndex = Array.from(items)
        .map((li) => li.textContent.trim().toLowerCase())
        .findIndex(
          (text, idx) => idx > this.highlightedIndex && text.startsWith(char),
        );

      if (nextIndex >= 0) {
        this.highlightedIndex = nextIndex;
      } else {
        this.highlightedIndex = Array.from(items).findIndex((li) =>
          li.textContent.trim().toLowerCase().startsWith(char),
        );
      }
    } else {
      this.highlightedIndex = Array.from(items).findIndex((li) =>
        li.textContent.trim().toLowerCase().startsWith(char),
      );
    }

    this.lastKey = char;
    if (this.highlightedIndex >= 0) this.updateHighlight(items);
  }

  disconnectedCallback() {
    const name = this.getAttribute("name") || "";
    if (name && CustomSelect.instances[name] === this) {
      delete CustomSelect.instances[name];
    }

    // Asegurar que todo se limpia correctamente
    this.closeList();

    if (this._dropdownId) {
      const dropdown = document.getElementById(this._dropdownId);
      if (dropdown) dropdown.remove();
    }
  }

  static get(name) {
    return CustomSelect.instances[name] || null;
  }

  setValue(value) {
    // Normalizar a string desde el inicio
    const valueStr = String(value);

    if (this.hiddenInput) this.hiddenInput.value = valueStr;

    const option = (this.options || []).find(
      (opt) => String(opt.value) === valueStr,
    );
    const desc = option ? option.desc : "";

    if (this.input) this.input.value = desc;

    if (!this.contentList) return;

    this.contentList.querySelectorAll(".select-list li").forEach((li) => {
      li.classList.remove("selected", "highlighted");
    });

    const selectedLi = this.contentList.querySelector(
      `.select-list li[data-value="${valueStr}"]`,
    );
    if (selectedLi) {
      selectedLi.classList.add("selected");
      this.highlightedIndex = Array.from(
        this.contentList.querySelectorAll(".select-list li"),
      ).indexOf(selectedLi);
    }

    this.checkValidity();

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: valueStr, desc: desc },
        bubbles: true,
      }),
    );
  }

  getValue() {
    return this.hiddenInput ? this.hiddenInput.value : "";
  }

  checkValidity() {
    if (!this.input) return true;

    const value =
      this.hiddenInput && this.hiddenInput.value
        ? this.hiddenInput.value.trim()
        : "";

    if (!this.hasAttribute("required") && !value) {
      this.input.classList.remove("error", "valid");
      this.label.classList.remove("error", "valid");
      this.icon.classList.remove("error", "valid");
      this.icon.innerHTML = "";
      this.message.textContent = "";
      return true;
    }

    if (this.hasAttribute("required") && !value) {
      this.setError(this.msgRequired);
      return false;
    }

    this.clearError();
    return true;
  }

  setError(msg) {
    if (!this.input) return;
    this.input.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");
    this.input.classList.add("error");
    this.label.classList.add("error");
    this.icon.classList.add("error");
    this.icon.innerHTML = "<i class='bi bi-x-lg'></i>";
    this.message.textContent = msg;
  }

  clearError() {
    if (!this.input) return;
    this.input.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");
    this.input.classList.add("valid");
    this.label.classList.add("valid");
    this.icon.classList.add("valid");
    this.icon.innerHTML = "<i class='bi bi-check-lg'></i>";
    this.message.textContent = "";
  }

  initInput() {
    if (this.hiddenInput) this.hiddenInput.value = "";
    if (this.input) this.input.value = "";

    this.input.classList.remove("error", "valid");
    this.label.classList.remove("error", "valid");
    this.icon.classList.remove("error", "valid");
    this.icon.innerHTML = "";
    this.message.textContent = "";

    if (this.contentList) {
      this.contentList.querySelectorAll(".select-list li").forEach((li) => {
        li.classList.remove("selected", "highlighted");
      });
    }

    this.highlightedIndex = -1;
  }
}

customElements.define("custom-select", CustomSelect);
