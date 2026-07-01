class CustomAutocomplete extends HTMLElement {
  static instances = {};

  constructor() {
    super();
    this.options = [];
    this.handleOutsideClick = this.handleOutsideClick.bind(this);
    this._updateOptionsPosition = this._updateOptionsPosition.bind(this);
    this._initialized = false;
    this._pendingOptions = null;
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
    const iconValue = this.getAttribute("icon") || "";

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
            autocomplete="off"
            placeholder=" "
            ${required ? "required" : ""}>
          <label for="${visibleId}">
            ${label}${
              required ? '<span class="required-asterisk">*</span>' : ""
            }
          </label>
          <span class="clear-btn" id="clear-btn">
            <i class="bi bi-arrow-clockwise"></i>
          </span>
          <span class="validation-icon"></span>
        </div>
        <span class="validation-message"></span>
      </div>
    `;

    this.hiddenInput = this.querySelector("input[type='hidden']");
    this.input = this.querySelector(".input-select");
    this.btnclean = this.querySelector("#clear-btn");
    this.label = this.querySelector("label");
    this.icon = this.querySelector(".validation-icon");
    this.message = this.querySelector(".validation-message");

    this._createDropdownContainer();

    if (iconValue) {
      const span = document.createElement("span");
      span.classList.add("input-icon");
      const i = document.createElement("i");
      i.className = iconValue;
      span.appendChild(i);
      this.querySelector(".input-container").appendChild(span);
      this.icon.style.right = "32px";
      this.btnclean.style.right = "58px";
    }

    if (this.btnclean) {
      this.btnclean.style.display = this.hiddenInput.value ? "block" : "none";
      this.btnclean.addEventListener("click", (e) => {
        e.stopPropagation();
        this.initInput();
        this.btnclean.style.display = "none";
        this.checkValidity();
      });
    }

    if (this.input) {
      this.input.addEventListener("blur", () => {
        if (!this.hiddenInput.value) {
          this.input.value = "";
          if (this.btnclean) this.btnclean.style.display = "none";
        }
        this.checkValidity();
      });
    }

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

    if (name) CustomAutocomplete.instances[name] = this;

    this._initialized = true;

    if (this._pendingOptions) {
      this._setOptionsInternal(this._pendingOptions);
      this._pendingOptions = null;
    }
  }

  _createDropdownContainer() {
    const containerId = `dropdown-autocomplete-${this.getAttribute("name") || Math.random().toString(36).substr(2, 9)}`;

    const existing = document.getElementById(containerId);
    if (existing) existing.remove();

    const container = document.createElement("div");
    container.id = containerId;
    container.className =
      "options-container scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400";
    container.innerHTML = '<ul class="select-list"></ul>';

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

  setOptions(options) {
    if (!this._initialized) {
      this._pendingOptions = options;
      return;
    }

    this._setOptionsInternal(options);
  }

  _updateOptionsPosition() {
    if (!this.contentList || !this.input) return;

    const rect = this.input.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    const maxDropdownHeight = 220;
    const dropdownHeight = Math.min(
      this.contentList.scrollHeight,
      maxDropdownHeight,
    );

    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;

    const gap = 5;

    let top;
    let shouldOpenUpward = false;

    if (
      spaceBelow < dropdownHeight &&
      spaceAbove > dropdownHeight &&
      spaceAbove > spaceBelow + 50
    ) {
      top = rect.top - dropdownHeight - gap;
      shouldOpenUpward = true;
    } else {
      top = rect.bottom + gap;
    }

    if (top < 0) {
      top = gap;
    }

    if (top + dropdownHeight > viewportHeight) {
      top = viewportHeight - dropdownHeight - gap;
    }

    let left = rect.left;

    if (left + rect.width > viewportWidth) {
      left = viewportWidth - rect.width - gap;
    }

    if (left < 0) {
      left = gap;
    }

    this.contentList.style.top = `${top}px`;
    this.contentList.style.left = `${left}px`;
    this.contentList.style.width = `${rect.width}px`;

    if (shouldOpenUpward) {
      this.contentList.classList.add("open-upward");
    } else {
      this.contentList.classList.remove("open-upward");
    }
  }

  _setOptionsInternal(options) {
    this.options = options;

    if (!this.contentList) return;

    const ul = this.contentList.querySelector(".select-list");
    if (!ul) return;

    const renderOptions = (optionsToRender) => {
      ul.innerHTML = "";

      if (optionsToRender.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No se encontraron resultados relacionados";
        li.classList.add("no-results");

        // ✅ Cerrar al hacer click
        li.addEventListener("click", (e) => {
          e.stopPropagation();
          this.closeList();
        });

        ul.appendChild(li);

        // ✅ Actualizar posición para ajustar el ancho
        requestAnimationFrame(() => {
          this._updateOptionsPosition();
        });

        return;
      }

      optionsToRender.forEach((opt) => {
        const li = document.createElement("li");
        li.textContent = opt.desc;
        li.dataset.value = opt.value;

        li.addEventListener("click", (e) => {
          e.stopPropagation();
          this.setValue(opt.value);
          this.closeList();
          if (this.btnclean) this.btnclean.style.display = "block";
        });

        ul.appendChild(li);
      });

      // ✅ Actualizar posición después de renderizar
      requestAnimationFrame(() => {
        this._updateOptionsPosition();
      });
    };

    renderOptions(options);

    if (!this._clickHandlerAttached) {
      this.input.addEventListener("click", (e) => {
        e.stopPropagation();

        const isOpen = this.contentList.classList.contains("open");

        document.querySelectorAll(".options-container.open").forEach((el) => {
          if (el !== this.contentList) {
            el.classList.remove("open");
          }
        });

        if (!isOpen) {
          this.contentList.classList.add("open");
          this._updateOptionsPosition();

          this._attachGlobalListeners();

          const searchTerm = this.input.value.toLowerCase();
          renderOptions(
            this.options.filter((opt) =>
              opt.desc.toLowerCase().includes(searchTerm),
            ),
          );

          setTimeout(() => {
            document.addEventListener("click", this.handleOutsideClick);
          }, 10);
        } else {
          this.closeList();
        }
      });

      this.input.addEventListener("input", (e) => {
        e.stopPropagation();

        if (!this.contentList.classList.contains("open")) {
          this.contentList.classList.add("open");
          this._updateOptionsPosition();
          this._attachGlobalListeners();
        }

        renderOptions(
          this.options.filter((opt) =>
            opt.desc.toLowerCase().includes(e.target.value.toLowerCase()),
          ),
        );
      });

      this._clickHandlerAttached = true;
    }
  }

  _attachGlobalListeners() {
    window.addEventListener("scroll", this._updateOptionsPosition, true);
    window.addEventListener("resize", this._handleResize);
    window.addEventListener("blur", this._handleWindowBlur);
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
    document.addEventListener("focusin", this._handleFocusChange, true);
    this._startVisibilityCheck();
  }

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

    if (this._visibilityInterval) {
      clearInterval(this._visibilityInterval);
      this._visibilityInterval = null;
    }
  }

  _handleDocumentInteraction = (e) => {
    if (this.contains(e.target) || this.contentList.contains(e.target)) {
      return;
    }

    const clickedElement = e.target;

    if (
      clickedElement.closest(
        'button, [role="button"], .sidebar, .menu, .nav, .overlay, .backdrop, .modal',
      )
    ) {
      requestAnimationFrame(() => {
        this._checkIfInputIsObscured();
      });
    }
  };

  _handleFocusChange = (e) => {
    if (!this.contains(e.target) && !this.contentList.contains(e.target)) {
      this.closeList();
    }
  };

  _checkIfInputIsObscured() {
    if (!this.isOpen()) return;

    const rect = this.input.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const elementAtPoint = document.elementFromPoint(centerX, centerY);

    if (
      elementAtPoint &&
      !this.contains(elementAtPoint) &&
      elementAtPoint !== this.input
    ) {
      this.closeList();
    }
  }

  _startVisibilityCheck() {
    this._visibilityInterval = setInterval(() => {
      if (!this.isOpen()) {
        clearInterval(this._visibilityInterval);
        return;
      }

      const rect = this.input.getBoundingClientRect();

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

      const computedStyle = window.getComputedStyle(this.input);
      if (
        computedStyle.display === "none" ||
        computedStyle.visibility === "hidden" ||
        computedStyle.opacity === "0"
      ) {
        this.closeList();
        return;
      }

      this._checkIfInputIsObscured();
    }, 500);
  }

  _handleResize = () => {
    if (this.isOpen()) {
      this._updateOptionsPosition();
    }
  };

  _handleWindowBlur = () => {
    if (this.isOpen()) {
      this.closeList();
    }
  };

  isOpen() {
    return this.contentList && this.contentList.classList.contains("open");
  }

  closeList() {
    if (this.contentList) this.contentList.classList.remove("open");
    this._detachGlobalListeners();
  }

  handleOutsideClick(e) {
    if (!this.contains(e.target) && !this.contentList.contains(e.target)) {
      this.closeList();
    }
  }

  setValue(value) {
    const valueStr = String(value);

    this.hiddenInput.value = valueStr;

    const option = this.options.find((o) => String(o.value) === valueStr);
    this.input.value = option ? option.desc : "";

    if (!this.contentList) return;

    this.contentList
      .querySelectorAll(".select-list li")
      .forEach((li) => li.classList.remove("selected"));

    const selected = this.contentList.querySelector(
      `.select-list li[data-value="${valueStr}"]`,
    );
    if (selected) selected.classList.add("selected");

    this.checkValidity();

    this.dispatchEvent(
      new CustomEvent("change", {
        detail: { value: valueStr, desc: option ? option.desc : "" },
        bubbles: true,
      }),
    );
  }

  getValue() {
    if (!this.hiddenInput) return { value: "", desc: "" };

    const value = this.hiddenInput.value;
    const option = (this.options || []).find((opt) => opt.value === value);

    return {
      value: value,
      desc: option ? option.desc : "",
    };
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
    this.btnclean.style.display = "block";
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
    this.btnclean.style.display = "none";
    if (this.contentList) {
      this.contentList.querySelectorAll(".select-list li").forEach((li) => {
        li.classList.remove("selected");
      });
    }
  }

  disconnectedCallback() {
    const name = this.getAttribute("name") || "";
    if (name && CustomAutocomplete.instances[name] === this) {
      delete CustomAutocomplete.instances[name];
    }

    this.closeList();

    if (this._dropdownId) {
      const dropdown = document.getElementById(this._dropdownId);
      if (dropdown) dropdown.remove();
    }
  }

  static get(name) {
    return CustomAutocomplete.instances[name] || null;
  }
}

customElements.define("custom-autocomplete", CustomAutocomplete);
