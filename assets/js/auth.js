/**
 * Proteção simples por senha — client-side only.
 * Suficiente para barrar curiosos; NÃO é segurança real.
 *
 * Para alterar a senha, mude o hash SHA-256 abaixo.
 * Gere um novo hash em: https://emn178.github.io/online-tools/sha256.html
 */
(function () {
    // SHA-256 da senha "jec2025" — altere conforme necessário
    var PASS_HASH = "fb8dbcafa44401910ddd9318f42637b0df0e5cdd05b6407a64217b1c1a4ddb8c";
    var STORAGE_KEY = "docs_auth";

    // Se já autenticou nesta sessão, pular
    if (sessionStorage.getItem(STORAGE_KEY) === PASS_HASH) return;

    // Marcar body como bloqueado
    document.body.classList.add("auth-locked");

    // Criar overlay
    var overlay = document.createElement("div");
    overlay.id = "auth-overlay";
    overlay.innerHTML =
        '<div id="auth-box">' +
        '  <h2>🔒 Área restrita</h2>' +
        '  <p>Digite a senha de acesso</p>' +
        '  <input id="auth-input" type="password" placeholder="Senha" autocomplete="off" />' +
        '  <button id="auth-btn">Entrar</button>' +
        '  <div id="auth-error">Senha incorreta. Tente novamente.</div>' +
        '</div>';
    document.body.appendChild(overlay);

    var input = document.getElementById("auth-input");
    var btn = document.getElementById("auth-btn");
    var err = document.getElementById("auth-error");

    function tryAuth() {
        var val = input.value;
        sha256(val).then(function (hash) {
            if (hash === PASS_HASH) {
                sessionStorage.setItem(STORAGE_KEY, PASS_HASH);
                document.body.classList.remove("auth-locked");
                overlay.remove();
            } else {
                err.style.display = "block";
                input.value = "";
                input.focus();
            }
        });
    }

    btn.addEventListener("click", tryAuth);
    input.addEventListener("keydown", function (e) {
        if (e.key === "Enter") tryAuth();
    });

    // Focus automático
    setTimeout(function () { input.focus(); }, 100);

    // SHA-256 via Web Crypto API (nativo, sem dependências)
    function sha256(message) {
        var encoder = new TextEncoder();
        var data = encoder.encode(message);
        return crypto.subtle.digest("SHA-256", data).then(function (buffer) {
            return Array.from(new Uint8Array(buffer))
                .map(function (b) { return b.toString(16).padStart(2, "0"); })
                .join("");
        });
    }
})();
