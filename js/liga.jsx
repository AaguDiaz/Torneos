// liga.jsx — Standings + Fixtures

const T_LIGA = {
  es: {
    standings: 'Tabla de Posiciones', fixtures: 'Jornadas',
    pos: '#', team: 'Equipo', pj: 'PJ', g: 'G', e: 'E', p: 'P',
    gf: 'GF', gc: 'GC', dg: 'DG', pts: 'Pts', forma: 'Forma',
    round: 'Jornada', played: 'Jugados', pending: 'Pendientes',
    allDone: '¡Torneo finalizado!', enterResult: 'Ingresar resultado',
    champion: '🏆 Campeón', newTour: 'Nuevo torneo', vs: 'vs',
    playMatch: '▶ Jugar', played2: 'Jugado',
    single: 'Solo ida', double: 'Ida y vuelta',
  },
  en: {
    standings: 'Standings', fixtures: 'Fixtures',
    pos: '#', team: 'Team', pj: 'PJ', g: 'W', e: 'D', p: 'L',
    gf: 'GF', gc: 'GA', dg: 'GD', pts: 'Pts', forma: 'Form',
    round: 'Round', played: 'Played', pending: 'Pending',
    allDone: 'Tournament finished!', enterResult: 'Enter result',
    champion: '🏆 Champion', newTour: 'New tournament', vs: 'vs',
    playMatch: '▶ Play', played2: 'Played',
    single: 'Single', double: 'Home & Away',
  }
};

const FORMA_COLOR = { W: '#1e6b2e', D: '#8b6200', L: '#6b1e1e' };
const FORMA_TEXT  = { W: 'G', D: 'E', L: 'P' };

function FormaRow({ forma }) {
  return (
    <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
      {forma.slice(-5).map((f, i) => (
        <div key={i} style={{
          width: 14, height: 14, borderRadius: 2,
          background: FORMA_COLOR[f] || '#2a2a2a',
          color: '#fff', fontSize: 8, fontWeight: 'bold',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>{FORMA_TEXT[f] || f}</div>
      ))}
    </div>
  );
}

function LigaScreen({ tournament, lang, onResult, onReset, badgeMap }) {
  const tx = T_LIGA[lang] || T_LIGA.es;
  const { teams, liga, tourName } = tournament;
  const { matches, roundType } = liga;

  const [modal, setModal] = React.useState(null);
  const [tab, setTab] = React.useState('standings');
  const [selectedRound, setSelectedRound] = React.useState(null);

  const standings = TU.calcStandings(teams, matches);
  const allRounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);
  const playedCount = matches.filter(m => m.played).length;
  const totalCount = matches.length;
  const allDone = playedCount === totalCount;

  const nextInfo = TU.getNextLigaRound(matches);
  const activeRound = selectedRound ?? nextInfo?.round ?? allRounds[allRounds.length - 1];
  const roundMatches = matches.filter(m => m.round === activeRound);
  const champion = allDone ? standings[0]?.team : null;

  function handlePlayMatch(m) {
    setModal({ match: m });
  }

  function handleConfirm(hs, as_) {
    const newMatches = TU.applyLigaResult(matches, modal.match.id, hs, as_);
    setModal(null);
    onResult(newMatches);
  }

  const S = ligaStyles;

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topBar} className="top-bar">
        <button style={S.resetBtn} onClick={onReset}>← {lang === 'en' ? 'New' : 'Nuevo'}</button>
        <span style={S.tourTitle} className="top-bar-title">{tourName || (lang === 'en' ? 'League Tournament' : 'Torneo Liga')}</span>
        <span style={S.roundTag}>{roundType === 'double' ? tx.double : tx.single}</span>
      </div>

      {/* Progress bar */}
      <div style={S.progressBar}>
        <div style={{ ...S.progressFill, width: `${totalCount > 0 ? (playedCount / totalCount) * 100 : 0}%` }} />
      </div>
      <div style={S.progressLabel}>
        {playedCount}/{totalCount} {lang === 'en' ? 'matches played' : 'partidos jugados'}
        {champion && <span style={{ color: '#c8a800', marginLeft: 10 }}>🏆 {champion}</span>}
      </div>

      {/* Tabs */}
      <div style={S.tabs}>
        <button style={tab === 'standings' ? S.tabActive : S.tab} onClick={() => setTab('standings')}>{tx.standings}</button>
        <button style={tab === 'fixtures' ? S.tabActive : S.tab} onClick={() => setTab('fixtures')}>{tx.fixtures}</button>
      </div>

      <div style={S.content}>
        {/* STANDINGS */}
        {tab === 'standings' && (
          <div style={S.tableWrapper}>
            <table className="liga-table" style={S.table}>
              <thead>
                <tr>
                  {[tx.pos, tx.team, tx.pj, tx.g, tx.e, tx.p, tx.gf, tx.gc, tx.dg, tx.pts].map(h => (
                    <th key={h} style={{ ...S.th, textAlign: h === tx.team ? 'left' : 'center' }}>{h}</th>
                  ))}
                  <th className="forma-col" style={S.th}>{tx.forma}</th>
                </tr>
              </thead>
              <tbody>
                {standings.map((row, i) => {
                  const dg = row.gf - row.gc;
                  const isChamp = champion && i === 0;
                  return (
                    <tr key={row.team} style={{ background: isChamp ? '#e8f5e8' : i % 2 === 0 ? '#ffffff' : '#eef5ee' }}>
                      <td style={{ ...S.td, background: 'inherit', color: i === 0 ? '#c8a800' : i < 3 ? '#2a8a3a' : i < 6 ? '#4a7acc' : '#333', textAlign: 'center', fontWeight: 'bold' }}>{i + 1}</td>
                      <td style={{ ...S.td, background: 'inherit', color: '#111', textAlign: 'left', fontWeight: isChamp ? 'bold' : 'normal', maxWidth: 120 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, overflow: 'hidden' }}>
                          {isChamp && <span>🏆</span>}
                          {badgeMap && badgeMap[row.team] && <img src={badgeMap[row.team]} style={{ width: 16, height: 16, objectFit: 'contain', flexShrink: 0 }} alt="" onError={e => { e.target.style.display = 'none'; }} />}
                          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.team}</span>
                        </div>
                      </td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#222' }}>{row.pj}</td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#1a7a2a', fontWeight: 'bold' }}>{row.g}</td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#222' }}>{row.e}</td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#cc2222', fontWeight: 'bold' }}>{row.p}</td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#222' }}>{row.gf}</td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#222' }}>{row.gc}</td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: dg > 0 ? '#1a7a2a' : dg < 0 ? '#cc2222' : '#555' }}>
                        {dg > 0 ? `+${dg}` : dg}
                      </td>
                      <td style={{ ...S.td, background: 'inherit', textAlign: 'center', color: '#c8a800', fontWeight: 'bold', fontSize: 14 }}>{row.pts}</td>
                      <td className="forma-col" style={{ ...S.td, background: 'inherit', textAlign: 'center' }}><FormaRow forma={row.forma} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* FIXTURES */}
        {tab === 'fixtures' && (
          <div>
            <div className="round-selector" style={S.roundSelector}>
              {allRounds.map(r => {
                const rMatches = matches.filter(m => m.round === r);
                const rDone = rMatches.every(m => m.played);
                const rActive = r === activeRound;
                return (
                  <button key={r}
                    style={rActive ? S.roundBtnActive : rDone ? S.roundBtnDone : S.roundBtn}
                    onClick={() => setSelectedRound(r)}>
                    {tx.round} {r}
                  </button>
                );
              })}
            </div>

            <div style={S.matchList}>
              <div style={S.matchListHeader}>{tx.round} {activeRound}</div>
              {roundMatches.map(m => (
                <div key={m.id} className="match-row" style={S.matchRow}>
                  <div className="match-team" style={{ ...S.matchTeam, textAlign: 'right', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 4 }}>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.home}</span>
                    {badgeMap && badgeMap[m.home] && <img src={badgeMap[m.home]} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} alt="" onError={e => { e.target.style.display = 'none'; }} />}
                  </div>
                  {m.played
                    ? <span className="match-score-cell" style={S.matchScore}>{m.homeScore} – {m.awayScore}</span>
                    : <button style={S.playBtn} onClick={() => handlePlayMatch(m)}>{tx.playMatch}</button>
                  }
                  <div className="match-team" style={{ ...S.matchTeam, textAlign: 'left', display: 'flex', alignItems: 'center', gap: 4 }}>
                    {badgeMap && badgeMap[m.away] && <img src={badgeMap[m.away]} style={{ width: 18, height: 18, objectFit: 'contain', flexShrink: 0 }} alt="" onError={e => { e.target.style.display = 'none'; }} />}
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.away}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {modal && (
        <ResultModal
          match={modal.match}
          context="liga"
          lang={lang}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

const ligaStyles = {
  page: { minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' },
  topBar: { background: '#081a0e', borderBottom: '2px solid #c8a800', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10 },
  resetBtn: { background: 'none', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '4px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 },
  tourTitle: { color: '#c8a800', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  roundTag: { color: '#7ab87a', fontSize: 11, border: '1px solid #2a6b3a', borderRadius: 2, padding: '2px 6px', whiteSpace: 'nowrap', flexShrink: 0 },
  progressBar: { height: 3, background: '#1a4d25' },
  progressFill: { height: '100%', background: '#c8a800', transition: 'width 0.4s' },
  progressLabel: { color: '#7ab87a', fontSize: 11, padding: '4px 16px', background: '#081a0e', borderBottom: '1px solid #1a4d25' },
  tabs: { display: 'flex', background: '#081a0e', borderBottom: '1px solid #1a4d25' },
  tab: { flex: 1, background: 'none', border: 'none', color: '#7ab87a', padding: '9px', fontSize: 13, cursor: 'pointer', borderBottom: '2px solid transparent' },
  tabActive: { flex: 1, background: 'none', border: 'none', color: '#c8a800', padding: '9px', fontSize: 13, cursor: 'pointer', borderBottom: '2px solid #c8a800', fontWeight: 'bold' },
  content: { flex: 1, overflowY: 'auto' },
  tableWrapper: { overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: 420 },
  th: { background: '#0f3a18', color: '#fff', padding: '6px 8px', fontSize: 11, fontWeight: 'bold', border: '1px solid #c8ddc8', textTransform: 'uppercase' },
  td: { padding: '5px 8px', fontSize: 12, color: '#222', border: '1px solid #c8ddc8' },
  roundSelector: { display: 'flex', flexWrap: 'wrap', gap: 4, padding: '10px 12px', background: '#081a0e', borderBottom: '1px solid #1a4d25' },
  roundBtn: { background: '#0a2010', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '4px 8px', fontSize: 11, cursor: 'pointer', borderRadius: 2 },
  roundBtnActive: { background: '#1e6b2e', border: '1px solid #c8a800', color: '#fff', padding: '4px 8px', fontSize: 11, cursor: 'pointer', borderRadius: 2, fontWeight: 'bold' },
  roundBtnDone: { background: '#081a0e', border: '1px solid #1a4d25', color: '#3a6a3a', padding: '4px 8px', fontSize: 11, cursor: 'pointer', borderRadius: 2 },
  matchList: { padding: '0 12px 12px' },
  matchListHeader: { color: '#c8a800', fontWeight: 'bold', fontSize: 13, padding: '10px 0 6px', borderBottom: '1px solid #1a4d25', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  matchRow: { display: 'flex', alignItems: 'center', gap: 8, padding: '7px 10px', background: '#081a0e', border: '1px solid #0f2d18', borderRadius: 2, marginBottom: 4 },
  matchTeam: { flex: 1, color: '#fff', fontSize: 13, fontWeight: 'bold', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  matchScore: { color: '#c8a800', fontWeight: 'bold', fontSize: 15, minWidth: 50, textAlign: 'center', flexShrink: 0 },
  playBtn: { background: '#1e6b2e', border: 'none', color: '#fff', padding: '4px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 2, minWidth: 60, flexShrink: 0 },
};

window.LigaScreen = LigaScreen;
