class CustomTextField extends HTMLElement {
  static instances = {};

  connectedCallback() {
    const label = this.getAttribute("label") || "";
    const name = this.getAttribute("name") || "";
    const type = this.getAttribute("type") || "text";
    const required = this.hasAttribute("required");
    const iconValue = this.getAttribute("icon") || "";
    const showPassword =
      this.getAttribute("icon-show-password") || "bi bi-eye-fill";
    const hidePassword =
      this.getAttribute("icon-hide-password") || "bi bi-eye-slash-fill";
    const clearable = this.hasAttribute("clearable") && type !== "password";
    this.defaultValue = this.getAttribute("default-value") || "";
    this.msgRequired =
      this.getAttribute("error-required") || "Este campo es obligatorio";
    this.msgPattern = this.getAttribute("error-pattern") || "Formato inválido";
    this.msgEmail = this.getAttribute("error-email") || "Email inválido";

    this.innerHTML = `
      <div class="custom-component">
        <div class="input-container">
          <input 
            type="${type}" 
            id="${name}" 
            name="${name}" 
            placeholder=" "
            autocomplete="off"
            value="${this.defaultValue}"
            ${required ? "required" : ""}>
          <label for="${name}">${label}${
            required ? '<span class="required-asterisk">*</span>' : ""
          }</label>
    ${
      clearable
        ? '<span class="clear-btn" id="clear-btn"><i class="bi bi-arrow-clockwise"></i></span>'
        : ""
    }
          <span class="validation-icon"></span>
        </div>
        <span class="validation-message"></span>
      </div>
    `;

    this.input = this.querySelector("input");
    this.btnclean = this.querySelector("#clear-btn");
    this.label = this.querySelector("label");
    this.message = this.querySelector(".validation-message");
    this.icon = this.querySelector(".validation-icon");

    if (iconValue) {
      const span = document.createElement("span");
      span.classList.add("input-icon");

      const i = document.createElement("i");
      i.className = iconValue;
      span.appendChild(i);

      this.querySelector(".input-container").appendChild(span);
      this.icon.style.right = "32px";
      if (this.btnclean) this.btnclean.style.right = "58px";
    }

    if (type === "password") {
      const toggleBtn = document.createElement("span");
      toggleBtn.classList.add("toggle-password");

      const i = document.createElement("i");
      i.className = showPassword;
      toggleBtn.appendChild(i);

      toggleBtn.addEventListener("click", () => {
        if (this.input.type === "password") {
          this.input.type = "text";
          i.className = hidePassword;
        } else {
          this.input.type = "password";
          i.className = showPassword;
        }
      });

      this.querySelector(".input-container").appendChild(toggleBtn);
      const inputIcon = this.querySelector(".input-icon");
      if (inputIcon) {
        toggleBtn.style.right = "32px";
        if (showPassword || hidePassword) this.icon.style.right = "58px";
        else this.icon.style.right = "32px";
      } else {
        this.icon.style.right = "32px";
      }
      this.toggleBtn = toggleBtn;
    }
    if (this.btnclean) {
      this.btnclean.style.display = this.input.value ? "block" : "none";
      this.btnclean.addEventListener("click", (e) => {
        e.stopPropagation();
        this.initInput();
        this.btnclean.style.display = "none";
        this.checkValidity();
        this.input.dispatchEvent(new Event("input", { bubbles: true }));
      });
    }

    if (this.input) {
      this.input.addEventListener("blur", () => {
        this.input.value = this.input.value.trim();

        if (this.btnclean) {
          this.btnclean.style.display = this.input.value ? "block" : "none";
        }

        // Validar
        this.checkValidity();
      });
    }

    if (this.defaultValue) {
      this.checkValidity();
      if (this.btnclean) {
        this.btnclean.style.display = "block";
      }
    }

    if (name) CustomTextField.instances[name] = this;
  }

  disconnectedCallback() {
    const name = this.getAttribute("name") || "";
    if (name && CustomTextField.instances[name] === this) {
      delete CustomTextField.instances[name];
    }
  }

  static get(name) {
    return CustomTextField.instances[name] || null;
  }

  setValue(value) {
    if (!this.input) return;
    this.input.value = value;

    this.checkValidity();
  }

  getValue() {
    return this.input ? this.input.value : "";
  }

  checkValidity() {
    if (!this.input) return true;

    const value = this.input.value.trim();
    const inputType = this.input.type;

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

    if (value) {
      // Validación automática para email
      if (inputType === "email") {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(value)) {
          this.setError(this.msgEmail);
          return false;
        }
      }

      // Validación de match (para confirmar contraseñas, etc.)
      const matchFieldName = this.getAttribute("match");
      if (matchFieldName) {
        const matchField = CustomTextField.get(matchFieldName);
        if (matchField) {
          const matchValue = matchField.getValue().trim();
          if (matchValue && value !== matchValue) {
            const matchMsg =
              this.getAttribute("error-match") || "Los valores no coinciden";
            this.setError(matchMsg);
            return false;
          }
        }
      }

      // Validación con pattern personalizado (opcional)
      const pattern = this.getAttribute("pattern");
      if (pattern) {
        const regex = new RegExp(pattern, "u");
        if (!regex.test(value)) {
          this.setError(this.msgPattern);
          return false;
        }
      }

      // Validador personalizado
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
    this.input.classList.remove("error");
    this.label.classList.remove("error");
    this.icon.classList.remove("error");
    this.input.classList.remove("valid");
    this.label.classList.remove("valid");
    this.icon.classList.remove("valid");
    this.icon.innerHTML = "";
    this.message.textContent = "";

    // Restaurar el valor por defecto si existe
    this.input.value = this.defaultValue || "";

    // Solo validar si hay valor por defecto
    if (this.defaultValue) {
      this.checkValidity();
      if (this.btnclean) {
        this.btnclean.style.display = "block";
      }
    } else {
      // Si no hay valor por defecto, solo ocultar el botón de limpiar
      if (this.btnclean) {
        this.btnclean.style.display = "none";
      }
    }
  }
}

customElements.define("custom-text-field", CustomTextField);
