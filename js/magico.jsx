// magico.jsx — PES MÁGICO tournament screen

const T_MAGICO = {
  es: {
    title: 'PES MÁGICO', reset: 'Nuevo Torneo',
    groupA: 'GRUPO A', groupB: 'GRUPO B',
    pos: '#', pts: 'Pts', pg: 'PG', pe: 'PE', pp: 'PP',
    playoffs: '⚔️ PLAYOFFS',
    upperFinal: 'UPPER FINAL',
    upperFinalNote: 'Ganador → Gran Final · Perdedor → Lower vs Upper',
    lowerSemis: 'LOWER — SEMIFINALES',
    lowerFinal: 'LOWER — FINAL',
    lowerVsUpper: 'LOWER vs UPPER',
    lowerVsUpperNote: 'Ganador → Gran Final',
    grandFinal: '🏆 GRAN FINAL',
    champion: '🏆 CAMPEÓN',
    statsTitle: 'ESTADÍSTICAS GENERALES',
    player: 'Jugador', pj: 'PJ', pgS: 'PG', ppS: 'PP', gf: 'GF', gc: 'GC', wr: 'WR%',
    play: '▶ Jugar', pen: 'pen', tbd: 'TBD',
    groupsDone: '✓ Fase de grupos completa — playoffs desbloqueados',
  },
  en: {
    title: 'PES MAGIC', reset: 'New Tournament',
    groupA: 'GROUP A', groupB: 'GROUP B',
    pos: '#', pts: 'Pts', pg: 'W', pe: 'D', pp: 'L',
    playoffs: '⚔️ PLAYOFFS',
    upperFinal: 'UPPER FINAL',
    upperFinalNote: 'Winner → Grand Final · Loser → Lower vs Upper',
    lowerSemis: 'LOWER — SEMIS',
    lowerFinal: 'LOWER — FINAL',
    lowerVsUpper: 'LOWER vs UPPER',
    lowerVsUpperNote: 'Winner → Grand Final',
    grandFinal: '🏆 GRAND FINAL',
    champion: '🏆 CHAMPION',
    statsTitle: 'OVERALL STATISTICS',
    player: 'Player', pj: 'GP', pgS: 'W', ppS: 'L', gf: 'GF', gc: 'GA', wr: 'WR%',
    play: '▶ Play', pen: 'pen', tbd: 'TBD',
    groupsDone: '✓ Group stage complete — playoffs unlocked',
  }
};

// ── Confetti ──────────────────────────────────────────────────────────────────
function MagicoConfetti() {
  React.useEffect(() => {
    if (!document.getElementById('magico-confetti-css')) {
      const style = document.createElement('style');
      style.id = 'magico-confetti-css';
      style.textContent = `
        @keyframes mcfall { 0%{transform:translateY(-30px) rotate(0deg);opacity:1} 85%{opacity:1} 100%{transform:translateY(108vh) rotate(680deg);opacity:0} }
        @keyframes mcfall-r { 0%{transform:translateY(-30px) rotate(0deg);opacity:1} 85%{opacity:1} 100%{transform:translateY(108vh) rotate(-680deg);opacity:0} }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const pieces = React.useMemo(() => {
    const colors = ['#c8a800','#ffffff','#1e9e3e','#ff6060','#60c8ff','#ff8c00','#e040fb','#40e0d0'];
    return Array.from({ length: 110 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 4.5,
      dur: 2.5 + Math.random() * 3,
      w: 6 + Math.random() * 10,
      h: 5 + Math.random() * 12,
      anim: Math.random() > 0.5 ? 'mcfall' : 'mcfall-r',
      br: Math.random() > 0.5 ? '50%' : '2px',
    }));
  }, []);

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 800, overflow: 'hidden' }}>
      {pieces.map(p => (
        <div key={p.id} style={{
          position: 'absolute', left: p.left + '%', top: -30,
          width: p.w, height: p.h,
          background: p.color, borderRadius: p.br,
          animationName: p.anim,
          animationDuration: p.dur + 's',
          animationDelay: p.delay + 's',
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
        }} />
      ))}
    </div>
  );
}

// ── Match card (shared for groups + playoffs) ────────────────────────────────
function MagicoMatchCard({ match, label, note, onPlay, lang, badgeMap, isPlayoff }) {
  const tx = T_MAGICO[lang] || T_MAGICO.es;
  if (!match) return null;
  const canPlay = match.home && match.away && !match.played;
  const isPlayed = match.played;
  const S = magicoStyles;

  function TeamName({ name, isWinner }) {
    const badge = badgeMap && name && badgeMap[name];
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', flexWrap: 'wrap' }}>
        {badge && <img src={badge} style={{ width: 18, height: 18, objectFit: 'contain' }} alt="" />}
        <span style={{ color: isWinner ? '#c8a800' : (name ? '#fff' : '#4a7a4a'), fontWeight: isWinner ? 'bold' : 'normal', fontSize: 13 }}>
          {name || tx.tbd}
        </span>
      </div>
    );
  }

  return (
    <div style={{ ...S.matchCard, ...(isPlayed ? S.matchCardPlayed : canPlay ? S.matchCardReady : {}) }}>
      {label && <div style={S.matchLabel}>{label}</div>}
      {note && <div style={S.matchNote}>{note}</div>}
      <div style={S.matchRow}>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <TeamName name={match.home} isWinner={isPlayed && match.winner === match.home} />
        </div>
        <div style={S.scoreCell}>
          {isPlayed
            ? <><span style={S.scoreText}>{match.homeScore}</span><span style={S.scoreSep}>-</span><span style={S.scoreText}>{match.awayScore}</span></>
            : <span style={{ color: '#4a7a4a', fontSize: 12 }}>vs</span>
          }
          {isPlayed && match.penalties && <div style={S.penTag}>{tx.pen}</div>}
        </div>
        <div style={{ flex: 1, textAlign: 'center' }}>
          <TeamName name={match.away} isWinner={isPlayed && match.winner === match.away} />
        </div>
      </div>
      {isPlayed && match.winner && (
        <div style={S.winnerBadge}>▲ {match.winner}</div>
      )}
      {canPlay && (
        <button style={S.playBtn} onClick={onPlay}>{tx.play}</button>
      )}
    </div>
  );
}

// ── Group standings mini-table ───────────────────────────────────────────────
function GroupStandings({ group, standings, tx, groupsDone }) {
  const posColors = ['#c8a800', '#7ab87a', '#c06060'];
  const posLabels = groupsDone ? ['↑ UF', '↑ LS', '↑ LS'] : ['1°', '2°', '3°'];
  return (
    <div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid #1a4d25' }}>
            <th style={{ color: '#7ab87a', padding: '3px 4px', textAlign: 'left', width: 22 }}>{tx.pos}</th>
            <th style={{ color: '#7ab87a', padding: '3px 4px', textAlign: 'left' }}>Equipo</th>
            <th style={{ color: '#7ab87a', padding: '3px 6px', textAlign: 'center' }}>{tx.pts}</th>
            <th style={{ color: '#7ab87a', padding: '3px 6px', textAlign: 'center' }}>{tx.pg}</th>
            <th style={{ color: '#7ab87a', padding: '3px 6px', textAlign: 'center' }}>{tx.pe}</th>
            <th style={{ color: '#7ab87a', padding: '3px 6px', textAlign: 'center' }}>{tx.pp}</th>
          </tr>
        </thead>
        <tbody>
          {standings.map((row, i) => (
            <tr key={row.team} style={{ borderBottom: '1px solid #0f2510', background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.15)' }}>
              <td style={{ padding: '3px 4px', color: posColors[i] || '#aaa', fontWeight: 'bold', textAlign: 'center', fontSize: 11 }}>{posLabels[i]}</td>
              <td style={{ padding: '3px 4px', color: '#fff', fontWeight: i === 0 ? 'bold' : 'normal' }}>{row.team}</td>
              <td style={{ padding: '3px 6px', color: '#c8a800', fontWeight: 'bold', textAlign: 'center' }}>{row.pts}</td>
              <td style={{ padding: '3px 6px', color: '#7ab87a', textAlign: 'center' }}>{row.pg}</td>
              <td style={{ padding: '3px 6px', color: '#aaa', textAlign: 'center' }}>{row.pe}</td>
              <td style={{ padding: '3px 6px', color: '#c06060', textAlign: 'center' }}>{row.pp}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Overall stats table ──────────────────────────────────────────────────────
function MagicoStatsTable({ magico, lang, badgeMap }) {
  const tx = T_MAGICO[lang] || T_MAGICO.es;
  const stats = TU.calcMagicoStats(magico);
  const lastIdx = stats.length - 1;
  return (
    <div style={magicoStyles.statsSection}>
      <div style={magicoStyles.sectionTitle}>{tx.statsTitle}</div>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
        <thead>
          <tr style={{ background: '#081a0e', borderBottom: '1px solid #c8a800' }}>
            {[tx.player, tx.pj, tx.pgS, tx.ppS, tx.gf, tx.gc, tx.wr].map((h, i) => (
              <th key={i} style={{ padding: '5px 6px', color: '#c8a800', fontWeight: 'bold', textAlign: i === 0 ? 'left' : 'center', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map((row, i) => {
            const isLast = i === lastIdx;
            return (
              <tr key={row.team} style={{
                borderBottom: '1px solid #0f2510',
                background: isLast ? 'rgba(180,30,30,0.18)' : i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.12)',
                outline: isLast ? '1px solid #c06060' : 'none',
              }}>
                <td style={{ padding: '5px 6px', display: 'flex', alignItems: 'center', gap: 5 }}>
                  {badgeMap && badgeMap[row.team] && <img src={badgeMap[row.team]} style={{ width: 16, height: 16, objectFit: 'contain' }} alt="" />}
                  <span style={{ color: isLast ? '#c06060' : '#fff', fontWeight: i === 0 ? 'bold' : 'normal' }}>{row.team}</span>
                  {isLast && <span style={{ color: '#c06060', fontSize: 10, marginLeft: 2 }}>↓</span>}
                </td>
                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#ccc' }}>{row.pj}</td>
                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#7ab87a', fontWeight: 'bold' }}>{row.pg}</td>
                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#c06060' }}>{row.pp}</td>
                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#ccc' }}>{row.gf}</td>
                <td style={{ padding: '5px 6px', textAlign: 'center', color: '#ccc' }}>{row.gc}</td>
                <td style={{ padding: '5px 6px', textAlign: 'center', color: isLast ? '#c06060' : '#c8a800', fontWeight: 'bold' }}>
                  {row.wr.toFixed(1)}%
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
function MagicoScreen({ tournament, lang, onResult, onReset, badgeMap }) {
  const tx = T_MAGICO[lang] || T_MAGICO.es;
  const [modal, setModal] = React.useState(null);
  const magico = tournament.magico;
  const S = magicoStyles;

  const groupsDone = magico.groups.A.matches.every(m => m.played) && magico.groups.B.matches.every(m => m.played);
  const standA = TU.calcMagicoGroupStandings(magico.groups.A);
  const standB = TU.calcMagicoGroupStandings(magico.groups.B);

  function openGroupMatch(group, matchIdx) {
    const match = magico.groups[group].matches[matchIdx];
    if (!match.played && match.home && match.away)
      setModal({ type: 'group', group, matchIdx, match, context: 'magico' });
  }

  function openPlayoffMatch(matchKey) {
    const match = magico[matchKey];
    if (match && !match.played && match.home && match.away)
      setModal({ type: 'playoff', matchKey, match, context: 'bracket' });
  }

  function handleConfirm(homeScore, awayScore, penWinner) {
    let newMagico;
    if (modal.type === 'group') {
      newMagico = TU.applyMagicoGroupResult(magico, modal.group, modal.matchIdx, homeScore, awayScore);
    } else {
      newMagico = TU.applyMagicoPlayoffResult(magico, modal.matchKey, homeScore, awayScore, penWinner);
    }
    onResult(newMagico);
    setModal(null);
  }

  const playoffKeys = ['upperFinal', 'lowerSemi1', 'lowerSemi2', 'lowerFinal', 'lowerVsUpper', 'grandFinal'];
  const anyPlayoffPlayed = playoffKeys.some(k => magico[k] && magico[k].played);
  const showPlayoffs = groupsDone;

  return (
    <div style={S.page}>
      {/* TOP BAR */}
      <div style={S.topBar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={S.topTitle}>{tx.title}</span>
          {tournament.tourName && <span style={S.topTourName}>{tournament.tourName}</span>}
        </div>
        <button style={S.resetBtn} onClick={onReset}>{tx.reset}</button>
      </div>

      {/* CHAMPION BANNER */}
      {magico.champion && (
        <div style={S.championBanner}>
          <span style={S.championText}>{tx.champion}</span>
          <span style={S.championName}>{magico.champion}</span>
        </div>
      )}
      {magico.champion && <MagicoConfetti />}

      <div style={S.content}>
        {/* GROUPS */}
        <div style={S.sectionBlock}>
          <div style={S.sectionTitle}>{groupsDone ? '✓ ' : ''}{lang === 'en' ? 'GROUP STAGE' : 'FASE DE GRUPOS'}</div>
          {groupsDone && <div style={S.groupsDoneNote}>{tx.groupsDone}</div>}
          <div className="magico-groups-grid" style={S.groupsGrid}>
            {/* Group A */}
            <div style={S.groupCard}>
              <div style={S.groupHeader}>{tx.groupA}</div>
              <GroupStandings group="A" standings={standA} tx={tx} groupsDone={groupsDone} />
              <div style={{ marginTop: 8 }}>
                {magico.groups.A.matches.map((m, i) => (
                  <MagicoMatchCard
                    key={m.id} match={m} lang={lang} badgeMap={badgeMap}
                    onPlay={() => openGroupMatch('A', i)}
                  />
                ))}
              </div>
            </div>
            {/* Group B */}
            <div style={S.groupCard}>
              <div style={S.groupHeader}>{tx.groupB}</div>
              <GroupStandings group="B" standings={standB} tx={tx} groupsDone={groupsDone} />
              <div style={{ marginTop: 8 }}>
                {magico.groups.B.matches.map((m, i) => (
                  <MagicoMatchCard
                    key={m.id} match={m} lang={lang} badgeMap={badgeMap}
                    onPlay={() => openGroupMatch('B', i)}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PLAYOFFS */}
        {showPlayoffs && (
          <div style={S.sectionBlock}>
            <div style={S.sectionTitle}>{tx.playoffs}</div>

            {/* Upper Final */}
            <div style={S.playoffRow}>
              <MagicoMatchCard
                match={magico.upperFinal}
                label={tx.upperFinal}
                note={tx.upperFinalNote}
                lang={lang} badgeMap={badgeMap} isPlayoff
                onPlay={() => openPlayoffMatch('upperFinal')}
              />
            </div>

            {/* Lower Semis */}
            <div style={S.playoffSemisLabel}>{tx.lowerSemis}</div>
            <div className="magico-playoff-semis" style={S.playoffSemisRow}>
              <MagicoMatchCard
                match={magico.lowerSemi1}
                label={lang === 'en' ? 'Semi 1' : 'Semi 1'}
                lang={lang} badgeMap={badgeMap} isPlayoff
                onPlay={() => openPlayoffMatch('lowerSemi1')}
              />
              <MagicoMatchCard
                match={magico.lowerSemi2}
                label={lang === 'en' ? 'Semi 2' : 'Semi 2'}
                lang={lang} badgeMap={badgeMap} isPlayoff
                onPlay={() => openPlayoffMatch('lowerSemi2')}
              />
            </div>

            {/* Lower Final */}
            {magico.lowerFinal && (
              <div style={S.playoffRow}>
                <MagicoMatchCard
                  match={magico.lowerFinal}
                  label={tx.lowerFinal}
                  lang={lang} badgeMap={badgeMap} isPlayoff
                  onPlay={() => openPlayoffMatch('lowerFinal')}
                />
              </div>
            )}

            {/* Lower vs Upper */}
            {magico.lowerVsUpper && (
              <div style={S.playoffRow}>
                <MagicoMatchCard
                  match={magico.lowerVsUpper}
                  label={tx.lowerVsUpper}
                  note={tx.lowerVsUpperNote}
                  lang={lang} badgeMap={badgeMap} isPlayoff
                  onPlay={() => openPlayoffMatch('lowerVsUpper')}
                />
              </div>
            )}

            {/* Grand Final */}
            {magico.grandFinal && (
              <div style={{ ...S.playoffRow, marginTop: 4 }}>
                <MagicoMatchCard
                  match={magico.grandFinal}
                  label={tx.grandFinal}
                  lang={lang} badgeMap={badgeMap} isPlayoff
                  onPlay={() => openPlayoffMatch('grandFinal')}
                />
              </div>
            )}
          </div>
        )}

        {/* STATS TABLE */}
        <MagicoStatsTable magico={magico} lang={lang} badgeMap={badgeMap} />
      </div>

      {/* RESULT MODAL */}
      {modal && (
        <ResultModal
          match={modal.match}
          context={modal.context}
          lang={lang}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const magicoStyles = {
  page: { minHeight: '100vh', background: 'transparent', display: 'flex', flexDirection: 'column' },
  topBar: { background: '#081a0e', borderBottom: '2px solid #c8a800', padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 },
  topTitle: { color: '#c8a800', fontWeight: 'bold', fontSize: 18, letterSpacing: 1 },
  topTourName: { color: '#7ab87a', fontSize: 13 },
  resetBtn: { background: '#0f2d18', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '5px 12px', fontSize: 12, cursor: 'pointer', borderRadius: 2 },
  championBanner: { background: 'linear-gradient(135deg,#1a3a00,#2a5200,#1a3a00)', border: '2px solid #c8a800', padding: '14px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 },
  championText: { color: '#c8a800', fontSize: 13, fontWeight: 'bold', letterSpacing: 2, textTransform: 'uppercase' },
  championName: { color: '#fff', fontSize: 28, fontWeight: 'bold', letterSpacing: 1 },
  content: { padding: '12px', display: 'flex', flexDirection: 'column', gap: 12 },
  sectionBlock: { background: '#0f2d18', border: '1px solid #2a6b3a', borderRadius: 4, overflow: 'hidden' },
  sectionTitle: { background: '#081a0e', padding: '8px 14px', color: '#c8a800', fontWeight: 'bold', fontSize: 12, letterSpacing: 1.5, textTransform: 'uppercase', borderBottom: '1px solid #2a6b3a' },
  groupsDoneNote: { padding: '5px 14px', background: '#0a2010', color: '#7ab87a', fontSize: 11, borderBottom: '1px solid #1a4d25' },
  groupsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 },
  groupCard: { padding: '10px 12px', borderRight: '1px solid #1a4d25' },
  groupHeader: { color: '#fff', fontWeight: 'bold', fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, paddingBottom: 5, borderBottom: '1px solid #2a6b3a' },
  matchCard: { background: '#081a0e', border: '1px solid #1a4d25', borderRadius: 3, padding: '6px 8px', marginBottom: 5 },
  matchCardPlayed: { border: '1px solid #2a6b3a', opacity: 0.85 },
  matchCardReady: { border: '1px solid #c8a800', background: '#0a1e0d' },
  matchLabel: { color: '#c8a800', fontSize: 10, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  matchNote: { color: '#7ab87a', fontSize: 10, marginBottom: 4 },
  matchRow: { display: 'flex', alignItems: 'center', gap: 6 },
  scoreCell: { display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 56 },
  scoreText: { color: '#c8a800', fontWeight: 'bold', fontSize: 17 },
  scoreSep: { color: '#7ab87a', fontWeight: 'bold', fontSize: 17, padding: '0 2px' },
  penTag: { color: '#c8a800', fontSize: 9, marginTop: 1 },
  winnerBadge: { textAlign: 'center', color: '#c8a800', fontSize: 10, fontWeight: 'bold', marginTop: 4 },
  playBtn: { display: 'block', width: '100%', background: '#1e6b2e', border: 'none', color: '#fff', padding: '5px 0', fontSize: 12, fontWeight: 'bold', cursor: 'pointer', borderRadius: 2, marginTop: 6 },
  playoffRow: { padding: '8px 12px' },
  playoffSemisLabel: { padding: '6px 14px 2px', color: '#7ab87a', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.5 },
  playoffSemisRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, padding: '4px 12px 8px' },
  statsSection: { background: '#0f2d18', border: '1px solid #2a6b3a', borderRadius: 4, overflow: 'hidden' },
};

window.MagicoScreen = MagicoScreen;
