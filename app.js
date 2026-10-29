(function () {
  const DATA = window.DATA;
  const RYM = new Set([1059010,1068793,1068806,1079394,1081175,1081179,1081180,1081214,1081252,1081496,1081973,1084359,1085799,1086534,1086685,1094730,1094925,1095466,1098765,1099088,1106177,1108192,1111241,1114589,1114631,1114987,1115758,1116362,1122192,1125255,1126954,1133572,1134057,1142494,1144000,1144552,1148377,1148541,1151263]);
  const ADO = 'https://dev.azure.com/unit4-global/U4TETA/_workitems/edit/';
  const byId = new Map(DATA.map(r => [r[0], r]));
  const epochOf = d => d < '2025-10-01' ? 1 : d < '2026-02-26' ? 2 : 3;
  const fmt = d => { const [y, m, dd] = d.split('-'); return `${dd}.${m}.${y}`; };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const link = id => `<a href="${ADO}${id}" target="_blank" rel="noopener">#${id}</a>`;

  const VIEWS = ['przeglad', 'epoki', 'poemat', 'slowniczek', 'gra', 'quiz', 'glosowanie', 'katalog'];
  function route() {
    const h = location.hash.replace('#', '');
    const v = VIEWS.includes(h) ? h : 'przeglad';
    VIEWS.forEach(id => { document.getElementById('v-' + id).hidden = id !== v; });
    document.querySelectorAll('.nav a').forEach(a => {
      const on = a.getAttribute('href') === '#' + v;
      a.classList.toggle('active', on);
      if (on) { a.setAttribute('aria-current', 'page'); document.getElementById('menuCur').textContent = a.textContent; } else a.removeAttribute('aria-current');
    });
    document.getElementById('fab').hidden = v !== 'przeglad';
    setMenu(false);
    window.scrollTo({ top: 0 });
  }

  const topBar = document.querySelector('.top'), menuBtn = document.getElementById('menuBtn');
  function setMenu(open) {
    topBar.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  menuBtn.onclick = e => { e.stopPropagation(); setMenu(!topBar.classList.contains('open')); };
  document.getElementById('nav').addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('click', e => { if (topBar.classList.contains('open') && !topBar.contains(e.target)) setMenu(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && topBar.classList.contains('open')) { setMenu(false); menuBtn.focus(); } });
  matchMedia('(min-width: 1061px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  window.addEventListener('hashchange', route);
  route();

  const themeBtn = document.getElementById('themeBtn');
  let stored = null;
  try { stored = localStorage.getItem('theme'); } catch (e) {}
  if (stored === 'dark' || stored === 'light') document.documentElement.dataset.theme = stored;
  themeBtn.onclick = () => {
    const cur = document.documentElement.dataset.theme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const next = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch (e) {}
  };

  document.getElementById('stRym').textContent = RYM.size;
  [1, 2, 3].forEach(e => { document.getElementById('c' + e).textContent = DATA.filter(r => epochOf(r[1]) === e).length + ' bugów'; });

  document.querySelectorAll('ol.anth').forEach(ol => {
    ol.innerHTML = ol.dataset.ids.split(',').map(id => byId.get(+id)).filter(Boolean).map(r =>
      `<li><div class="t">${esc(r[4])}</div><div class="m">${link(r[0])}<span>${fmt(r[1])}</span><span>${esc(r[2])}</span></div></li>`).join('');
  });

  const POEM = [[1068793, 1068806, 1081932, 1081973], [1084359, 1106177, 1099088, 1116362], [1114589, 1114631, 1115758, 1133572], [1134057, 1140369, 1144000, 1154737]];
  document.getElementById('poem').innerHTML = POEM.map(st => `<div class="stanza">${st.map(id => `<p class="v">${esc(byId.get(id)[4])}<a class="n" href="${ADO}${id}" target="_blank" rel="noopener">${id}</a></p>`).join('')}</div>`).join('');

  const months = [];
  for (let y = 2025, m = 1; !(y === 2026 && m > 10); m++) { if (m > 12) { m = 1; y++; } months.push(`${y}-${String(m).padStart(2, '0')}`); }
  const perMonth = months.map(k => ({ k, n: DATA.filter(r => r[1].startsWith(k)).length }));
  (function chart() {
    const W = 520, H = 170, padL = 28, padB = 24, padT = 10, gap = 2;
    const max = Math.max(...perMonth.map(d => d.n));
    const bw = (W - padL) / perMonth.length;
    const y = n => padT + (H - padT - padB) * (1 - n / max);
    const ticks = [0, 20, 40];
    let s = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Liczba bugów na miesiąc, od stycznia 2025 do października 2026">`;
    ticks.forEach(t => { s += `<line class="grid" x1="${padL}" x2="${W}" y1="${y(t)}" y2="${y(t)}"/><text class="axis" x="${padL - 6}" y="${y(t) + 4}" text-anchor="end">${t}</text>`; });
    perMonth.forEach((d, i) => {
      const x = padL + i * bw + gap / 2, w = bw - gap, top = y(d.n), h = H - padB - top;
      if (d.n > 0) s += `<path class="bar" data-i="${i}" d="M${x},${H - padB} v${-(h - 4)} a4,4 0 0 1 4,-4 h${w - 8} a4,4 0 0 1 4,4 v${h - 4} z"/>`;
      s += `<rect class="hit" data-i="${i}" x="${padL + i * bw}" y="${padT}" width="${bw}" height="${H - padT - padB}"/>`;
      if (d.k.endsWith('-01') || d.k.endsWith('-07')) s += `<text class="axis" x="${x + w / 2}" y="${H - 7}" text-anchor="middle">${d.k.endsWith('-01') ? 'sty ' + d.k.slice(2, 4) : 'lip ' + d.k.slice(2, 4)}</text>`;
    });
    s += '</svg><div class="tip" id="tip" hidden></div>';
    const el = document.getElementById('chart');
    el.innerHTML = s;
    const tip = document.getElementById('tip');
    const names = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień'];
    el.querySelectorAll('.hit').forEach(r => {
      r.addEventListener('mouseenter', () => {
        const d = perMonth[+r.dataset.i];
        tip.textContent = `${names[+d.k.slice(5) - 1]} ${d.k.slice(0, 4)}: ${d.n}`;
        tip.hidden = false;
        const box = r.getBoundingClientRect(), host = el.getBoundingClientRect();
        tip.style.left = (box.left + box.width / 2 - host.left) + 'px';
        tip.style.top = (box.top - host.top + 16) + 'px';
        el.querySelectorAll('.bar').forEach(b => b.classList.toggle('on', b.dataset.i === r.dataset.i));
      });
      r.addEventListener('mouseleave', () => { tip.hidden = true; el.querySelectorAll('.bar').forEach(b => b.classList.remove('on')); });
    });
  })();

  const FEATURED = [951248, 962540, 976884, 1003490, 1004878, 1023226, 1026706, 1054818, 1055311, 1059010, 1062887, 1068793, 1068806, 1079394, 1081179, 1081252, 1084359, 1086685, 1092873, 1097639, 1098781, 1109917, 1114589, 1115758, 1116362, 1117953, 1120985, 1126954, 1133572, 1134057, 1137805, 1140369, 1142494, 1144000, 1148377, 1154737];
  function feature(id) {
    const r = byId.get(id);
    document.getElementById('featured').textContent = r[4];
    document.getElementById('featuredMeta').innerHTML = `${link(r[0])}<span>${fmt(r[1])}</span><span>${esc(r[2])}</span><span>${esc(r[3])}</span>`;
  }
  feature(FEATURED[(new Date().getDate() + new Date().getMonth()) % FEATURED.length]);
  document.getElementById('shuffleBtn').onclick = () => feature(FEATURED[Math.floor(Math.random() * FEATURED.length)]);

  const ROUNDS = [
    [1079394, 'Nie ma to jak dodawać Szablony', 'dodawanie przerw to proces szalony', ['przerwy zapisują się jak natchnione', 'a potem gridy ładują się zmęczone', 'każdy z nich jest trochę pokręcony']],
    [1068806, 'Spinner skradziony', 'stan ładowania nieodgadniony', ['użytkownik zdezorientowany', 'loader nigdy nie zatrzymany', 'czas oczekiwania nieskończony']],
    [1084359, 'Checkboxy tak checkboksują', 'że zawrót głowy powodują', ['że użytkownika denerwują', 'aż się same odznaczają', 'że testerzy już nie testują']],
    [1081252, 'Wydajność grida nowego', 'to coś strasznie niewydajnego', ['przypomina coś starego', 'nie ma w sobie nic dobrego', 'woła o coś zupełnie innego']],
    [1081179, 'Zbyt długie nazwisko jest tak długie', 'że nie mieści się wszystko', ['że ucina je na drugie', 'że trzeba scrollować długo', 'że kolumna płacze cicho']],
    [1115758, 'Guzior służący do zaawansowanego filtrowania', 'poczuł miętę do szczegółów pracownika pokazywania', ['nie ma już ochoty do filtrowania', 'wymaga natychmiastowego zresetowania', 'otwiera modal bez pytania']],
    [1114987, 'Błąd straszliwy zlokalizowany', 'rok w Terminie jest nigdzie nie widziany', ['formularz całkiem zdezorganizowany', 'deadline został przekroczony', 'datepicker zupełnie rozregulowany']],
    [1126954, 'Niemożność kodu lub nazwy wpisania', 'jest dziwnie nie do opisania', ['wymaga pilnego naprawiania', 'blokuje proces zatrudniania', 'to skutek walidacji przesadzania']],
    [1133572, "Casus w gridach MUI scorll'a", 'czyli każdy ma swojego mola', ['czyli scroll poszedł w pola', 'to dla testera smutna rola', 'czyli nic nie jedzie po torach']],
    [1134057, 'Nie wiem co się stało', 'no przecież działało', ['ale coś się zepsuło', 'chyba coś się zmieniło', 'wczoraj było cało']],
    [1144000, 'Suma rekordów wyliczona', 'ma być po wieki na dole przylepiona', ['jest zupełnie niewidoczna', 'bywa czasem niepoliczona', 'powinna być wyśrodkowana']],
    [1148377, 'Filtr liczbowy Od-Do nie kuma Do', 'no bo po co?', ['a Od tylko trochę', 'i wraca błąd 400', 'czyli połowę roboty']],
    [1154737, 'Zmiana języka działa wyśmienicie', 'ale tylko jeden raz', ['o ile nie odświeżysz', 'ale tylko po polsku', 'do pierwszego wylogowania']],
    [1148541, 'Wieczne grida ładowanie', 'gdy ustawione jest inne sortowanie', ['gdy brakuje paginowania', 'to codzienne doświadczanie', 'kończy się po odświeżaniu']],
  ];

  const QUESTIONS = [
    ['Ile bugów założył Dominik w projekcie U4TETA od stycznia 2025?', '432', ['187', '611', '1024'], 'Dokładnie 432, z czego 273 w 2026 roku i 159 w 2025.'],
    ['W którym obszarze założył najwięcej bugów?', 'Reports', ['Payroll', 'Civil contract', 'RCP'], 'Reports: 274 bugi. Dalej Payroll i Civil contract po 50, RCP 32, Framework 17.'],
    ['Który miesiąc był rekordowy?', 'sierpień 2026', ['lipiec 2026', 'maj 2026', 'styczeń 2026'], 'Sierpień 2026: 45 bugów, głównie dyżury i harmonogramy. Lipiec 2026 miał 38, maj 29.'],
    ['Którego dnia założył najwięcej bugów?', '5 października 2026', ['1 września 2026', '13 sierpnia 2026', '5 maja 2025'], '13 bugów jednego dnia, niemal wszystkie o BHP: badania, szkolenia, środki, zapotrzebowanie i „Karoteka wydań”.'],
    ['Jak brzmiał pierwszy rymowany tytuł, założony 4 lutego 2026?', 'Radio butony za bardzo ściśnięte, wcelowanie w nie jest niepojęte', ['Spinner skradziony, stan ładowania nieodgadniony', 'Dane ruchome, powody ruchów niewiadome', 'Nie ma to jak dodawać Szablony, dodawanie przerw to proces szalony'], 'Bug #1059010 w obszarze RCP. „Dane ruchome” i „Spinner skradziony” przyszły trzy tygodnie później, 26 lutego.'],
    ['W jaki dzień tygodnia Dominik zakładał bugi najczęściej?', 'poniedziałek', ['wtorek', 'czwartek', 'piątek'], 'Poniedziałek: 100 bugów. Wtorek 96, czwartek 88, środa 75, piątek 73.'],
    ['Ile bugów skończyło w stanie Removed?', '57', ['12', '131', '0'], '57 z 432, czyli 13%. 359 trafiło do Done, 16 jest jeszcze w toku.'],
    ['Które słowo pojawia się w tytułach najczęściej?', 'filtr', ['grid', 'modal', 'widok'], '„Filtr” w 46 tytułach, „akcja” w 33, „grid” w 29, „modal” i „widok” po 18.'],
    ['Co to jest „oczko z ciapkiem”?', 'ikona widoku z kropką sygnalizującą zmiany', ['emotikona w komentarzu do buga', 'checkbox w stanie półzaznaczenia', 'ikona podglądu hasła w formularzu logowania'], 'Bug #1098781: „Oczko z ciapkiem sygnalizujące zmianę w widoku, wyświetla się bez zmiany w widoku”.'],
    ['Który z tych prawdziwych tytułów jest najkrótszy w całym katalogu?', 'Zmiana nazwy', ['ajax error 404', 'Brak tłumaczeń', 'Bug placeholder'], '„Zmiana nazwy” ma 12 znaków. „ajax error 404” i „Brak tłumaczeń” po 14, „Bug placeholder” 15. Średni tytuł ma 51 znaków.'],
    ['Ile tytułów zaczyna się od prefiksu [WCAG]?', '13', ['4', '27', '40'], '13 bugów dostępnościowych, od kwietnia 2025 do stycznia 2026. Najdłuższy prefiksowy cykl w katalogu.'],
    ['Jak brzmi ostatni bug w katalogu, z 28 października 2026?', 'Zmiana języka działa wyśmienicie, ale tylko jeden raz', ['Raport Podstawy zasiłków się nie generuje', "Dla profilu udostępnianie powinno mieć Cloud'a filtrowanie", 'Filtr liczbowy Od-Do nie kuma Do, no bo po co?'], 'Bug #1154737. Pozostałe trzy też są prawdziwe, ale starsze: z 15 października, 19 października i 8 października.'],
    ['Który wniosek jest „tajemniczym przypadkiem”?', '00001/2023', ['00007/2024', '12345/2025', '00001/2026'], 'Bug #1117953 z 22 lipca 2026: „Tajemniczy przypadek wniosku 00001/2023”. Opis wyjaśnia, tytuł nie.'],
    ['Co według Dominika „jest NaN:NaN”?', 'liczba godzin we wniosku o UC', ['kwota netto na liście płac', 'wymiar etatu w kartotece', 'czas trwania dyżuru'], 'Bug #1146823 z 2 października 2026. Rok wcześniej NaN była też „Liczba w kroku dialogu” (#974943).'],
  ];

  function makeQuiz(box, items, build, verdicts, n) {
    let G;
    function start() { G = { order: shuffle(items.map((_, i) => i)).slice(0, n), i: 0, score: 0 }; render(); }
    function render() {
      if (G.i >= G.order.length) {
        const s = G.score, len = G.order.length;
        const v = verdicts.find(x => s >= x[0])[1];
        box.innerHTML = `<div class="final">Wynik: ${s} z ${len}</div><p class="verdict">${v}</p><div class="after"><button class="btn" type="button" data-again>Zagraj jeszcze raz</button></div>`;
        box.querySelector('[data-again]').onclick = start;
        return;
      }
      const it = build(items[G.order[G.i]]);
      const opts = shuffle([it.answer, ...it.fakes]);
      box.innerHTML = `<div class="score"><span>pytanie ${G.i + 1} / ${G.order.length}</span><span>punkty: ${G.score}</span></div>
        <div class="q${it.ellipsis ? ' ellipsis' : ''}">${esc(it.q)}</div>
        <div class="opts">${opts.map(o => `<button class="opt" type="button" data-v="${esc(o)}">${esc(o)}</button>`).join('')}</div>
        <div class="after" hidden></div>`;
      box.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.v === it.answer;
        if (ok) G.score++;
        box.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.v === it.answer) x.dataset.r = 'ok'; else if (x === b) x.dataset.r = 'bad'; });
        const after = box.querySelector('.after');
        after.hidden = false;
        after.innerHTML = `<p class="expl"><strong>${ok ? 'Tak.' : 'Nie.'}</strong> ${it.expl}</p><button class="btn" type="button" data-next>${G.i + 1 === G.order.length ? 'Zobacz wynik' : 'Dalej'}</button>`;
        const nx = after.querySelector('[data-next]');
        nx.onclick = () => { G.i++; render(); };
        nx.focus();
      });
    }
    start();
  }

  makeQuiz(document.getElementById('game'), ROUNDS, r => {
    const bug = byId.get(r[0]);
    return { q: r[1], answer: r[2], fakes: r[3], ellipsis: true, expl: `Oryginał: ${link(r[0])} <span class="mono muted">${fmt(bug[1])} · ${esc(bug[2])}</span>` };
  }, [
    [12, 'Komplet. Albo pracujesz z Dominikiem od początku, albo jesteś Dominikiem.'],
    [9, 'Bardzo dobrze. Czytasz backlog uważniej niż większość PO.'],
    [6, 'Solidnie. Rymy Dominika da się przewidzieć, ale nie wszystkie.'],
    [3, 'Słabo, ale w tych tytułach logika nie pomaga. Tu trzeba wiedzieć.'],
    [0, 'Jakby to ujął autor: Nie wiem co się stało, no przecież działało.'],
  ], 12);

  makeQuiz(document.getElementById('quizBox'), QUESTIONS, q => ({ q: q[0], answer: q[1], fakes: q[2], ellipsis: false, expl: q[3] }), [
    [12, 'Komplet. Ktoś tu siedział w tym backlogu dłużej, niż powinien.'],
    [9, 'Bardzo dobrze. Statystyki Dominika znasz lepiej niż Dominik.'],
    [6, 'Przyzwoicie. Połowa z tego to i tak zgadywanie, więc nieźle.'],
    [3, 'Słabo. Ale 1%, to nie 5%, jak mawia autor.'],
    [0, 'Bug zbiorczy. Zacznij od katalogu i wróć.'],
  ], 12);

  const q = document.getElementById('q'), fEp = document.getElementById('fEp'), fArea = document.getElementById('fArea'), fRym = document.getElementById('fRym');
  const cat = document.getElementById('cat'), cnt = document.getElementById('count'), moreBtn = document.getElementById('moreBtn');
  const areas = [...new Set(DATA.map(r => r[2]))].sort();
  fArea.innerHTML += areas.map(a => `<option value="${esc(a)}">${esc(a)}</option>`).join('');
  const PAGE = 100; let shown = PAGE;
  function matches() {
    const s = q.value.trim().toLowerCase(), e = fEp.value, ar = fArea.value, ry = fRym.checked;
    return DATA.filter(r => (!s || r[4].toLowerCase().includes(s) || String(r[0]).includes(s)) && (!e || epochOf(r[1]) === +e) && (!ar || r[2] === ar) && (!ry || RYM.has(r[0])));
  }
  function renderCat() {
    const m = matches();
    cnt.textContent = m.length === DATA.length ? `${m.length} tytułów` : `${m.length} z ${DATA.length}`;
    cat.innerHTML = m.slice(0, shown).map(r => `<tr><td class="id">${link(r[0])}</td><td class="date">${fmt(r[1])}</td><td class="area">${esc(r[2])}</td><td class="state">${esc(r[3])}</td><td class="tt${RYM.has(r[0]) ? ' rym' : ''}">${esc(r[4])}${RYM.has(r[0]) ? '<span class="tag">rym</span>' : ''}</td></tr>`).join('');
    moreBtn.hidden = m.length <= shown;
  }
  [q, fEp, fArea, fRym].forEach(x => x.addEventListener('input', () => { shown = PAGE; renderCat(); }));
  moreBtn.onclick = () => { shown += PAGE; renderCat(); };
  renderCat();

  const NOMINEES = FEATURED.concat([1054215, 1054549, 1064613, 1080415, 1081932, 1094925, 1106177, 1114987, 1126684, 1148054, 1148541, 1151263]);
  const voteList = document.getElementById('voteList'), voteStatus = document.getElementById('voteStatus'), voteNotice = document.getElementById('voteNotice'), voteQ = document.getElementById('voteQ'), voteHint = document.getElementById('voteHint');
  let voter = null;
  try { voter = localStorage.getItem('voter'); if (!voter) { voter = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36)); localStorage.setItem('voter', voter); } } catch (e) { voter = 'anon-' + Math.random().toString(36).slice(2, 12); }
  let V = { configured: null, counts: {}, mine: [], max: 3, busy: false };

  function localRead() {
    try { const s = JSON.parse(localStorage.getItem('votes-local') || '{}'); return { counts: s.counts || {}, mine: s.mine || [] }; } catch (e) { return { counts: {}, mine: [] }; }
  }
  function localWrite() { try { localStorage.setItem('votes-local', JSON.stringify({ counts: V.counts, mine: V.mine })); } catch (e) {} }

  async function api(method, body) {
    const r = await fetch('/api/votes' + (method === 'GET' ? '?voter=' + encodeURIComponent(voter) : ''), { method, headers: { 'Content-Type': 'application/json' }, body: body ? JSON.stringify(body) : undefined });
    const j = await r.json();
    if (r.status === 409) { showNotice(`Masz już ${V.max} głosy. Cofnij jeden, żeby zagłosować na inny tytuł.`); return null; }
    if (!r.ok) throw new Error(j.error || r.status);
    return j;
  }
  function showNotice(t) { voteNotice.textContent = t; voteNotice.hidden = !t; }

  async function loadVotes() {
    try {
      const j = await api('GET');
      if (j.configured) { V = { ...V, configured: true, counts: j.counts, mine: j.mine, max: j.max }; showNotice(''); }
      else { V = { ...V, configured: false, ...localRead() }; showNotice('Tryb lokalny: głosy zapisują się tylko w tej przeglądarce. Po podłączeniu Upstash Redis na Vercelu ranking będzie wspólny.'); }
    } catch (e) {
      V = { ...V, configured: false, ...localRead() };
      showNotice('Tryb lokalny: brak połączenia z serwerem głosów, zapisuję w tej przeglądarce.');
    }
    renderVotes();
  }

  async function toggleVote(id) {
    if (V.busy) return;
    const has = V.mine.includes(id);
    if (!has && V.mine.length >= V.max) { showNotice(`Masz już ${V.max} głosy. Cofnij jeden, żeby zagłosować na inny tytuł.`); return; }
    V.busy = true; renderVotes();
    try {
      if (V.configured) {
        const j = await api('POST', { id, voter });
        if (j) { V.counts = j.counts; V.mine = j.mine; showNotice(''); }
      } else {
        V.counts[id] = Math.max(0, (V.counts[id] || 0) + (has ? -1 : 1));
        V.mine = has ? V.mine.filter(x => x !== id) : V.mine.concat(id);
        localWrite();
      }
    } catch (e) {
      showNotice('Nie udało się zapisać głosu. Spróbuj ponownie.');
    }
    V.busy = false; renderVotes();
  }

  const podium = document.getElementById('podium'), board = document.getElementById('board'), boardMore = document.getElementById('boardMore'), votePips = document.getElementById('votePips');
  const BOARD_N = 7; let boardAll = false;
  const plGlos = n => n === 1 ? 'głos' : (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 12 || n % 100 > 14)) ? 'głosy' : 'głosów';
  const pct = (n, t) => t ? Math.round(n / t * 100) + '%' : '0%';

  function renderVotes() {
    const total = Object.values(V.counts).reduce((a, b) => a + Math.max(0, b), 0);
    const mine = new Set(V.mine);
    const dis = V.busy ? ' disabled' : '';
    const ranked = Object.entries(V.counts).map(([k, n]) => ({ id: +k, r: byId.get(+k), n })).filter(x => x.n > 0 && x.r)
      .sort((a, b) => b.n - a.n || b.r[1].localeCompare(a.r[1]) || b.id - a.id);
    ranked.forEach((x, i) => { x.place = i && x.n === ranked[i - 1].n ? ranked[i - 1].place : i + 1; });
    const placeOf = new Map(ranked.map(x => [x.id, x.place]));
    const lead = ranked.length ? ranked[0].n : 1;
    const mineTag = id => mine.has(id) ? '<span class="mine-tag">twój głos</span>' : '';
    const meta = r => `#${r[0]} · ${fmt(r[1])} · ${esc(r[2])}`;

    votePips.innerHTML = Array.from({ length: V.max }, (_, i) => `<i class="${i < V.mine.length ? 'on' : ''}"></i>`).join('');
    voteStatus.textContent = `${V.mine.length} z ${V.max} głosów · łącznie oddano ${total}`;

    const PLACE_NAME = ['', 'Złoto', 'Srebro', 'Brąz'];
    podium.innerHTML = [0, 1, 2].map(i => {
      const x = ranked[i];
      if (!x) return `<div class="pod p${i + 1} empty"><span class="medal">${i + 1}</span><span>${i === 0 ? 'Jeszcze nikt nie głosował. Pierwszy głos ustawia lidera.' : 'Miejsce czeka na kandydata'}</span></div>`;
      return `<button class="pod p${i + 1}${mine.has(x.id) ? ' mine' : ''}" type="button" data-id="${x.id}"${dis} aria-pressed="${mine.has(x.id)}" aria-label="${x.place}. miejsce, ${x.n} ${plGlos(x.n)}: ${esc(x.r[4])}">
        <span class="pod-head"><span class="medal">${x.place}</span><span class="pod-place">${PLACE_NAME[i + 1]}</span></span>
        <span class="tx"><span class="t">${esc(x.r[4])}${mineTag(x.id)}</span><span class="meta">${meta(x.r)}</span></span>
        <span class="ft"><span class="pod-score"><b>${x.n}</b><span>${plGlos(x.n)} · ${pct(x.n, total)}</span></span><span class="meter"><i style="width:${x.n / lead * 100}%"></i></span></span>
      </button>`;
    }).join('');

    const rest = ranked.slice(3), shownRest = boardAll ? rest : rest.slice(0, BOARD_N);
    board.innerHTML = shownRest.map(x => `<li><button class="row${mine.has(x.id) ? ' mine' : ''}" type="button" data-id="${x.id}"${dis} aria-pressed="${mine.has(x.id)}">
      <span class="bg" style="width:${x.n / lead * 100}%"></span>
      <span class="pl">${x.place}.</span>
      <span class="body"><span class="t">${esc(x.r[4])}${mineTag(x.id)}</span><span class="meta">${meta(x.r)}</span></span>
      <span class="sc"><b>${x.n}</b><span>${pct(x.n, total)}</span></span>
    </button></li>`).join('');
    boardMore.hidden = rest.length <= BOARD_N;
    boardMore.textContent = boardAll ? 'Zwiń ranking' : `Pokaż cały ranking (${ranked.length} tytułów)`;

    const s = voteQ.value.trim().toLowerCase();
    const rows = (s ? DATA.filter(r => r[4].toLowerCase().includes(s) || String(r[0]).includes(s)) : DATA).slice()
      .sort((a, b) => b[1].localeCompare(a[1]) || b[0] - a[0]);
    voteHint.textContent = s ? `${rows.length} z ${DATA.length}` : `${DATA.length} tytuły`;
    const EP_NAME = { 3: 'III. Okres rymowany', 2: 'II. Okres absencyjny i listowy', 1: 'I. Wczesny Komenda' };
    let lastGroup = null;
    voteList.innerHTML = rows.length ? rows.map(r => {
      const id = r[0], n = V.counts[id] || 0, g = EP_NAME[epochOf(r[1])];
      const head = g !== lastGroup ? `<li class="vote-group">${g}</li>` : ''; lastGroup = g;
      const chip = mine.has(id) ? `✓ ${n}` : n > 0 ? `${placeOf.get(id)}. miejsce · ${n}` : '+ głos';
      return head + `<li><button class="vote${mine.has(id) ? ' mine' : ''}" type="button" data-id="${id}"${dis} aria-pressed="${mine.has(id)}">
        <span class="body"><span class="t">${esc(r[4])}</span><span class="meta">${meta(r)}</span></span>
        <span class="chip${n > 0 ? ' has' : ''}">${chip}</span>
      </button></li>`;
    }).join('') : '<li class="vote-group">Nic nie pasuje do wyszukiwania</li>';
  }
  document.getElementById('v-glosowanie').addEventListener('click', e => { const b = e.target.closest('button[data-id]'); if (b && !b.disabled) toggleVote(+b.dataset.id); });
  boardMore.onclick = () => { boardAll = !boardAll; renderVotes(); };
  document.getElementById('voteRefresh').onclick = loadVotes;
  voteQ.addEventListener('input', renderVotes);
  loadVotes();
})();
