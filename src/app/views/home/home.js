let DialogModal1 = null;
let DialogModal2 = null;

function init() {
  DialogModal1 = document.getElementById("DialogModal1");
  DialogModal2 = document.getElementById("DialogModal2");
}

window.openModalForm = function () {
  ModalManager.open(DialogModal1);
};

window.openModalForm2 = function () {
  ModalManager.open(DialogModal2);
};

init();
