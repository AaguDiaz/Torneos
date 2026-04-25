// setup.jsx — Tournament setup screen

const T_SETUP = {
  es: {
    title: 'Nuevo Torneo', format: 'Formato', copa: 'Copa', liga: 'Liga', magico: '✨ PES Mágico',
    cupType: 'Tipo de Copa', teams: 'Participantes', numTeams: 'Cantidad',
    teamName: 'Equipo', names: 'Nombres de equipos', copaOpt: 'Clasificación (equipos no potencia de 2)',
    byes: 'Byes aleatorios', triangular: 'Fase especial (triangular)',
    byesDesc: 'Algunos equipos avanzan sin jugar en 1ª ronda.',
    triDesc: 'Los equipos sobrantes disputan un mini grupo/triangular.',
    roundType: 'Partidos', single: 'Solo ida', double: 'Ida y vuelta',
    generate: 'Generar torneo', fillAll: 'Completá todos los nombres de equipos.',
    tourName: 'Nombre del torneo (opcional)',
    history: '📋 Historial',
    magicoDesc: '6 jugadores · 2 grupos · Upper/Lower bracket · Gran Final',
  },
  en: {
    title: 'New Tournament', format: 'Format', copa: 'Cup', liga: 'League', magico: '✨ PES Magic',
    cupType: 'Cup Type', teams: 'Participants', numTeams: 'Count',
    teamName: 'Team', names: 'Team names', copaOpt: 'Bracket option (non-power-of-2 teams)',
    byes: 'Random byes', triangular: 'Special phase (triangular)',
    byesDesc: 'Some teams advance without playing in round 1.',
    triDesc: 'Remaining teams play a mini round-robin group.',
    roundType: 'Matches', single: 'Single round', double: 'Home & Away',
    generate: 'Generate tournament', fillAll: 'Please fill all team names.',
    tourName: 'Tournament name (optional)',
    history: '📋 History',
    magicoDesc: '6 players · 2 groups · Upper/Lower bracket · Grand Final',
  }
};

function SetupScreen({ lang, onGenerate, onHistory }) {
  const tx = T_SETUP[lang] || T_SETUP.es;
  const [format, setFormat] = React.useState('copa');
  const [cupType, setCupType] = React.useState('libertadores');
  const [numTeams, setNumTeams] = React.useState(8);
  const [copaOpt, setCopaOpt] = React.useState('byes');
  const [roundType, setRoundType] = React.useState('single');
  const [teamNames, setTeamNames] = React.useState(Array(8).fill(''));
  const [teamBadges, setTeamBadges] = React.useState(Array(8).fill(null));
  const [tourName, setTourName] = React.useState('');
  const [error, setError] = React.useState('');
  const [pickerIdx, setPickerIdx] = React.useState(null);

  function handleNumTeams(n) {
    setNumTeams(n);
    setTeamNames(prev => {
      const next = [...prev];
      while (next.length < n) next.push('');
      return next.slice(0, n);
    });
    setTeamBadges(prev => {
      const next = [...prev];
      while (next.length < n) next.push(null);
      return next.slice(0, n);
    });
  }

  function handleFormat(f) {
    setFormat(f);
    if (f === 'magico') handleNumTeams(6);
  }

  function handleName(i, v) {
    setTeamNames(prev => prev.map((x, j) => j === i ? v : x));
  }

  function handleBadgeSelect(i, name, badge) {
    setTeamNames(prev => prev.map((x, j) => j === i ? (x.trim() ? x : name) : x));
    setTeamBadges(prev => prev.map((x, j) => j === i ? badge : x));
  }

  function handleClearBadge(i) {
    setTeamBadges(prev => prev.map((x, j) => j === i ? null : x));
  }

  function handleGenerate() {
    const filled = teamNames.filter(n => n.trim());
    if (filled.length < numTeams) { setError(tx.fillAll); return; }
    setError('');
    onGenerate({
      format,
      cupType: format === 'copa' ? cupType : null,
      copaOpt: format === 'copa' ? copaOpt : null,
      roundType: format === 'liga' ? roundType : null,
      teams: teamNames.map(n => n.trim()),
      tourName: tourName.trim(),
      teamBadges,
    });
  }

  // For magico, numTeams label shows fixed 6
  const displayNumTeams = format === 'magico' ? 6 : numTeams;

  const S = setupStyles;

  return (
    <div style={S.page}>
      <div style={S.card}>
        {/* Header */}
        <div style={S.header}>
          <span style={S.logo}>⚽ {tx.title}</span>
          <button style={S.histBtn} onClick={onHistory}>{tx.history}</button>
        </div>

        {/* Tournament name */}
        <div style={S.section}>
          <label style={S.label}>{tx.tourName}</label>
          <input
            style={S.input}
            value={tourName}
            onChange={e => setTourName(e.target.value)}
            placeholder={lang === 'en' ? 'e.g. Summer Cup 2025' : 'ej. Copa Verano 2025'}
          />
        </div>

        {/* Format */}
        <div style={S.section}>
          <label style={S.label}>{tx.format}</label>
          <div style={S.btnRow}>
            <button style={format === 'copa' ? S.btnActive : S.btn} onClick={() => handleFormat('copa')}>🏆 {tx.copa}</button>
            <button style={format === 'liga' ? S.btnActive : S.btn} onClick={() => handleFormat('liga')}>📊 {tx.liga}</button>
            <button style={format === 'magico' ? S.btnActive : S.btn} onClick={() => handleFormat('magico')}>{tx.magico}</button>
          </div>
          {format === 'magico' && <div style={{ color: '#7ab87a', fontSize: 11, marginTop: 6 }}>{tx.magicoDesc}</div>}
        </div>

        {/* Copa-specific */}
        {format === 'copa' && format !== 'magico' && (
          <>
            <div style={S.section}>
              <label style={S.label}>{tx.cupType}</label>
              <div style={S.btnRow}>
                {[['libertadores','🏆 Libertadores'],['champions','🏆 Champions'],['mundial','🌍 Mundial']].map(([v,l]) => (
                  <button key={v} style={cupType === v ? S.btnActive : S.btn} onClick={() => setCupType(v)}>{l}</button>
                ))}
              </div>
            </div>
            <div style={S.section}>
              <label style={S.label}>{tx.copaOpt}</label>
              <div style={S.optionRow} onClick={() => setCopaOpt('byes')}>
                <div style={S.radio(copaOpt === 'byes')} />
                <div>
                  <div style={S.optLabel}>{tx.byes}</div>
                  <div style={S.optDesc}>{tx.byesDesc}</div>
                </div>
              </div>
              <div style={S.optionRow} onClick={() => setCopaOpt('triangular')}>
                <div style={S.radio(copaOpt === 'triangular')} />
                <div>
                  <div style={S.optLabel}>{tx.triangular}</div>
                  <div style={S.optDesc}>{tx.triDesc}</div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Liga-specific */}
        {format === 'liga' && (
          <div style={S.section}>
            <label style={S.label}>{tx.roundType}</label>
            <div style={S.btnRow}>
              <button style={roundType === 'single' ? S.btnActive : S.btn} onClick={() => setRoundType('single')}>{tx.single}</button>
              <button style={roundType === 'double' ? S.btnActive : S.btn} onClick={() => setRoundType('double')}>{tx.double}</button>
            </div>
          </div>
        )}

        {/* Num teams — hidden for magico (fixed at 6) */}
        {format !== 'magico' && (
          <div style={S.section}>
            <label style={S.label}>{tx.numTeams}</label>
            <div style={S.btnRow}>
              {[4,5,6,7,8,9,10,12,14,16].map(n => (
                <button key={n} style={numTeams === n ? S.btnNumActive : S.btnNum} onClick={() => handleNumTeams(n)}>{n}</button>
              ))}
            </div>
          </div>
        )}

        {/* Team names */}
        <div style={S.section}>
          <label style={S.label}>{tx.names}</label>
          <div className="names-grid" style={S.namesGrid}>
            {teamNames.map((name, i) => (
              <div key={i} style={S.nameRow}>
                <span style={S.nameIdx}>{i + 1}</span>
                {teamBadges[i]
                  ? (
                    <div style={S.badgeThumbWrap} onClick={() => handleClearBadge(i)} title="Quitar escudo">
                      <img src={teamBadges[i]} style={S.badgeThumb} alt="" />
                      <span style={S.badgeThumbX}>✕</span>
                    </div>
                  )
                  : (
                    <button style={S.shieldBtn} onClick={() => setPickerIdx(i)} title="Elegir escudo">🛡️</button>
                  )
                }
                <input
                  style={S.input}
                  value={name}
                  onChange={e => handleName(i, e.target.value)}
                  placeholder={`${tx.teamName} ${i + 1}`}
                />
              </div>
            ))}
          </div>
        </div>

        {pickerIdx !== null && (
          <BadgePicker
            onSelect={(name, badge) => handleBadgeSelect(pickerIdx, name, badge)}
            onClose={() => setPickerIdx(null)}
          />
        )}

        {error && <div style={S.error}>{error}</div>}

        <button style={S.generateBtn} onClick={handleGenerate}>
          {tx.generate} →
        </button>
      </div>
    </div>
  );
}

const setupStyles = {
  page: { minHeight: '100vh', background: 'transparent', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '20px 10px' },
  card: { background: '#0f2d18', border: '2px solid #1e6b2e', borderRadius: 4, width: '100%', maxWidth: 540, overflow: 'hidden' },
  header: { background: '#081a0e', padding: '12px 18px', borderBottom: '2px solid #c8a800', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#c8a800', fontWeight: 'bold', fontSize: 20, letterSpacing: 1 },
  histBtn: { background: '#0f2d18', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '4px 10px', fontSize: 11, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap' },
  section: { padding: '10px 18px', borderBottom: '1px solid #1a4d25' },
  label: { display: 'block', color: '#a0c8a0', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6 },
  input: { width: '100%', background: '#081a0e', border: '1px solid #2a6b3a', color: '#fff', padding: '6px 10px', fontSize: 14, borderRadius: 2, outline: 'none', boxSizing: 'border-box' },
  btnRow: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  btn: { background: '#081a0e', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '6px 14px', fontSize: 13, cursor: 'pointer', borderRadius: 2 },
  btnActive: { background: '#c8a800', border: '1px solid #c8a800', color: '#000', padding: '6px 14px', fontSize: 13, cursor: 'pointer', borderRadius: 2, fontWeight: 'bold' },
  btnNum: { background: '#081a0e', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '5px 10px', fontSize: 13, cursor: 'pointer', borderRadius: 2, minWidth: 36 },
  btnNumActive: { background: '#1e6b2e', border: '1px solid #c8a800', color: '#fff', padding: '5px 10px', fontSize: 13, cursor: 'pointer', borderRadius: 2, minWidth: 36, fontWeight: 'bold' },
  optionRow: { display: 'flex', gap: 10, alignItems: 'flex-start', cursor: 'pointer', padding: '6px 0' },
  radio: active => ({ width: 14, height: 14, borderRadius: '50%', border: `2px solid ${active ? '#c8a800' : '#2a6b3a'}`, background: active ? '#c8a800' : 'transparent', marginTop: 2, flexShrink: 0 }),
  optLabel: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  optDesc: { color: '#7ab87a', fontSize: 11, marginTop: 2 },
  namesGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 },
  nameRow: { display: 'flex', alignItems: 'center', gap: 6 },
  nameIdx: { color: '#c8a800', fontSize: 12, fontWeight: 'bold', width: 18, textAlign: 'right', flexShrink: 0 },
  shieldBtn: { background: '#081a0e', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '0 5px', fontSize: 14, cursor: 'pointer', borderRadius: 2, flexShrink: 0, lineHeight: '26px', height: 28 },
  badgeThumbWrap: { position: 'relative', width: 28, height: 28, flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  badgeThumb: { width: 24, height: 24, objectFit: 'contain', display: 'block' },
  badgeThumbX: { position: 'absolute', top: -4, right: -4, background: '#6b1e1e', color: '#fff', fontSize: 8, borderRadius: '50%', width: 12, height: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  error: { color: '#ff6060', fontSize: 12, padding: '8px 18px', background: '#2a0000' },
  generateBtn: { display: 'block', width: '100%', background: '#1e6b2e', border: 'none', color: '#fff', padding: '14px', fontSize: 16, fontWeight: 'bold', cursor: 'pointer', letterSpacing: 1, borderTop: '2px solid #c8a800' },
};

window.SetupScreen = SetupScreen;
