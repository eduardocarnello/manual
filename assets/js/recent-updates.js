/**
 * Atualizações Recentes — busca commits da pasta docs/ via GitHub API.
 * Exibe timeline na homepage automaticamente.
 */
(function () {
    var REPO = "eduardocarnello/scripts";
    var PATH = "docs";
    var MAX_ITEMS = 8;
    var CACHE_KEY = "recent_updates";
    var CACHE_TTL = 10 * 60 * 1000; // 10 minutos

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

    function cleanMessage(msg) {
        // Primeira linha apenas, sem prefixos convencionais de commit
        var line = msg.split("\n")[0].trim();
        // Remove prefixos tipo "docs:", "fix:", "feat:", "chore:" etc.
        line = line.replace(/^(docs|fix|feat|chore|style|refactor|update|add|remove|delete)\s*[:!]\s*/i, "");
        // Capitaliza primeira letra
        if (line.length > 0) {
            line = line.charAt(0).toUpperCase() + line.slice(1);
        }
        return line;
    }

    function getCached() {
        try {
            var raw = localStorage.getItem(CACHE_KEY);
            if (!raw) return null;
            var cache = JSON.parse(raw);
            if (Date.now() - cache.ts > CACHE_TTL) return null;
            return cache.data;
        } catch (e) {
            return null;
        }
    }

    function setCache(data) {
        try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data }));
        } catch (e) { /* quota */ }
    }

    function render(commits) {
        var container = document.getElementById("recent-updates");
        if (!container) return;

        if (!commits || commits.length === 0) {
            container.innerHTML = '<p style="font-size:.82rem;color:var(--md-default-fg-color--light)">Nenhuma atualização recente encontrada.</p>';
            return;
        }

        var html = '<ul class="updates-list">';
        // Deduplicate by message (same commit message = same logical change)
        var seen = {};
        var items = [];
        commits.forEach(function (c) {
            var msg = cleanMessage(c.commit.message);
            if (!seen[msg]) {
                seen[msg] = true;
                items.push({
                    msg: msg,
                    date: c.commit.author.date,
                    url: c.html_url,
                    author: c.commit.author.name
                });
            }
        });

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

        // Tentar cache primeiro
        var cached = getCached();
        if (cached) {
            render(cached);
            return;
        }

        // Loading state
        container.innerHTML = '<p style="font-size:.82rem;color:var(--md-default-fg-color--light)">Carregando atualizações…</p>';

        var url = "https://api.github.com/repos/" + REPO + "/commits?path=" + PATH + "&per_page=" + (MAX_ITEMS + 5);
        fetch(url)
            .then(function (r) {
                if (!r.ok) throw new Error(r.status);
                return r.json();
            })
            .then(function (data) {
                setCache(data);
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
