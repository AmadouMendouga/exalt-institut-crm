REVIEW_PAGE_HTML = """<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Votre avis - Exalt Institut</title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Kalam:wght@400;700&family=Montserrat:wght@400;500;600;700&display=swap" rel="stylesheet" />
<style>
  :root {
    --bg-page: #fbf6f2;
    --surface: #ffffff;
    --border-color: #d9c9be;
    --text-primary: #231f20;
    --text-muted: #78716c;
    --accent: #cc7457;
    --accent-dark: #90503b;
    --star-off: #e5d9d1;
  }
  @media (prefers-color-scheme: dark) {
    :root {
      --bg-page: #1c1917;
      --surface: #292524;
      --border-color: #44403c;
      --text-primary: #f5f0ec;
      --text-muted: #a8a29e;
      --accent: #e0916f;
      --accent-dark: #f0b79c;
      --star-off: #44403c;
    }
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    background: var(--bg-page);
    color: var(--text-primary);
    font-family: 'Montserrat', sans-serif;
  }
  .card {
    width: 100%;
    max-width: 420px;
    background: var(--surface);
    border: 1px solid var(--border-color);
    border-radius: 20px;
    padding: 32px 24px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0,0,0,0.08);
  }
  h1 {
    font-family: 'Kalam', cursive;
    font-size: 1.9rem;
    color: var(--accent-dark);
    margin: 0 0 4px;
  }
  p.subtitle {
    color: var(--text-muted);
    font-size: 0.9rem;
    margin: 0 0 24px;
  }
  .stars {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 20px;
  }
  .star {
    font-size: 2.4rem;
    line-height: 1;
    cursor: pointer;
    color: var(--star-off);
    transition: transform 0.1s ease, color 0.15s ease;
    user-select: none;
  }
  .star:active { transform: scale(0.9); }
  .star.active { color: var(--accent); }
  textarea {
    width: 100%;
    min-height: 90px;
    resize: vertical;
    border: 1px solid var(--border-color);
    border-radius: 12px;
    padding: 12px;
    font-family: inherit;
    font-size: 0.9rem;
    color: var(--text-primary);
    background: var(--bg-page);
    margin-bottom: 16px;
  }
  textarea:focus, button:focus-visible {
    outline: 2px solid var(--accent);
    outline-offset: 2px;
  }
  button.submit {
    width: 100%;
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
    margin-bottom: 12px;
    display: none;
  }
  .thanks { display: none; }
  .thanks .icon { margin-bottom: 8px; color: var(--accent); }
  .thanks h1 { margin-bottom: 8px; }
</style>
</head>
<body>
  <div class="card" id="form-card">
    <h1>Exalt Institut</h1>
    <p class="subtitle">Votre avis compte pour nous, merci de prendre un instant !</p>
    <div class="stars" id="stars">
      <span class="star" data-value="1">&#9733;</span>
      <span class="star" data-value="2">&#9733;</span>
      <span class="star" data-value="3">&#9733;</span>
      <span class="star" data-value="4">&#9733;</span>
      <span class="star" data-value="5">&#9733;</span>
    </div>
    <textarea id="comment" placeholder="Un commentaire à ajouter ?"></textarea>
    <div class="error" id="error">Une erreur est survenue, réessayez.</div>
    <button class="submit" id="submit" disabled>Envoyer mon avis</button>
  </div>
  <div class="card thanks" id="thanks-card">
    <div class="icon"><svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m22 4-10 10-3-3"/></svg></div>
    <h1>Merci !</h1>
    <p class="subtitle">Votre avis a bien été envoyé à l'équipe Exalt.</p>
  </div>
<script>
  var rating = 0;
  var stars = document.querySelectorAll('.star');
  var submitBtn = document.getElementById('submit');
  var errorEl = document.getElementById('error');

  function paint(value) {
    stars.forEach(function (star) {
      star.classList.toggle('active', Number(star.dataset.value) <= value);
    });
  }

  stars.forEach(function (star) {
    star.addEventListener('click', function () {
      rating = Number(star.dataset.value);
      paint(rating);
      submitBtn.disabled = false;
    });
  });

  submitBtn.addEventListener('click', function () {
    if (!rating) return;
    submitBtn.disabled = true;
    errorEl.style.display = 'none';
    fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        rating: rating,
        comment: document.getElementById('comment').value || null,
        clientId: new URLSearchParams(window.location.search).get('client')
      })
    })
      .then(function (res) {
        if (!res.ok) throw new Error('request failed');
        document.getElementById('form-card').style.display = 'none';
        document.getElementById('thanks-card').style.display = 'block';
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
