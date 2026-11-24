
let players = [];

const $ = s => document.querySelector(s);

const esc = s => String(s ?? '').replace(
  /[&<>"']/g,
  c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c])
);

function safeUrl(value) {
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol)
      ? url.href
      : '';
  } catch {
    return '';
  }
}

function photoUrl(value) {
  const url = safeUrl(value);

  if (!url) return '/red-foxes.png';

  const match = url.match(
    /drive\.google\.com\/(?:file\/d\/|open\?id=)([\w-]+)/
  );

  return match
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(match[1])}&sz=w900`
    : url;
}

function rosterPhoto(player) {
  return photoUrl(player.actionPhoto || player.photo);
}

function profilePhoto(player) {
  return photoUrl(player.photo || player.actionPhoto);
}

function fillSelect(id, field) {
  const select = $(id);
  const previous = select.value;

  select.querySelectorAll('option:not([value=""])')
    .forEach(option => option.remove());

  [...new Set(players.map(p => p[field]).filter(Boolean))]
    .sort()
    .forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    });

  select.value = previous;
}

function render() {
  const term = $('#search').value.trim().toLowerCase();
  const position = $('#position').value;
  const year = $('#year').value;

  const shown = players.filter(player =>
    (!term ||
      player.name.toLowerCase().includes(term) ||
      player.number.toLowerCase().includes(term)) &&
    (!position || player.position === position) &&
    (!year || player.year === year)
  );

  $('#count').textContent =
    `${shown.length} ATHLETE${shown.length === 1 ? '' : 'S'}`;

  $('#roster').innerHTML = shown.map(player => `
    <article class="player">
      <img
        src="${esc(rosterPhoto(player))}"
        onerror="this.onerror=null;this.src='/red-foxes.png'"
        alt="${esc(player.name)} action photograph"
      >

      <div class="info">
        <div class="num">
          ${player.number ? '#' + esc(player.number) + ' · ' : ''}
          ${esc(player.year ? 'CLASS OF ' + player.year : 'HARTSVILLE RED FOXES')}
        </div>

        <h3>${esc(player.name)}</h3>

        <div class="meta">
          ${esc(player.position || 'Position to be announced')}
          ${player.height ? ' · ' + esc(player.height) : ''}
        </div>

        <button data-id="${player.id}">
          VIEW PROFILE ↗
        </button>
      </div>
    </article>
  `).join('');

  $('#status').textContent = players.length
    ? (shown.length ? '' : 'No athletes match your filters.')
    : 'The recruiting roster is being prepared.';

  $('#roster').querySelectorAll('button').forEach(button =>
    button.addEventListener('click', () =>
      showProfile(
        players.find(p => p.id === Number(button.dataset.id))
      )
    )
  );
}

function stat(label, value) {
  if (!value) return '';

  return `
    <div class="stat">
      <small>${esc(label)}</small>
      <strong>${esc(value)}</strong>
    </div>
  `;
}

function section(title, stats) {
  const content = stats
    .map(([label, value]) => stat(label, value))
    .join('');

  if (!content) return '';

  return `
    <div class="profile-section">
      <h3>${esc(title)}</h3>
      <div class="stats">${content}</div>
    </div>
  `;
}

function showProfile(player) {
  if (!player) return;

  const personal = section('Player Information', [
    ['Position', player.position],
    ['Height', player.height],
    ['Weight', player.weight],
    ['Graduation Year', player.year]
  ]);

  const academics = section('Academics', [
    ['GPA', player.gpa],
    ['ACT', player.act]
  ]);

  const strength = section('Strength', [
    ['Bench Press', player.bench],
    ['Squat', player.squat],
    ['Power Clean', player.powerClean]
  ]);

  const testing = section('Athletic Testing', [
    ['40-Yard Dash', player.forty],
    ['Pro Shuttle', player.shuttle],
    ['Vertical Jump', player.vertical],
    ['Broad Jump', player.broad]
  ]);

  const hudl = safeUrl(player.hudl);

  $('#profile-body').innerHTML = `
    <div class="profile-header">
      <img
        src="${esc(profilePhoto(player))}"
        onerror="this.onerror=null;this.src='/red-foxes.png'"
        alt="${esc(player.name)} headshot"
      >

      <div>
        <div class="eyebrow">
          HARTSVILLE RED FOXES
          ${player.number ? ' · #' + esc(player.number) : ''}
        </div>

        <h2>${esc(player.name)}</h2>

        <p>${esc(player.position || 'Football student-athlete')}</p>
      </div>
    </div>

    ${personal}
    ${academics}
    ${strength}
    ${testing}

    ${player.accolades ? `
      <div class="profile-section">
        <h3>Accolades</h3>
        <p>${esc(player.accolades)}</p>
      </div>
    ` : ''}

    <div class="profile-section">
      <h3>Highlight Film</h3>

      ${hudl ? `
        <a class="hudl"
           href="${esc(hudl)}"
           target="_blank"
           rel="noopener noreferrer">
          ▶ WATCH HUDL HIGHLIGHTS
        </a>
      ` : '<p class="empty">Hudl highlights coming soon.</p>'}
    </div>
  `;

  $('#profile').showModal();
}

$('#close').onclick = () => $('#profile').close();

$('#profile').addEventListener('click', event => {
  if (event.target.id === 'profile') {
    event.target.close();
  }
});

['#search', '#position', '#year'].forEach(id =>
  $(id).addEventListener(
    id === '#search' ? 'input' : 'change',
    render
  )
);

async function load() {
  try {
    const response = await fetch('/api/players', {
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || 'Unable to load recruiting roster'
      );
    }

    players = Array.isArray(data.players)
      ? data.players
      : [];

    fillSelect('#position', 'position');
    fillSelect('#year', 'year');

    render();

  } catch (error) {
    $('#status').textContent =
      'Recruiting roster is not connected yet.';

    console.warn(error);
  }
}

load();

setInterval(load, 120000);
