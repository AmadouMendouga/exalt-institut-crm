from .config import settings

_TEMPLATE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Prendre rendez-vous - Exalt Institut</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg-page: #fbf6f2;
    --surface: #ffffff;
    --surface-alt: #f3e8e1;
    --border-color: #d9c9be;
    --text-primary: #231f20;
    --text-muted: #78716c;
    --accent: #cc7457;
    --accent-dark: #90503b;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg-page: #1c1917;
      --surface: #292524;
      --surface-alt: #35302c;
      --border-color: #44403c;
      --text-primary: #f5f0ec;
      --text-muted: #a8a29e;
      --accent: #e0916f;
      --accent-dark: #f0b79c;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    padding: 16px 16px 90px;
    background: var(--bg-page);
    color: var(--text-primary);
    font-family: 'Montserrat', sans-serif;
  }
  .wrap { max-width: 560px; margin: 0 auto; }
  .top-bar { display: flex; align-items: center; justify-content: space-between; gap: 8px; margin-bottom: 4px; }
  .top-bar-spacer { width: 40px; }
  h1.brand {
    font-family: 'Kalam', cursive;
    font-size: 1.7rem;
    color: var(--accent-dark);
    text-align: center;
    margin: 0;
  }
  p.subtitle {
    color: var(--text-muted);
    font-size: 0.85rem;
    text-align: center;
    margin: 4px 0 20px;
  }
  .cart-btn {
    position: relative;
    width: 40px; height: 40px;
    border-radius: 50%;
    border: 1px solid var(--border-color);
    background: var(--surface);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    font-size: 1.1rem;
    flex-shrink: 0;
  }
  .cart-badge {
    position: absolute; top: -4px; right: -4px;
    background: var(--accent); color: #fff;
    font-size: 0.65rem; font-weight: 700;
    min-width: 18px; height: 18px; border-radius: 999px;
    display: flex; align-items: center; justify-content: center;
    padding: 0 4px;
  }
  .chips { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; margin-bottom: 16px; }
  .chip {
    flex-shrink: 0;
    padding: 7px 14px;
    border-radius: 999px;
    border: 1px solid var(--border-color);
    background: var(--surface);
    color: var(--text-muted);
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    white-space: nowrap;
  }
  .chip.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; min-width: 0; }
  .service-card {
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .service-card .thumb {
    width: 100%;
    aspect-ratio: 4 / 3;
    object-fit: cover;
    display: block;
    background: var(--surface-alt);
  }
  .service-card .thumb-placeholder {
    width: 100%;
    aspect-ratio: 4 / 3;
    background: linear-gradient(135deg, var(--surface-alt), var(--border-color));
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--accent-dark);
    font-size: 1.8rem;
  }
  .service-card .body { padding: 12px; display: flex; flex-direction: column; gap: 4px; flex: 1; min-width: 0; }
  .service-card .cat {
    font-size: 0.62rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--accent-dark);
  }
  .service-card .name {
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    word-break: break-word;
  }
  .service-card .price { font-size: 0.92rem; font-weight: 700; margin-top: auto; }
  .service-card button {
    margin-top: 8px;
    padding: 9px;
    border: none;
    border-radius: 10px;
    background: var(--accent);
    color: #fff;
    font-size: 0.8rem;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
  }
  .service-card button:hover { background: var(--accent-dark); }
  .service-card button.in-cart { background: var(--accent-dark); }
  .empty { text-align: center; color: var(--text-muted); font-size: 0.85rem; padding: 30px 0; grid-column: 1 / -1; }

  .card {
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 24px 20px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  }
  .back-btn {
    background: none; border: none; color: var(--text-muted); font-size: 0.8rem;
    cursor: pointer; padding: 0; margin-bottom: 14px; font-weight: 600;
  }
  .booking-summary { background: var(--surface-alt); border-radius: 12px; padding: 12px; margin-bottom: 4px; font-size: 0.85rem; }
  .booking-summary .line { display: flex; justify-content: space-between; padding: 2px 0; }
  .booking-summary .total { font-weight: 700; border-top: 1px solid var(--border-color); margin-top: 6px; padding-top: 6px; }
  label.field-label {
    display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.03em; color: var(--text-muted); margin: 16px 0 8px;
  }
  .date-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
  .date-chip {
    flex-shrink: 0; width: 56px; padding: 8px 4px; border-radius: 12px;
    border: 1px solid var(--border-color); background: var(--bg-page);
    text-align: center; cursor: pointer;
  }
  .date-chip .dow { font-size: 0.65rem; color: var(--text-muted); text-transform: uppercase; }
  .date-chip .num { font-size: 1rem; font-weight: 700; }
  .date-chip.active { background: var(--accent); border-color: var(--accent); }
  .date-chip.active .dow, .date-chip.active .num { color: #fff; }
  .slot-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
  .slot-btn {
    padding: 9px 4px; border-radius: 10px; border: 1px solid var(--border-color);
    background: var(--bg-page); color: var(--text-primary); font-size: 0.85rem;
    font-weight: 600; cursor: pointer;
  }
  .slot-btn.active { background: var(--accent); border-color: var(--accent); color: #fff; }
  .slot-empty { grid-column: 1 / -1; color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 10px 0; }
  input, textarea {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 11px 12px;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--text-primary);
    background: var(--bg-page);
  }
  textarea { min-height: 70px; resize: vertical; }
  input:focus, textarea:focus, button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  button.submit {
    width: 100%;
    margin-top: 20px;
    padding: 13px;
    border: none;
    border-radius: 12px;
    background: var(--accent);
    color: #fff;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
  }
  button.submit:disabled { opacity: 0.6; cursor: not-allowed; }
  button.submit:hover:not(:disabled) { background: var(--accent-dark); }
  .error {
    color: #b3261e;
    font-size: 0.85rem;
    margin-top: 10px;
    display: none;
  }
  .step { display: none; }
  .step.active { display: block; }
  .thanks { text-align: center; }
  .thanks .icon { margin-bottom: 8px; color: var(--accent); }
  .thanks h1 { font-family: 'Kalam', cursive; font-size: 1.7rem; color: var(--accent-dark); margin: 0 0 8px; }
  .thanks p { color: var(--text-muted); font-size: 0.9rem; margin: 0 0 4px; }
  .thanks .recap { background: var(--surface-alt); border-radius: 12px; padding: 14px; margin: 16px 0; font-size: 0.85rem; text-align: left; }
  a.wa-btn {
    display: block; margin-top: 14px; padding: 12px; border-radius: 12px;
    background: #25D366; color: #fff; text-decoration: none; font-weight: 600; font-size: 0.9rem;
  }

  /* Toast flottant "voir le panier" */
  .cart-toast {
    position: fixed; left: 16px; right: 16px; bottom: 16px;
    max-width: 528px; margin: 0 auto;
    background: var(--accent-dark); color: #fff;
    border-radius: 999px; padding: 10px 10px 10px 16px;
    display: none; align-items: center; justify-content: space-between; gap: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.25);
    cursor: pointer; z-index: 40;
    font-size: 0.85rem; font-weight: 600;
  }
  .cart-toast.visible { display: flex; }
  .cart-toast .chev {
    width: 26px; height: 26px; border-radius: 50%; background: rgba(255,255,255,0.2);
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }

  /* Panier (bottom sheet) */
  .drawer-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    display: none; z-index: 49;
  }
  .drawer-backdrop.visible { display: block; }
  .cart-drawer {
    position: fixed; left: 0; right: 0; bottom: 0;
    max-width: 560px; margin: 0 auto;
    background: var(--surface); border-radius: 20px 20px 0 0;
    padding: 18px; max-height: 80vh; overflow-y: auto;
    transform: translateY(100%); transition: transform 0.25s ease;
    z-index: 50;
    box-shadow: 0 -10px 40px rgba(0,0,0,0.2);
  }
  .cart-drawer.open { transform: translateY(0); }
  .cart-drawer-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
  .cart-drawer-header h2 { font-size: 1.05rem; margin: 0; }
  .cart-drawer-close { background: none; border: none; font-size: 1.2rem; color: var(--text-muted); cursor: pointer; }
  .cart-item { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--border-color); }
  .cart-item img, .cart-item .thumb-placeholder-sm {
    width: 48px; height: 48px; border-radius: 10px; object-fit: cover; flex-shrink: 0;
    background: var(--surface-alt);
  }
  .cart-item .thumb-placeholder-sm { display: flex; align-items: center; justify-content: center; font-size: 1.1rem; }
  .cart-item .info { flex: 1; min-width: 0; }
  .cart-item .info .name { font-size: 0.82rem; font-weight: 600; line-height: 1.25; }
  .cart-item .info .price { font-size: 0.78rem; color: var(--text-muted); }
  .qty-stepper { display: flex; align-items: center; gap: 6px; }
  .qty-stepper button {
    width: 24px; height: 24px; border-radius: 50%; border: 1px solid var(--border-color);
    background: var(--bg-page); color: var(--text-primary); cursor: pointer; font-size: 0.9rem;
    display: flex; align-items: center; justify-content: center; padding: 0;
  }
  .qty-stepper .qty { font-size: 0.85rem; font-weight: 700; min-width: 16px; text-align: center; }
  .cart-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 4px; margin-left: 4px; }
  .cart-subtotal { display: flex; justify-content: space-between; font-size: 0.9rem; font-weight: 700; margin: 14px 0 4px; }
  button.cart-cta {
    width: 100%; padding: 13px; border: none; border-radius: 12px;
    background: var(--accent); color: #fff; font-size: 0.9rem; font-weight: 600; cursor: pointer;
  }
  button.cart-cta:hover { background: var(--accent-dark); }
</style>
</head>
<body>
<div class="wrap">
  <div class="top-bar">
    <span class="top-bar-spacer"></span>
    <h1 class="brand">Exalt Institut</h1>
    <button class="cart-btn" id="cart-btn" type="button" aria-label="Panier">
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
      <span class="cart-badge" id="cart-badge" style="display:none;">0</span>
    </button>
  </div>
  <p class="subtitle">Ajoutez vos soins puis choisissez un créneau qui vous convient.</p>

  <div class="step active" id="step-catalog">
    <div class="chips" id="chips"></div>
    <div class="grid" id="grid"><div class="empty">Chargement…</div></div>
  </div>

  <div class="step" id="step-booking">
    <div class="card">
      <button class="back-btn" id="back-to-catalog">&larr; Retour aux soins</button>

      <div class="booking-summary" id="booking-summary"></div>

      <label class="field-label">Date</label>
      <div class="date-strip" id="date-strip"></div>

      <label class="field-label">Créneau</label>
      <div class="slot-grid" id="slot-grid"><div class="slot-empty">Choisissez une date</div></div>

      <label class="field-label">Vos coordonnées</label>
      <input type="text" id="client-name" placeholder="Nom complet" />
      <div style="height:10px"></div>
      <input type="tel" id="client-phone" placeholder="Téléphone (WhatsApp)" />
      <div style="height:10px"></div>
      <textarea id="note" placeholder="Une précision à ajouter ? (optionnel)"></textarea>

      <div class="error" id="error">Une erreur est survenue, réessayez.</div>
      <button class="submit" id="submit" disabled>Envoyer ma demande</button>
    </div>
  </div>

  <div class="step" id="step-thanks">
    <div class="card thanks">
      <div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></svg></div>
      <h1>Demande envoyée !</h1>
      <p>Nous vous confirmons votre rendez-vous très vite.</p>
      <div class="recap" id="recap"></div>
      <a class="wa-btn" id="wa-confirm-btn" href="#" style="display:none;">Confirmer aussi sur WhatsApp</a>
    </div>
  </div>
</div>

<div class="cart-toast" id="cart-toast">
  <span id="cart-toast-label">Voir mon panier</span>
  <span class="chev">›</span>
</div>

<div class="drawer-backdrop" id="drawer-backdrop"></div>
<div class="cart-drawer" id="cart-drawer">
  <div class="cart-drawer-header">
    <h2>Votre panier</h2>
    <button class="cart-drawer-close" id="cart-drawer-close" type="button" aria-label="Fermer">✕</button>
  </div>
  <div id="cart-items"></div>
  <div class="cart-subtotal" id="cart-subtotal" style="display:none;">
    <span>Sous-total indicatif</span>
    <span id="cart-subtotal-value"></span>
  </div>
  <button class="cart-cta" id="cart-cta" type="button">Choisir un créneau</button>
</div>

<script>
  var WA_PHONE = "__WA_PHONE__";
  var clientId = new URLSearchParams(window.location.search).get('client');
  var services = [];
  var selectedCategory = 'Tous';
  var cart = {}; // id -> { service, qty }
  var selectedDate = null;
  var selectedTime = null;

  var chipsEl = document.getElementById('chips');
  var gridEl = document.getElementById('grid');
  var dateStripEl = document.getElementById('date-strip');
  var slotGridEl = document.getElementById('slot-grid');
  var submitBtn = document.getElementById('submit');
  var errorEl = document.getElementById('error');
  var cartBadge = document.getElementById('cart-badge');
  var cartToast = document.getElementById('cart-toast');
  var cartToastLabel = document.getElementById('cart-toast-label');
  var drawerBackdrop = document.getElementById('drawer-backdrop');
  var cartDrawer = document.getElementById('cart-drawer');
  var cartItemsEl = document.getElementById('cart-items');
  var cartSubtotalEl = document.getElementById('cart-subtotal');
  var cartSubtotalValueEl = document.getElementById('cart-subtotal-value');
  var toastTimer = null;

  function showStep(id) {
    document.querySelectorAll('.step').forEach(function (el) { el.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
  }

  function formatFCFA(v) { return v.toLocaleString('fr-FR') + ' FCFA'; }

  function cartEntries() { return Object.keys(cart).map(function (id) { return cart[id]; }); }
  function cartCount() { return cartEntries().reduce(function (sum, e) { return sum + e.qty; }, 0); }
  function cartTotal() { return cartEntries().reduce(function (sum, e) { return sum + e.qty * e.service.price; }, 0); }

  fetch('/api/public/services')
    .then(function (res) { return res.json(); })
    .then(function (data) {
      services = data;
      renderChips();
      renderGrid();
    })
    .catch(function () {
      gridEl.innerHTML = '<div class="empty">Impossible de charger les soins, réessayez plus tard.</div>';
    });

  function renderChips() {
    var categories = ['Tous'];
    services.forEach(function (s) { if (categories.indexOf(s.category) === -1) categories.push(s.category); });
    chipsEl.innerHTML = '';
    categories.forEach(function (cat) {
      var chip = document.createElement('button');
      chip.className = 'chip' + (cat === selectedCategory ? ' active' : '');
      chip.textContent = cat;
      chip.addEventListener('click', function () {
        selectedCategory = cat;
        renderChips();
        renderGrid();
      });
      chipsEl.appendChild(chip);
    });
  }

  var PLACEHOLDER_ICON = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-5-5L5 21"/></svg>';

  function makeThumb(service, sizeClass) {
    if (service.imageUrl) {
      var img = document.createElement('img');
      img.className = sizeClass;
      img.src = service.imageUrl;
      img.alt = service.name;
      img.loading = 'lazy';
      img.addEventListener('error', function () {
        var ph = document.createElement('div');
        ph.className = sizeClass === 'thumb' ? 'thumb-placeholder' : 'thumb-placeholder-sm';
        ph.innerHTML = PLACEHOLDER_ICON;
        img.replaceWith(ph);
      });
      return img;
    }
    var placeholder = document.createElement('div');
    placeholder.className = sizeClass === 'thumb' ? 'thumb-placeholder' : 'thumb-placeholder-sm';
    placeholder.innerHTML = PLACEHOLDER_ICON;
    return placeholder;
  }

  function renderGrid() {
    var filtered = selectedCategory === 'Tous' ? services : services.filter(function (s) { return s.category === selectedCategory; });
    if (filtered.length === 0) {
      gridEl.innerHTML = '<div class="empty">Aucun soin dans cette catégorie.</div>';
      return;
    }
    gridEl.innerHTML = '';
    filtered.forEach(function (s) {
      var card = document.createElement('div');
      card.className = 'service-card';
      card.appendChild(makeThumb(s, 'thumb'));

      var body = document.createElement('div');
      body.className = 'body';

      var catEl = document.createElement('span');
      catEl.className = 'cat';
      catEl.textContent = s.category;
      body.appendChild(catEl);

      var nameEl = document.createElement('span');
      nameEl.className = 'name';
      nameEl.textContent = s.name;
      body.appendChild(nameEl);

      var priceEl = document.createElement('span');
      priceEl.className = 'price';
      priceEl.textContent = formatFCFA(s.price);
      body.appendChild(priceEl);

      var btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = cart[s.id] ? 'Ajouté ✓' : 'Ajouter';
      if (cart[s.id]) btn.classList.add('in-cart');
      btn.addEventListener('click', function () { addToCart(s, btn); });
      body.appendChild(btn);

      card.appendChild(body);
      gridEl.appendChild(card);
    });
  }

  function addToCart(service, btnEl) {
    if (cart[service.id]) {
      cart[service.id].qty += 1;
    } else {
      cart[service.id] = { service: service, qty: 1 };
    }
    updateCartBadge();
    showCartToast();
    if (btnEl) {
      btnEl.textContent = 'Ajouté ✓';
      btnEl.classList.add('in-cart');
    }
  }

  function updateCartBadge() {
    var count = cartCount();
    if (count > 0) {
      cartBadge.style.display = 'flex';
      cartBadge.textContent = String(count);
    } else {
      cartBadge.style.display = 'none';
    }
  }

  function showCartToast() {
    var count = cartCount();
    cartToastLabel.textContent = 'Voir mon panier · ' + count + (count > 1 ? ' soins' : ' soin');
    cartToast.classList.add('visible');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { cartToast.classList.remove('visible'); }, 4000);
  }

  cartToast.addEventListener('click', function () { openCartDrawer(); });
  document.getElementById('cart-btn').addEventListener('click', function () { openCartDrawer(); });
  document.getElementById('cart-drawer-close').addEventListener('click', closeCartDrawer);
  drawerBackdrop.addEventListener('click', closeCartDrawer);

  function openCartDrawer() {
    if (toastTimer) clearTimeout(toastTimer);
    cartToast.classList.remove('visible');
    renderCartDrawer();
    drawerBackdrop.classList.add('visible');
    cartDrawer.classList.add('open');
  }

  function closeCartDrawer() {
    drawerBackdrop.classList.remove('visible');
    cartDrawer.classList.remove('open');
  }

  function renderCartDrawer() {
    var entries = cartEntries();
    if (entries.length === 0) {
      cartItemsEl.innerHTML = '<div class="empty">Votre panier est vide.</div>';
      cartSubtotalEl.style.display = 'none';
      document.getElementById('cart-cta').disabled = true;
      return;
    }
    cartItemsEl.innerHTML = '';
    entries.forEach(function (entry) {
      var row = document.createElement('div');
      row.className = 'cart-item';
      row.appendChild(makeThumb(entry.service, 'thumb-placeholder-sm'));

      var info = document.createElement('div');
      info.className = 'info';
      var nameEl = document.createElement('div');
      nameEl.className = 'name';
      nameEl.textContent = entry.service.name;
      var priceEl = document.createElement('div');
      priceEl.className = 'price';
      priceEl.textContent = formatFCFA(entry.service.price);
      info.appendChild(nameEl);
      info.appendChild(priceEl);
      row.appendChild(info);

      var stepper = document.createElement('div');
      stepper.className = 'qty-stepper';
      var minusBtn = document.createElement('button');
      minusBtn.type = 'button';
      minusBtn.textContent = '−';
      minusBtn.addEventListener('click', function () { changeQty(entry.service.id, -1); });
      var qtyEl = document.createElement('span');
      qtyEl.className = 'qty';
      qtyEl.textContent = String(entry.qty);
      var plusBtn = document.createElement('button');
      plusBtn.type = 'button';
      plusBtn.textContent = '+';
      plusBtn.addEventListener('click', function () { changeQty(entry.service.id, 1); });
      stepper.appendChild(minusBtn);
      stepper.appendChild(qtyEl);
      stepper.appendChild(plusBtn);
      row.appendChild(stepper);

      var delBtn = document.createElement('button');
      delBtn.className = 'cart-delete';
      delBtn.type = 'button';
      delBtn.setAttribute('aria-label', 'Retirer');
      delBtn.innerHTML = '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
      delBtn.addEventListener('click', function () { removeFromCart(entry.service.id); });
      row.appendChild(delBtn);

      cartItemsEl.appendChild(row);
    });
    cartSubtotalEl.style.display = 'flex';
    cartSubtotalValueEl.textContent = formatFCFA(cartTotal());
    document.getElementById('cart-cta').disabled = false;
  }

  function changeQty(id, delta) {
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    updateCartBadge();
    renderCartDrawer();
    renderGrid();
  }

  function removeFromCart(id) {
    delete cart[id];
    updateCartBadge();
    renderCartDrawer();
    renderGrid();
  }

  document.getElementById('cart-cta').addEventListener('click', function () {
    if (cartEntries().length === 0) return;
    closeCartDrawer();
    proceedToBooking();
  });

  function proceedToBooking() {
    selectedDate = null;
    selectedTime = null;
    var summary = document.getElementById('booking-summary');
    summary.innerHTML = '';
    cartEntries().forEach(function (entry) {
      var line = document.createElement('div');
      line.className = 'line';
      line.innerHTML = '<span>' + entry.qty + '× ' + entry.service.name + '</span><span>' + formatFCFA(entry.qty * entry.service.price) + '</span>';
      summary.appendChild(line);
    });
    var totalLine = document.createElement('div');
    totalLine.className = 'line total';
    totalLine.innerHTML = '<span>Total indicatif</span><span>' + formatFCFA(cartTotal()) + '</span>';
    summary.appendChild(totalLine);

    renderDateStrip();
    slotGridEl.innerHTML = '<div class="slot-empty">Choisissez une date</div>';
    updateSubmitState();
    showStep('step-booking');
  }

  document.getElementById('back-to-catalog').addEventListener('click', function () { showStep('step-catalog'); });

  var DOW = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  function renderDateStrip() {
    dateStripEl.innerHTML = '';
    var today = new Date();
    for (var i = 0; i < 14; i++) {
      var d = new Date(today);
      d.setDate(d.getDate() + i);
      var iso = d.toISOString().split('T')[0];
      var chip = document.createElement('div');
      chip.className = 'date-chip';
      chip.innerHTML = '<div class="dow">' + DOW[d.getDay()] + '</div><div class="num">' + d.getDate() + '</div>';
      chip.addEventListener('click', function (isoVal, el) {
        return function () {
          selectedDate = isoVal;
          selectedTime = null;
          document.querySelectorAll('.date-chip').forEach(function (c) { c.classList.remove('active'); });
          el.classList.add('active');
          loadSlots();
          updateSubmitState();
        };
      }(iso, chip));
      dateStripEl.appendChild(chip);
    }
  }

  function loadSlots() {
    slotGridEl.innerHTML = '<div class="slot-empty">Chargement…</div>';
    fetch('/api/public/slots?date=' + selectedDate + '&service_count=' + cartCount())
      .then(function (res) { return res.json(); })
      .then(function (data) {
        var slots = data.slots || [];
        if (slots.length === 0) {
          slotGridEl.innerHTML = '<div class="slot-empty">Aucun créneau ce jour, essayez une autre date.</div>';
          return;
        }
        slotGridEl.innerHTML = '';
        slots.forEach(function (t) {
          var btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'slot-btn';
          btn.textContent = t;
          btn.addEventListener('click', function () {
            selectedTime = t;
            document.querySelectorAll('.slot-btn').forEach(function (b) { b.classList.remove('active'); });
            btn.classList.add('active');
            updateSubmitState();
          });
          slotGridEl.appendChild(btn);
        });
      })
      .catch(function () {
        slotGridEl.innerHTML = '<div class="slot-empty">Erreur de chargement, réessayez.</div>';
      });
  }

  function updateSubmitState() {
    var nameOk = document.getElementById('client-name').value.trim().length > 0;
    var phoneOk = document.getElementById('client-phone').value.trim().length > 0;
    submitBtn.disabled = !(selectedDate && selectedTime && nameOk && phoneOk);
  }

  document.getElementById('client-name').addEventListener('input', updateSubmitState);
  document.getElementById('client-phone').addEventListener('input', updateSubmitState);

  submitBtn.addEventListener('click', function () {
    submitBtn.disabled = true;
    errorEl.style.display = 'none';
    var name = document.getElementById('client-name').value.trim();
    var phone = document.getElementById('client-phone').value.trim();
    var note = document.getElementById('note').value.trim();

    var serviceIds = [];
    cartEntries().forEach(function (entry) {
      for (var i = 0; i < entry.qty; i++) serviceIds.push(entry.service.id);
    });

    fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientName: name,
        clientPhone: phone,
        clientId: clientId,
        serviceIds: serviceIds,
        date: selectedDate,
        time: selectedTime,
        note: note || null
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('request failed');
        return res.json();
      })
      .then(function () {
        var d = new Date(selectedDate + 'T00:00:00');
        var dateLabel = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
        var namesLabel = cartEntries().map(function (e) { return e.qty + '× ' + e.service.name; }).join('<br>');
        document.getElementById('recap').innerHTML =
          '<strong>' + namesLabel + '</strong><br>' + dateLabel + ' à ' + selectedTime;
        if (WA_PHONE) {
          var namesText = cartEntries().map(function (e) { return e.qty + 'x ' + e.service.name; }).join(', ');
          var msg = 'Bonjour, je viens de faire une demande de rendez-vous pour : ' + namesText +
            ' le ' + dateLabel + ' à ' + selectedTime + '. Merci de me confirmer.';
          var waBtn = document.getElementById('wa-confirm-btn');
          waBtn.href = 'https://wa.me/' + WA_PHONE.replace(/[^0-9]/g, '') + '?text=' + encodeURIComponent(msg);
          waBtn.style.display = 'block';
        }
        cart = {};
        updateCartBadge();
        showStep('step-thanks');
      })
      .catch(function () {
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
      });
  });
</script>
</body>
</html>
"""

RDV_PAGE_HTML = _TEMPLATE.replace("__WA_PHONE__", settings.institute_whatsapp_phone or "")
