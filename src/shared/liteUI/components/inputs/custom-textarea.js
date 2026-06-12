class CustomTextarea extends HTMLElement {
  static instances = {};

  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const name = this.getAttribute("name") || "";
    const required = this.hasAttribute("required");
    const rows = this.getAttribute("rows") || 3;
    const iconValue = this.getAttribute("icon") || "";

    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";
    this.msgPattern = this.getAttribute("error-pattern") || "Formato inválido";

    this.innerHTML = `
      <div class="custom-component">
        <div class="input-container textarea-container">
          <textarea
            id="${name}"
            name="${name}"
            rows="${rows}"
            class="scrollbar-thin scrollbar-track-gray-white scrollbar-thumb-neutral-400"
            placeholder=" "
            autocomplete="off"
            ${required ? "required" : ""}></textarea>
          <label for="${name}">
            ${label}${
              required ? '<span class="required-asterisk">*</span>' : ""
            }</label>
          <span class="validation-icon"></span>
        </div>
        <span class="validation-message"></span>
      </div>
    `;

    this.textarea = this.querySelector("textarea");
    this.label = this.querySelector("label");
    this.message = this.querySelector(".validation-message");
    this.icon = this.querySelector(".validation-icon");

    // Icono izquierdo
    if (iconValue) {
      const span = document.createElement("span");
      span.classList.add("input-icon");

      const i = document.createElement("i");
      i.className = iconValue;
      span.appendChild(i);

      this.querySelector(".input-container").appendChild(span);
      this.icon.style.right = "32px";
    }

    this.textarea.addEventListener("blur", () => {
      this.textarea.value = this.textarea.value.trim();
      this.checkValidity();
    });

    if (name) CustomTextarea.instances[name] = this;
  }

  disconnectedCallback() {
    const name = this.getAttribute("name") || "";
    if (name && CustomTextarea.instances[name] === this) {
      delete CustomTextarea.instances[name];
    }
  }

  static get(name) {
    return CustomTextarea.instances[name] || null;
  }

  setValue(value) {
    if (!this.textarea) return;
    this.textarea.value = value;
    this.checkValidity();
  }

  getValue() {
    return this.textarea ? this.textarea.value : "";
  }

  checkValidity() {
    if (!this.textarea) return true;

    const value = this.textarea.value.trim();

    if (!this.hasAttribute("required") && !value) {
      this.textarea.classList.remove("error", "valid");
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

    if (value) {
      const pattern = this.getAttribute("pattern");
      if (pattern) {
        const regex = new RegExp(pattern, "u");
        if (!regex.test(value)) {
          this.setError(this.msgPattern);
          return false;
        }
      }

      if (this.customValidator && typeof this.customValidator === "function") {
        const valid = this.customValidator(value);
        if (valid !== true) {
          this.setError(valid || "Valor inválido");
          return false;
        }
      }
    }

    this.clearError();
    return true;
  }

  setError(msg) {
    this.textarea.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");

    this.textarea.classList.add("error");
    this.label.classList.add("error");
    this.icon.classList.add("error");

    this.icon.innerHTML = "<i class='bi bi-x-lg'></i>";
    this.message.textContent = msg;
  }

  clearError() {
    this.textarea.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");

    this.textarea.classList.add("valid");
    this.label.classList.add("valid");
    this.icon.classList.add("valid");

    this.icon.innerHTML = "<i class='bi bi-check-lg'></i>";
    this.message.textContent = "";
  }

  initInput() {
    this.textarea.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");
    this.textarea.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");
    this.icon.innerHTML = "";
    this.textarea.value = "";
    this.message.textContent = "";
  }
}

customElements.define("custom-textarea", CustomTextarea);
