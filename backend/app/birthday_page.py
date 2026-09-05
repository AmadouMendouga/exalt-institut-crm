_TEMPLATE = """<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Anniversaire - Exalt Institut</title>
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
    padding: 16px 16px 60px;
    background: var(--bg-page);
    color: var(--text-primary);
    font-family: 'Montserrat', sans-serif;
  }
  .wrap { max-width: 460px; margin: 40px auto 0; }
  h1.brand {
    font-family: 'Kalam', cursive;
    font-size: 1.9rem;
    color: var(--accent-dark);
    text-align: center;
    margin: 0;
  }
  p.eyebrow {
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent-dark);
    text-align: center;
    margin: 4px 0 20px;
  }
  .card {
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 28px 24px 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  }
  h2.headline {
    font-family: 'Kalam', cursive;
    font-size: 1.4rem;
    color: var(--text-primary);
    text-align: center;
    margin: 0 0 8px;
  }
  p.lede {
    color: var(--text-muted);
    font-size: 0.85rem;
    text-align: center;
    margin: 0 0 24px;
    line-height: 1.5;
  }
  label.field-label {
    display: block; font-size: 0.7rem; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.03em; color: var(--text-muted); margin: 16px 0 8px;
  }
  input, select {
    width: 100%;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 11px 12px;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--text-primary);
    background: var(--bg-page);
  }
  input:focus, select:focus, button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  .date-row { display: flex; gap: 10px; }
  .date-row select { flex: 1; min-width: 0; }
  .error {
    color: #b3261e;
    font-size: 0.85rem;
    margin-top: 10px;
    display: none;
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
  .step { display: none; }
  .step.active { display: block; }
  .thanks { text-align: center; }
  .thanks .icon { margin-bottom: 8px; color: var(--accent); }
  .thanks h2 { font-family: 'Kalam', cursive; font-size: 1.4rem; color: var(--accent-dark); margin: 0 0 8px; }
  .thanks p { color: var(--text-muted); font-size: 0.9rem; margin: 0; }
</style>
</head>
<body>
<div class="wrap">
  <h1 class="brand">Exalt Institut</h1>
  <p class="eyebrow">Beauté &amp; bien-être</p>

  <div class="card">
    <div class="step active" id="step-form">
      <h2 class="headline">On aimerait fêter votre anniversaire comme il se doit</h2>
      <p class="lede">Laissez-nous votre date de naissance : nous ne manquerons pas l'occasion de vous réserver une petite attention le jour venu.</p>

      <label class="field-label">Prénom et nom</label>
      <input type="text" id="name" placeholder="Ex. Salma Bennani" autocomplete="name" />

      <label class="field-label">Téléphone</label>
      <input type="tel" id="phone" placeholder="Ex. 06 12 34 56 78" autocomplete="tel" />

      <label class="field-label">Date de naissance (jour et mois)</label>
      <div class="date-row">
        <select id="day">
          <option value="" disabled selected>Jour</option>
        </select>
        <select id="month">
          <option value="" disabled selected>Mois</option>
          <option value="01">Janvier</option><option value="02">Février</option><option value="03">Mars</option>
          <option value="04">Avril</option><option value="05">Mai</option><option value="06">Juin</option>
          <option value="07">Juillet</option><option value="08">Août</option><option value="09">Septembre</option>
          <option value="10">Octobre</option><option value="11">Novembre</option><option value="12">Décembre</option>
        </select>
      </div>

      <div class="error" id="error">Merci de renseigner votre nom, votre téléphone et votre date de naissance.</div>
      <button class="submit" id="submit">Confirmer ma date</button>
    </div>

    <div class="step thanks" id="step-thanks">
      <div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></svg></div>
      <h2>C'est noté, merci !</h2>
      <p>Votre date est bien enregistrée. Nous serons ravis de vous gâter le moment venu.</p>
    </div>
  </div>
</div>

<script>
  var dayEl = document.getElementById('day');
  for (var d = 1; d <= 31; d++) {
    var opt = document.createElement('option');
    opt.value = String(d).padStart(2, '0');
    opt.textContent = String(d);
    dayEl.appendChild(opt);
  }

  function showStep(id) {
    document.querySelectorAll('.step').forEach(function (el) { el.classList.remove('active'); });
    document.getElementById(id).classList.add('active');
  }

  document.getElementById('submit').addEventListener('click', function () {
    var submitBtn = this;
    var errorEl = document.getElementById('error');
    errorEl.style.display = 'none';

    var name = document.getElementById('name').value.trim();
    var phone = document.getElementById('phone').value.trim();
    var day = document.getElementById('day').value;
    var month = document.getElementById('month').value;

    if (!name || !phone || !day || !month) {
      errorEl.style.display = 'block';
      return;
    }

    submitBtn.disabled = true;
    fetch('/api/birthday-submissions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name, phone: phone, birthDate: month + '-' + day })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('request failed');
        return res.json();
      })
      .then(function () { showStep('step-thanks'); })
      .catch(function () {
        errorEl.textContent = 'Une erreur est survenue, réessayez.';
        errorEl.style.display = 'block';
        submitBtn.disabled = false;
      });
  });
</script>
</body>
</html>
"""

BIRTHDAY_PAGE_HTML = _TEMPLATE
