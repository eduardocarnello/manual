/* Botão flutuante — Enviar dúvida (Google Forms) */
(function () {
  var url = "https://docs.google.com/forms/d/e/1FAIpQLScC0895Ri62vC4GlPZw8Vrp6ojLZo4ZjkKwVbcaP18GaCWC5A/viewform";
  var btn = document.createElement("a");
  btn.href = url;
  btn.target = "_blank";
  btn.rel = "noopener";
  btn.className = "fab-feedback";
  btn.title = "Enviar dúvida ou sugestão";
  btn.innerHTML =
    '<span class="fab-feedback__icon">💬</span>' +
    '<span class="fab-feedback__label">Enviar dúvida</span>';
  document.body.appendChild(btn);
})();
