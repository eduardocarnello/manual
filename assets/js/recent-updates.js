/**
 * Atualizações Recentes — busca do updates.json local.
 * Exibe timeline na homepage automaticamente.
 */
(function () {
    var MAX_ITEMS = 8;

    function formatDate(iso) {
        var d = new Date(iso);
        var dia = d.getDate().toString().padStart(2, "0");
        var mes = (d.getMonth() + 1).toString().padStart(2, "0");
        var ano = d.getFullYear();
        var h = d.getHours().toString().padStart(2, "0");
        var m = d.getMinutes().toString().padStart(2, "0");
        return dia + "/" + mes + "/" + ano + " às " + h + ":" + m;
    }

    function relativeDate(iso) {
        var now = new Date();
        var d = new Date(iso);
        var diff = Math.floor((now - d) / 1000);

        if (diff < 60) return "agora mesmo";
        if (diff < 3600) return Math.floor(diff / 60) + " min atrás";
        if (diff < 86400) return Math.floor(diff / 3600) + "h atrás";
        var days = Math.floor(diff / 86400);
        if (days === 1) return "ontem";
        if (days < 7) return days + " dias atrás";
        if (days < 30) return Math.floor(days / 7) + " sem. atrás";
        return formatDate(iso);
    }

    function getBaseUrl() {
        return location.origin + location.pathname.replace(
            /\/(preferencias|procedimentos|referencia-rapida|erros-comuns|faq|contatos)(\/.*)?$/,
            "/"
        );
    }

    function render(items) {
        var container = document.getElementById("recent-updates");
        if (!container) return;

        if (!items || items.length === 0) {
            container.innerHTML = '<p style="font-size:.82rem;color:var(--md-default-fg-color--light)">Nenhuma atualização recente encontrada.</p>';
            return;
        }

        var html = '<ul class="updates-list">';

        items.slice(0, MAX_ITEMS).forEach(function (item) {
            html += '<li class="updates-item">';
            html += '<span class="updates-dot"></span>';
            html += '<div class="updates-content">';
            html += '<span class="updates-msg">' + item.msg + '</span>';
            html += '<span class="updates-time" title="' + formatDate(item.date) + '">' + relativeDate(item.date) + '</span>';
            html += '</div>';
            html += '</li>';
        });

        html += '</ul>';
        container.innerHTML = html;
    }

    function fetchUpdates() {
        var container = document.getElementById("recent-updates");
        if (!container) return;

        container.innerHTML = '<p style="font-size:.82rem;color:var(--md-default-fg-color--light)">Carregando atualizações…</p>';

        var base = getBaseUrl();
        fetch(base + "assets/data/updates.json")
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(function (data) {
                render(data);
            })
            .catch(function () {
                container.innerHTML = '<p style="font-size:.82rem;color:var(--md-default-fg-color--light)">Não foi possível carregar as atualizações.</p>';
            });
    }

    // MkDocs Material navigation.instant
    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { fetchUpdates(); });
    } else {
        document.addEventListener("DOMContentLoaded", fetchUpdates);
    }
})();
