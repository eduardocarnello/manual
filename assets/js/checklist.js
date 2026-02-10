/**
 * Checklists interativos com persistência em localStorage.
 * Salva o estado de cada checkbox por página (pathname).
 */
(function () {
  var STORAGE_PREFIX = "checklist_";

  function getKey() {
    return STORAGE_PREFIX + location.pathname;
  }

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(getKey())) || {};
    } catch (e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(getKey(), JSON.stringify(state));
    } catch (e) { /* quota exceeded */ }
  }

  function updateProgress() {
    var bar = document.getElementById("checklist-progress");
    if (!bar) return;

    var all = document.querySelectorAll(".task-list-control input[type=checkbox]");
    if (all.length === 0) {
      bar.style.display = "none";
      return;
    }

    var checked = 0;
    all.forEach(function (cb) { if (cb.checked) checked++; });
    var pct = Math.round((checked / all.length) * 100);

    bar.style.display = "";
    bar.querySelector(".progress-fill").style.width = pct + "%";
    bar.querySelector(".progress-text").textContent =
      checked + " / " + all.length + " (" + pct + "%)";

    // Classe para animação quando 100%
    if (pct === 100) {
      bar.classList.add("complete");
    } else {
      bar.classList.remove("complete");
    }
  }

  function init() {
    var checkboxes = document.querySelectorAll(".task-list-control input[type=checkbox]");
    if (checkboxes.length === 0) return;

    // Inserir barra de progresso antes do primeiro checklist
    var firstList = document.querySelector(".task-list");
    if (firstList && !document.getElementById("checklist-progress")) {
      var bar = document.createElement("div");
      bar.id = "checklist-progress";
      bar.className = "checklist-progress";
      bar.innerHTML =
        '<div class="progress-label">✅ Progresso desta página</div>' +
        '<div class="progress-bar">' +
        '  <div class="progress-fill"></div>' +
        '</div>' +
        '<div class="progress-text">0 / 0 (0%)</div>' +
        '<button class="progress-reset" title="Limpar marcações">↺ Resetar</button>';
      firstList.parentNode.insertBefore(bar, firstList);

      bar.querySelector(".progress-reset").addEventListener("click", function () {
        checkboxes.forEach(function (cb) { cb.checked = false; });
        saveState({});
        updateProgress();
      });
    }

    // Carregar estado salvo
    var state = loadState();
    checkboxes.forEach(function (cb, i) {
      if (state[i] === true) cb.checked = true;

      cb.addEventListener("change", function () {
        var s = loadState();
        s[i] = cb.checked;
        saveState(s);
        updateProgress();
      });
    });

    updateProgress();
  }

  // MkDocs Material usa navigation.instant: precisa re-inicializar a cada navegação
  if (typeof document$ !== "undefined") {
    document$.subscribe(function () { init(); });
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
