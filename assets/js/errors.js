/**
 * Erros Comuns — renderiza cards dinâmicos a partir de errors.json.
 * Sincroniza a página /erros-comuns/ com os procedimentos em /procedimentos/correcao-erros/.
 */
(function () {
    function getBaseUrl() {
        return location.origin + location.pathname.replace(
            /\/(preferencias|procedimentos|referencia-rapida|erros-comuns|faq|contatos)(\/.*)?$/,
            "/"
        );
    }

    function renderErrors(errors) {
        var container = document.getElementById("errors-container");
        if (!container) return;

        // Agrupar por categoria
        var categories = {};
        var categoryOrder = [];
        errors.forEach(function (e) {
            if (!categories[e.category]) {
                categories[e.category] = [];
                categoryOrder.push(e.category);
            }
            categories[e.category].push(e);
        });

        var base = getBaseUrl();
        var html = "";

        categoryOrder.forEach(function (cat) {
            html += '<div class="errors-category">';
            html += '<h2 class="errors-category__title">' + cat + '</h2>';

            categories[cat].forEach(function (e) {
                html += '<details class="error-card">';
                html += '<summary class="error-card__header">';
                html += '<span class="error-card__icon">❌</span>';
                html += '<span class="error-card__title">' + e.title + '</span>';
                html += '</summary>';
                html += '<div class="error-card__body">';
                html += '<p class="error-card__field"><strong>Causa:</strong> ' + e.causa + '</p>';
                html += '<p class="error-card__field"><strong>Solução:</strong> ' + e.solucao + '</p>';
                html += '<a class="error-card__btn" href="' + base + e.url + '">';
                html += '📋 Ver passo a passo →</a>';
                html += '</div>';
                html += '</details>';
            });

            html += '</div>';
        });

        container.innerHTML = html;
    }

    function init() {
        var container = document.getElementById("errors-container");
        if (!container) return;

        var base = getBaseUrl();
        fetch(base + "assets/data/errors.json")
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(renderErrors)
            .catch(function (err) {
                console.warn("[errors]", err);
            });
    }

    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { init(); });
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
