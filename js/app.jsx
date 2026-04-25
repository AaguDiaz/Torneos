// app.jsx — Main app with state management, localStorage, and history

const STORAGE_KEY = 'torneos_v1';
const HISTORY_KEY = 'torneos_history_v1';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function saveState(state) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function pushToHistory(screen, lang, tournament) {
  if (!tournament) return;

  const hasActivity = tournament.format === 'copa'
    ? tournament.copa?.rounds?.some(r => r.matches.some(m => m.played && !m.isBye))
    : tournament.format === 'liga'
    ? tournament.liga?.matches?.some(m => m.played)
    : tournament.magico?.groups?.A?.matches?.some(m => m.played);
  if (!hasActivity) return;

  const champion = tournament.format === 'copa'
    ? tournament.copa?.champion || null
    : tournament.format === 'liga'
    ? (() => {
        const matches = tournament.liga?.matches || [];
        return matches.every(m => m.played)
          ? TU.calcStandings(tournament.teams, matches)[0]?.team || null
          : null;
      })()
    : tournament.magico?.champion || null;

  const entry = {
    id: Math.random().toString(36).slice(2, 11),
    savedAt: new Date().toISOString(),
    tourName: tournament.tourName || '',
    format: tournament.format,
    cupType: tournament.cupType || null,
    teams: tournament.teams,
    champion,
    state: { screen, lang, tournament },
  };

  const history = loadHistory();
  const updated = [...history, entry].slice(-30);
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(updated)); } catch {}
}

function App() {
  const [screen, setScreen] = React.useState('setup');
  const [lang, setLang] = React.useState('es');
  const [tournament, setTournament] = React.useState(null);

  React.useEffect(() => {
    const saved = loadState();
    if (saved) {
      setScreen(saved.screen || 'setup');
      setLang(saved.lang || 'es');
      setTournament(saved.tournament || null);
    }
  }, []);

  React.useEffect(() => {
    saveState({ screen, lang, tournament });
  }, [screen, lang, tournament]);

  function handleGenerate({ format, cupType, copaOpt, roundType, teams, tourName, teamBadges }) {
    let copa = null;
    let liga = null;
    let magico = null;

    if (format === 'copa') {
      const rounds = copaOpt === 'byes'
        ? TU.generateCopaByes(teams, lang)
        : TU.generateCopaTriangular(teams, lang).rounds;
      const triData = copaOpt === 'triangular'
        ? TU.generateCopaTriangular(teams, lang).triangular
        : null;
      copa = { rounds, triangular: triData, champion: null };
    } else if (format === 'liga') {
      const matches = TU.generateLiga(teams, roundType === 'double');
      liga = { matches, roundType };
    } else if (format === 'magico') {
      magico = TU.generateMagico(teams);
    }

    const newTournament = { format, cupType, copaOpt, roundType, teams, tourName, copa, liga, magico, teamBadges: teamBadges || [] };
    setTournament(newTournament);
    setScreen(format);
  }

  function handleCopaResult(newCopa) {
    setTournament(prev => ({ ...prev, copa: newCopa }));
  }

  function handleLigaResult(newMatches) {
    setTournament(prev => ({ ...prev, liga: { ...prev.liga, matches: newMatches } }));
  }

  function handleMagicoResult(newMagico) {
    setTournament(prev => ({ ...prev, magico: newMagico }));
  }

  function handleReset() {
    if (tournament) {
      const hasActivity = tournament.format === 'copa'
        ? tournament.copa?.rounds?.some(r => r.matches.some(m => m.played && !m.isBye))
        : tournament.format === 'liga'
        ? tournament.liga?.matches?.some(m => m.played)
        : tournament.magico?.groups?.A?.matches?.some(m => m.played);

      if (hasActivity) {
        const msg = lang === 'en'
          ? 'Save this tournament to history before starting a new one?'
          : '¿Guardar este torneo en el historial antes de salir?';
        if (window.confirm(msg)) {
          pushToHistory(screen, lang, tournament);
        }
      }
    }
    setScreen('setup');
  }

  function handleRestoreFromHistory(restoredState) {
    setScreen(restoredState.screen);
    setLang(restoredState.lang);
    setTournament(restoredState.tournament);
  }

  function toggleLang() {
    setLang(prev => prev === 'es' ? 'en' : 'es');
  }

  const badgeMap = React.useMemo(() => {
    if (!tournament?.teams) return {};
    return (tournament.teams).reduce((m, t, i) => {
      const b = tournament.teamBadges && tournament.teamBadges[i];
      if (b) m[t] = b;
      return m;
    }, {});
  }, [tournament]);

  const langBtn = (
    <button
      onClick={toggleLang}
      style={{
        position: 'fixed', top: 8, right: 12, zIndex: 999,
        background: '#081a0e', border: '1px solid #c8a800',
        color: '#c8a800', padding: '3px 10px', fontSize: 12,
        cursor: 'pointer', borderRadius: 2, fontWeight: 'bold',
      }}
    >{lang === 'es' ? 'EN' : 'ES'}</button>
  );

  return (
    <>
      {langBtn}
      {screen === 'setup' && (
        <SetupScreen
          lang={lang}
          onGenerate={handleGenerate}
          onHistory={() => setScreen('history')}
        />
      )}
      {screen === 'copa' && tournament && (
        <CopaScreen
          tournament={tournament}
          lang={lang}
          onResult={handleCopaResult}
          onReset={handleReset}
          badgeMap={badgeMap}
        />
      )}
      {screen === 'liga' && tournament && (
        <LigaScreen
          tournament={tournament}
          lang={lang}
          onResult={handleLigaResult}
          onReset={handleReset}
          badgeMap={badgeMap}
        />
      )}
      {screen === 'magico' && tournament && (
        <MagicoScreen
          tournament={tournament}
          lang={lang}
          onResult={handleMagicoResult}
          onReset={handleReset}
          badgeMap={badgeMap}
        />
      )}
      {screen === 'history' && (
        <HistoryScreen
          lang={lang}
          onRestore={handleRestoreFromHistory}
          onBack={() => setScreen('setup')}
        />
      )}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
