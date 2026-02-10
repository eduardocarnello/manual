/**
 * Rotina Diária — checklist com auto-reset diário.
 * Salva estado + data no localStorage. Se a data mudou, reseta tudo.
 */
(function () {
    var STORAGE_KEY = "rotina_diaria";

    function today() {
        return new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
    }

    function loadState() {
        try {
            var data = JSON.parse(localStorage.getItem(STORAGE_KEY));
            if (!data || data.date !== today()) {
                // Dia mudou → reseta
                return { date: today(), checks: {} };
            }
            return data;
        } catch (e) {
            return { date: today(), checks: {} };
        }
    }

    function saveState(state) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        } catch (e) { /* quota exceeded */ }
    }

    function updateProgress(container) {
        var cbs = container.querySelectorAll("input[type=checkbox]");
        var bar = container.querySelector(".rotina-progress");
        if (!bar || cbs.length === 0) return;

        var checked = 0;
        cbs.forEach(function (cb) { if (cb.checked) checked++; });
        var pct = Math.round((checked / cbs.length) * 100);

        bar.querySelector(".rotina-progress-fill").style.width = pct + "%";
        bar.querySelector(".rotina-progress-text").textContent =
            checked + " / " + cbs.length;

        if (pct === 100) {
            bar.classList.add("complete");
        } else {
            bar.classList.remove("complete");
        }
    }

    function init() {
        var container = document.getElementById("rotina-diaria");
        if (!container) return;

        var cbs = container.querySelectorAll("input[type=checkbox]");
        if (cbs.length === 0) return;

        // Exibir data atual
        var dateEl = container.querySelector(".rotina-date");
        if (dateEl) {
            var d = new Date();
            var dias = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
                "Quinta-feira", "Sexta-feira", "Sábado"];
            var meses = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
                "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
            dateEl.textContent = dias[d.getDay()] + ", " +
                d.getDate() + " de " + meses[d.getMonth()] + " de " + d.getFullYear();
        }

        // Carregar estado (com auto-reset se dia mudou)
        var state = loadState();

        cbs.forEach(function (cb, i) {
            if (state.checks[i] === true) cb.checked = true;

            cb.addEventListener("change", function () {
                var s = loadState();
                s.checks[i] = cb.checked;
                saveState(s);
                updateProgress(container);
            });
        });

        // Botão reset manual
        var resetBtn = container.querySelector(".rotina-reset");
        if (resetBtn) {
            resetBtn.addEventListener("click", function () {
                cbs.forEach(function (cb) { cb.checked = false; });
                saveState({ date: today(), checks: {} });
                updateProgress(container);
            });
        }

        saveState(state); // garante que a data fica salva
        updateProgress(container);
    }

    // MkDocs Material navigation.instant
    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { init(); });
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
