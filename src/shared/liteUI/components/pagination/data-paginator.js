class DataPaginator extends HTMLElement {
  constructor() {
    super();
    this.currentPage = 1;
    this.itemsPerPage = 20;
    this.allData = [];
  }

  connectedCallback() {
    this.itemsPerPage = parseInt(this.getAttribute("items-per-page")) || 20;
    this.render();
  }

  setData(data) {
    this.allData = data;
    this.currentPage = 1;
    this.render();
    this.emitPageChange();
  }

  getData() {
    return this.allData;
  }

  getCurrentPageData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;
    return this.allData.slice(start, end);
  }

  getTotalPages() {
    return Math.ceil(this.allData.length / this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage < this.getTotalPages()) {
      this.currentPage++;
      this.render();
      this.emitPageChange();
      this.scrollToTop();
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.render();
      this.emitPageChange();
      this.scrollToTop();
    }
  }

  goToPage(page) {
    const totalPages = this.getTotalPages();
    if (page >= 1 && page <= totalPages) {
      this.currentPage = page;
      this.render();
      this.emitPageChange();
      this.scrollToTop();
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  emitPageChange() {
    const event = new CustomEvent("page-change", {
      detail: {
        currentPage: this.currentPage,
        data: this.getCurrentPageData(),
        totalPages: this.getTotalPages(),
        totalItems: this.allData.length,
        itemsPerPage: this.itemsPerPage,
      },
    });
    this.dispatchEvent(event);
  }

  render() {
    const totalPages = this.getTotalPages();

    if (totalPages === 0 || this.allData.length === 0) {
      this.innerHTML = `
      <div class="data-paginator">
        <button class="paginator-btn" disabled>
          <i class="bi bi-chevron-left"></i>
          <span class="paginator-btn-text">Anterior</span>
        </button>

        <div class="paginator-info">
          <span class="paginator-range">
            <strong>0</strong> - <strong>0</strong>
            <span class="paginator-label">de</span>
            <strong>0</strong>
          </span>
          <span class="paginator-divider">|</span>
          <span class="paginator-page">
            <span class="paginator-label">Pág.</span>
            <strong class="paginator-current">0</strong>
            <span class="paginator-label">de</span>
            <strong>0</strong>
          </span>
        </div>

        <button class="paginator-btn" disabled>
          <span class="paginator-btn-text">Siguiente</span>
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;
      return;
    }

    const start = (this.currentPage - 1) * this.itemsPerPage + 1;
    const end = Math.min(
      this.currentPage * this.itemsPerPage,
      this.allData.length,
    );

    this.innerHTML = `
      <div class="data-paginator">
        <button class="paginator-btn" data-action="prev" ${this.currentPage === 1 ? "disabled" : ""}>
          <i class="bi bi-chevron-left"></i>
          <span class="paginator-btn-text">Anterior</span>
        </button>
        
        <div class="paginator-info">
          <span class="paginator-range">
            <strong>${start}</strong> - <strong>${end}</strong>
            <span class="paginator-label">de</span>
            <strong>${this.allData.length}</strong>
          </span>
          <span class="paginator-divider">|</span>
          <span class="paginator-page">
            <span class="paginator-label">Pág.</span>
            <strong class="paginator-current">${this.currentPage}</strong>
            <span class="paginator-label">de</span>
            <strong>${totalPages}</strong>
          </span>
        </div>
        
        <button class="paginator-btn" data-action="next" ${this.currentPage === totalPages ? "disabled" : ""}>
          <span class="paginator-btn-text">Siguiente</span>
          <i class="bi bi-chevron-right"></i>
        </button>
      </div>
    `;

    const btnPrev = this.querySelector('[data-action="prev"]');
    const btnNext = this.querySelector('[data-action="next"]');

    if (btnPrev) {
      btnPrev.addEventListener("click", () => this.prevPage());
    }

    if (btnNext) {
      btnNext.addEventListener("click", () => this.nextPage());
    }
  }
}

customElements.define("data-paginator", DataPaginator);
