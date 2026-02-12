/**
 * Novos Procedimentos — cards na homepage + badges "Novo"/"Atualizado" no sidebar.
 * Lê new-procedures.json (local) e exibe os procedimentos dos últimos 30 dias.
 * Suporta type: "new" (padrão) e "updated".
 */
(function () {
    var PER_PAGE = 6;
    var MAX_AGE_DAYS = 30;

    /* ---- helpers ---- */
    function getBaseUrl() {
        return location.origin + location.pathname.replace(
            /\/(preferencias|procedimentos|referencia-rapida|erros-comuns|faq|contatos)(\/.*)?$/,
            "/"
        );
    }

    function daysBetween(dateStr) {
        var d = new Date(dateStr + "T00:00:00");
        var now = new Date();
        now.setHours(0, 0, 0, 0);
        return Math.floor((now - d) / 86400000);
    }

    function formatDateBR(dateStr) {
        var parts = dateStr.split("-");
        return parts[2] + "/" + parts[1] + "/" + parts[0];
    }

    function relativeLabel(dateStr) {
        var days = daysBetween(dateStr);
        if (days === 0) return "hoje";
        if (days === 1) return "ontem";
        if (days < 7) return days + " dias atrás";
        if (days < 30) return Math.floor(days / 7) + " sem. atrás";
        return formatDateBR(dateStr);
    }

    function getType(item) {
        if (item.type === "updated") return "updated";
        if (item.type === "construction") return "construction";
        return "new";
    }

    function typeLabel(item) {
        var t = getType(item);
        if (t === "construction") return "🚧 Em construção";
        if (t === "updated") return "✏️ Atualizado " + relativeLabel(item.date);
        return "🆕 Adicionado " + relativeLabel(item.date);
    }

    /* ---- Homepage: card grid com paginação ---- */
    function renderCards(items) {
        var container = document.getElementById("new-procedures");
        if (!container) return;

        // Filtrar apenas últimos 30 dias e ordenar do mais recente
        var recent = items.filter(function (p) { return daysBetween(p.date) <= MAX_AGE_DAYS; });
        recent.sort(function (a, b) { return new Date(b.date) - new Date(a.date); });

        if (recent.length === 0) {
            container.style.display = "none";
            return;
        }

        var totalPages = Math.ceil(recent.length / PER_PAGE);
        var currentPage = 1;
        var base = getBaseUrl();

        function buildPage(page) {
            var start = (page - 1) * PER_PAGE;
            var slice = recent.slice(start, start + PER_PAGE);

            var html = '<div class="new-procs-grid">';
            slice.forEach(function (p) {
                var t = getType(p);
                html += '<a class="new-proc-card new-proc-card--' + t + '" href="' + base + p.url + '">';
                html += '<span class="new-proc-card-title">' + p.title + '</span>';
                html += '<span class="new-proc-card-date" title="' + formatDateBR(p.date) + '">'
                    + typeLabel(p) + '</span>';
                html += '</a>';
            });
            html += '</div>';

            if (totalPages > 1) {
                html += '<div class="new-procs-pagination">';
                html += '<button class="np-prev" ' + (page <= 1 ? 'disabled' : '') + '>← Anterior</button>';
                html += '<span class="page-info">' + page + ' / ' + totalPages + '</span>';
                html += '<button class="np-next" ' + (page >= totalPages ? 'disabled' : '') + '>Próximo →</button>';
                html += '</div>';
            }

            container.innerHTML = html;

            // Bind pagination
            var prev = container.querySelector('.np-prev');
            var next = container.querySelector('.np-next');
            if (prev) prev.addEventListener('click', function () { if (currentPage > 1) { currentPage--; buildPage(currentPage); } });
            if (next) next.addEventListener('click', function () { if (currentPage < totalPages) { currentPage++; buildPage(currentPage); } });
        }

        buildPage(1);
    }

    /* ---- helpers: resolve slug de qualquer link ---- */
    function getSlugFromLink(link) {
        // link.href retorna a URL absoluta resolvida pelo browser,
        // independente de o atributo ser relativo (../idpj/, idpj/, etc.)
        try {
            var fullUrl = link.href;
            var match = fullUrl.match(/\/procedimentos\/([^/?#]+)/);
            return match ? match[1].replace(/\/$/, "").replace(/\.md$/, "") : null;
        } catch (e) {
            return null;
        }
    }

    function addBadge(el, type) {
        if (el.querySelector('.badge-novo') || el.querySelector('.badge-atualizado') || el.querySelector('.badge-construcao')) return;
        var badge = document.createElement('span');
        if (type === "construction") {
            badge.className = 'badge-construcao';
            badge.textContent = '🚧';
        } else if (type === "updated") {
            badge.className = 'badge-atualizado';
            badge.textContent = 'Atualizado';
        } else {
            badge.className = 'badge-novo';
            badge.textContent = 'Novo';
        }
        el.appendChild(badge);
    }

    /* ---- Sidebar + conteúdo: badges "Novo" / "Atualizado" / "Em construção" ---- */
    function injectBadges(items) {
        // Prioridade: "new" > "updated" > "construction"
        var typePriority = { "new": 3, "updated": 2, "construction": 1 };
        var recentMap = {};
        items.forEach(function (p) {
            if (daysBetween(p.date) <= MAX_AGE_DAYS) {
                var slug = p.url.replace(/^procedimentos\//, "").replace(/\/$/, "");
                var t = getType(p);
                var prio = typePriority[t] || 0;
                if (!recentMap[slug] || prio > (typePriority[recentMap[slug]] || 0)) {
                    recentMap[slug] = t;
                }
            }
        });

        // 1. Sidebar esquerda (navegação) — não a direita (TOC)
        var navLinks = document.querySelectorAll('.md-sidebar--primary .md-nav__link[href]');
        navLinks.forEach(function (link) {
            var slug = getSlugFromLink(link);
            if (slug && recentMap[slug]) {
                addBadge(link, recentMap[slug]);
            }
        });

        // 2. Conteúdo: tabelas (ex: index de procedimentos)
        var tableLinks = document.querySelectorAll('.md-content td a[href]');
        tableLinks.forEach(function (link) {
            var slug = getSlugFromLink(link);
            if (slug && recentMap[slug]) {
                addBadge(link, recentMap[slug]);
            }
        });
    }

    /* ---- Fetch e inicialização ---- */
    function init() {
        var base = getBaseUrl();
        fetch(base + "assets/data/new-procedures.json")
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(function (data) {
                renderCards(data);
                injectBadges(data);
            })
            .catch(function (err) {
                console.warn("[new-procedures]", err);
                var c = document.getElementById("new-procedures");
                if (c) c.style.display = "none";
            });
    }

    // Suporte navigation.instant do MkDocs Material
    if (typeof document$ !== "undefined") {
        document$.subscribe(function () { init(); });
    } else {
        document.addEventListener("DOMContentLoaded", init);
    }
})();
