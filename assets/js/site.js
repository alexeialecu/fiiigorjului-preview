/* Liga Culturala "Fiii Gorjului" - interactiuni.
   Fara librarii externe. Totul degradeaza curat daca JS e oprit. */
(function () {
  "use strict";

  /* --- Meniu mobil --- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("meniu-principal");

  function closeNav() {
    if (!nav || !toggle) return;
    nav.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");
    inchideSubmeniuri(null);
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", open ? "false" : "true");
      toggle.setAttribute("aria-expanded", open ? "false" : "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest("a")) closeNav();
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1100) closeNav();
    });
  }

  /* --- Submeniurile din sertar ---
     Pe desktop submeniul se deschide din CSS, la hover si la focus, deci butonul
     asta e ascuns si nu are ce strica. In sertar el e singurul mod de deschidere:
     linkul parinte ramane link, butonul de langa el desface lista. */
  var butoaneSub = document.querySelectorAll(".nav__expand");
  function inchideSubmeniuri(exceptie) {
    for (var k = 0; k < butoaneSub.length; k++) {
      var li = butoaneSub[k].parentElement;
      if (li === exceptie) continue;
      li.setAttribute("data-open", "false");
      butoaneSub[k].setAttribute("aria-expanded", "false");
    }
  }
  for (var b = 0; b < butoaneSub.length; b++) {
    butoaneSub[b].addEventListener("click", function (e) {
      e.preventDefault();
      var li = this.parentElement;
      var deschis = li.getAttribute("data-open") === "true";
      inchideSubmeniuri(li);
      li.setAttribute("data-open", deschis ? "false" : "true");
      this.setAttribute("aria-expanded", deschis ? "false" : "true");
    });
  }

  /* --- Lightbox pentru galerie --- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector("img") : null;
  var lightboxLegenda = lightbox ? lightbox.querySelector(".lightbox__legenda") : null;
  var lastFocused = null;

  function openLightbox(src, alt) {
    if (!lightbox || !lightboxImg) return;
    lastFocused = document.activeElement;
    lightboxImg.src = src;
    lightboxImg.alt = alt || "";
    if (lightboxLegenda) lightboxLegenda.textContent = alt || "";
    lightbox.setAttribute("data-open", "true");
    var close = lightbox.querySelector(".lightbox__close");
    if (close) close.focus();
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImg) return;
    lightbox.setAttribute("data-open", "false");
    lightboxImg.removeAttribute("src");
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  document.addEventListener("click", function (e) {
    var trigger = e.target.closest ? e.target.closest(".gallery button") : null;
    if (trigger) {
      var img = trigger.querySelector("img");
      if (img) openLightbox(img.getAttribute("data-full") || img.src, img.alt);
      return;
    }
    if (e.target.classList && e.target.classList.contains("lightbox__close")) closeLightbox();
    if (lightbox && e.target === lightbox) closeLightbox();
  });

  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (lightbox && lightbox.getAttribute("data-open") === "true") closeLightbox();
    if (nav && nav.getAttribute("data-open") === "true") {
      closeNav();
      if (toggle) toggle.focus();
    }
  });

  /* --- YouTube la cerere: nu incarcam iframe pana nu apasa omul --- */
  document.addEventListener("click", function (e) {
    var play = e.target.closest ? e.target.closest(".video-embed__play") : null;
    if (!play) return;
    var wrap = play.parentElement;
    var id = wrap.getAttribute("data-youtube");
    if (!id) return;
    var frame = document.createElement("iframe");
    frame.src = "https://www.youtube.com/embed/" + id + "?autoplay=1&rel=0";
    frame.title = wrap.getAttribute("data-title") || "Material video";
    frame.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    frame.allowFullscreen = true;
    frame.loading = "lazy";
    wrap.innerHTML = "";
    wrap.appendChild(frame);
  });

  /* --- Anul curent in subsol --- */
  var yearSlot = document.getElementById("an-curent");
  if (yearSlot) yearSlot.textContent = String(new Date().getFullYear());

  /* --- Cifrele care urca si barele aurii care se trag ---
     Cifra finala e deja in HTML, deci fara JavaScript pagina e corecta. Aici doar
     o coboram la valoarea de start si o urcam inapoi cand sectiunea intra in ecran.
     Ruleaza o singura data per card. */
  var randuri = document.querySelectorAll("[data-anima-cifre]");
  if (!randuri.length) return;

  var faraMiscare = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function urca(card, intarziere) {
    var slot = card.querySelector(".stat__num");
    var tinta = parseInt(card.getAttribute("data-numar"), 10);
    var start = parseInt(card.getAttribute("data-de-la"), 10) || 0;

    setTimeout(function () {
      card.classList.add("este-vizibil");
    }, intarziere);

    if (!slot || isNaN(tinta) || faraMiscare) return;

    var durata = 1100;
    var pornit = null;
    slot.textContent = String(start);

    function pas(acum) {
      if (pornit === null) pornit = acum;
      var t = Math.min(1, (acum - pornit) / durata);
      var lin = 1 - Math.pow(1 - t, 3);            // easeOutCubic
      slot.textContent = String(Math.round(start + (tinta - start) * lin));
      if (t < 1) requestAnimationFrame(pas);
      else slot.textContent = String(tinta);        // valoarea exacta la final
    }
    setTimeout(function () { requestAnimationFrame(pas); }, intarziere);
  }

  function porneste(rand) {
    var carduri = rand.querySelectorAll(".stat");
    for (var i = 0; i < carduri.length; i++) {
      urca(carduri[i], i * 130);
    }
  }

  if (!("IntersectionObserver" in window)) {
    for (var i = 0; i < randuri.length; i++) porneste(randuri[i]);
    return;
  }

  var observator = new IntersectionObserver(function (intrari) {
    intrari.forEach(function (intrare) {
      if (!intrare.isIntersecting) return;
      observator.unobserve(intrare.target);
      porneste(intrare.target);
    });
  }, { threshold: 0.35, rootMargin: "0px 0px -10% 0px" });

  for (var j = 0; j < randuri.length; j++) observator.observe(randuri[j]);
})();
