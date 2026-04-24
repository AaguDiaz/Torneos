// copa.jsx — Bracket view

const T_COPA = {
  es: { champion: '¡CAMPEÓN!', triangular: 'Triangular', pending: 'Por definir', bye: 'BYE', nextMatch: 'Próximo partido', allPlayed: 'Todos los partidos jugados', pts:'Pts',pj:'PJ',g:'G',e:'E',p:'P' },
  en: { champion: 'CHAMPION!', triangular: 'Triangular', pending: 'TBD', bye: 'BYE', nextMatch: 'Next match', allPlayed: 'All matches played', pts:'Pts',pj:'PJ',g:'W',e:'D',p:'L' }
};

// ── MatchCard ─────────────────────────────────────────────────────────────
function MatchCard({ match, onClick, highlight, animateWinner }) {
  const [flash, setFlash] = React.useState(false);
  React.useEffect(() => {
    if (animateWinner && match.played) { setFlash(true); setTimeout(() => setFlash(false), 1200); }
  }, [animateWinner, match.played]);

  const canClick = !match.played && match.home && match.away && !match.isBye;
  const S = matchCardStyles;

  return (
    <div
      style={{
        ...S.card,
        borderColor: flash ? '#4dff70' : highlight ? '#c8a800' : '#2a6b3a',
        boxShadow: flash ? '0 0 12px #4dff70' : 'none',
        cursor: canClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.3s, border-color 0.3s',
      }}
      onClick={canClick ? onClick : undefined}
    >
      {[{ team: match.home, score: match.homeScore }, { team: match.away, score: match.awayScore }].map((slot, i) => {
        const isWinner = match.played && match.winner === slot.team;
        const isBye = match.isBye && !slot.team;
        return (
          <div key={i} style={{
            ...S.slot,
            background: isWinner ? '#1e6b2e' : '#081a0e',
            borderBottom: i === 0 ? '1px solid #1a4d25' : 'none',
            color: isBye ? '#3a6a3a' : isWinner ? '#fff' : slot.team ? '#ccc' : '#3a6a3a',
            fontWeight: isWinner ? 'bold' : 'normal',
          }}>
            <span style={S.teamName}>{isBye ? 'BYE' : slot.team || '—'}</span>
            {match.played && !match.isBye && (
              <span style={{ ...S.score, color: isWinner ? '#c8a800' : '#777' }}>
                {slot.score ?? ''}
                {match.penalties && match.winner === slot.team && <span style={{fontSize:9,marginLeft:2}}>(P)</span>}
              </span>
            )}
            {canClick && <span style={S.playIcon}>▶</span>}
          </div>
        );
      })}
    </div>
  );
}

const matchCardStyles = {
  card: { width: 130, border: '1.5px solid #2a6b3a', borderRadius: 2, overflow: 'hidden', background: '#0a2010', flexShrink: 0 },
  slot: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '5px 7px', fontSize: 12, minHeight: 26 },
  teamName: { overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 90 },
  score: { fontWeight: 'bold', fontSize: 13, flexShrink: 0, marginLeft: 4 },
  playIcon: { color: '#c8a800', fontSize: 9, marginLeft: 2, flexShrink: 0 },
};

// ── BracketSide ───────────────────────────────────────────────────────────
function BracketSide({ rounds, side, onMatchClick, lastWinner }) {
  const CARD_W = 130, CARD_H = 52, COL_GAP = 28, CELL_H = 64;
  if (!rounds || rounds.length === 0) return null;

  const numR1 = rounds[0].matches.length;
  const totalH = Math.max(CELL_H * numR1, CARD_H + 20);
  const numCols = rounds.length;
  const totalW = numCols * (CARD_W + COL_GAP);

  function matchY(rIdx, mIdx) {
    const step = CELL_H * Math.pow(2, rIdx);
    return step * mIdx + step / 2 - CARD_H / 2;
  }

  function matchX(rIdx) {
    return side === 'left'
      ? rIdx * (CARD_W + COL_GAP)
      : (numCols - 1 - rIdx) * (CARD_W + COL_GAP);
  }

  const paths = [];
  rounds.forEach((round, r) => {
    if (r >= rounds.length - 1) return;
    round.matches.forEach((_, i) => {
      const cx = side === 'left' ? matchX(r) + CARD_W : matchX(r);
      const cy = matchY(r, i) + CARD_H / 2;
      const nx = side === 'left' ? matchX(r + 1) : matchX(r + 1) + CARD_W;
      const ny = matchY(r + 1, Math.floor(i / 2)) + CARD_H / 2;
      const mx = (cx + nx) / 2;
      paths.push(`M${cx},${cy} H${mx} V${ny} H${nx}`);
    });
  });

  return (
    <div style={{ position: 'relative', width: totalW, height: totalH, flexShrink: 0 }}>
      <svg style={{ position: 'absolute', inset: 0, overflow: 'visible', pointerEvents: 'none' }} width={totalW} height={totalH}>
        {paths.map((d, i) => <path key={i} d={d} stroke="#c8a800" strokeWidth={1.5} fill="none" />)}
      </svg>
      {rounds.map((round, r) =>
        round.matches.map((match, i) => {
          const x = matchX(r), y = matchY(r, i);
          const isLast = lastWinner && match.winner === lastWinner;
          return (
            <div key={match.id || `${r}-${i}`} style={{ position: 'absolute', left: x, top: y }}>
              <MatchCard
                match={match}
                highlight={!match.played && match.home && match.away && !match.isBye}
                animateWinner={isLast}
                onClick={() => onMatchClick && onMatchClick(r, i)}
              />
            </div>
          );
        })
      )}
    </div>
  );
}

// ── FinalCard ─────────────────────────────────────────────────────────────
function FinalCard({ match, onMatchClick, lang, lastWinner }) {
  const tx = T_COPA[lang] || T_COPA.es;
  const [flash, setFlash] = React.useState(false);
  React.useEffect(() => {
    if (lastWinner && match && match.played) { setFlash(true); setTimeout(() => setFlash(false), 1400); }
  }, [lastWinner]);

  if (!match) return <div style={{ width: 150 }} />;
  const canClick = !match.played && match.home && match.away;
  const S = matchCardStyles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{ color: '#c8a800', fontSize: 10, fontWeight: 'bold', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 2 }}>
        {tx.nextMatch}
      </div>
      <div
        style={{
          ...S.card,
          width: 150,
          borderColor: flash ? '#4dff70' : '#c8a800',
          boxShadow: flash ? '0 0 18px #4dff70' : '0 0 6px rgba(200,168,0,0.3)',
          cursor: canClick ? 'pointer' : 'default',
          transition: 'box-shadow 0.4s',
        }}
        onClick={canClick ? onMatchClick : undefined}
      >
        {[{ team: match.home, score: match.homeScore }, { team: match.away, score: match.awayScore }].map((slot, i) => {
          const isWinner = match.played && match.winner === slot.team;
          return (
            <div key={i} style={{
              ...S.slot,
              background: isWinner ? '#1e6b2e' : '#081a0e',
              borderBottom: i === 0 ? '1px solid #1a4d25' : 'none',
              color: slot.team ? (isWinner ? '#fff' : '#ccc') : '#3a6a3a',
              fontWeight: isWinner ? 'bold' : 'normal',
              fontSize: 13,
              minHeight: 30,
            }}>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 105 }}>
                {slot.team || tx.pending}
              </span>
              {match.played && <span style={{ color: isWinner ? '#c8a800' : '#777', fontWeight: 'bold', marginLeft: 4 }}>{slot.score}</span>}
              {canClick && i === 0 && <span style={{ color: '#c8a800', fontSize: 9 }}>▶</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── TriangularView ────────────────────────────────────────────────────────
function TriangularView({ triangular, lang, onMatchClick }) {
  const tx = T_COPA[lang] || T_COPA.es;
  if (!triangular) return null;
  const { teams, matches, standings } = triangular;
  const ready = teams.every(Boolean);

  return (
    <div style={{ background: '#0a2010', border: '2px solid #c8a800', borderRadius: 4, padding: 14, marginTop: 16, maxWidth: 440, width: '100%' }}>
      <div style={{ color: '#c8a800', fontWeight: 'bold', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10, borderBottom: '1px solid #1a4d25', paddingBottom: 6 }}>
        🔺 {tx.triangular}
      </div>
      {!ready && <div style={{ color: '#3a6a3a', fontSize: 12, fontStyle: 'italic' }}>Esperando clasificados del bracket...</div>}
      {ready && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
            {matches.map((m, i) => (
              <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#081a0e', border: '1px solid #1a4d25', borderRadius: 2, padding: '6px 10px' }}>
                <span style={{ flex: 1, textAlign: 'right', color: m.played && m.winner === m.home ? '#fff' : '#aaa', fontWeight: m.played && m.winner === m.home ? 'bold' : 'normal', fontSize: 13 }}>{m.home}</span>
                {m.played
                  ? <span style={{ color: '#c8a800', fontWeight: 'bold', fontSize: 14, minWidth: 40, textAlign: 'center' }}>{m.homeScore} – {m.awayScore}</span>
                  : <button style={{ background: '#1e6b2e', border: 'none', color: '#fff', padding: '3px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 2 }} onClick={() => onMatchClick(i)}>▶</button>
                }
                <span style={{ flex: 1, color: m.played && m.winner === m.away ? '#fff' : '#aaa', fontWeight: m.played && m.winner === m.away ? 'bold' : 'normal', fontSize: 13 }}>{m.away}</span>
              </div>
            ))}
          </div>
          {standings && standings.length > 0 && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr>{['#','Equipo',tx.pj,tx.g,tx.e,tx.p,'GF','GC','Pts'].map(h => (
                  <th key={h} style={{ background: '#1e6b2e', color: '#fff', padding: '4px 6px', textAlign: h === 'Equipo' ? 'left' : 'center', border: '1px solid #0a2010' }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {standings.map((row, i) => (
                  <tr key={row.team} style={{ background: i % 2 === 0 ? '#0a2010' : '#081a0e' }}>
                    <td style={{ padding: '3px 6px', color: '#c8a800', textAlign: 'center', border: '1px solid #0a2010' }}>{i + 1}</td>
                    <td style={{ padding: '3px 6px', color: '#fff', border: '1px solid #0a2010' }}>{row.team}</td>
                    {[row.pj, row.g, row.e, row.p, row.gf, row.gc, row.pts].map((v, j) => (
                      <td key={j} style={{ padding: '3px 6px', color: j === 6 ? '#c8a800' : '#ccc', textAlign: 'center', border: '1px solid #0a2010', fontWeight: j === 6 ? 'bold' : 'normal' }}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}
    </div>
  );
}

// ── CopaScreen ────────────────────────────────────────────────────────────
function CopaScreen({ tournament, lang, onResult, onReset }) {
  const tx = T_COPA[lang] || T_COPA.es;
  const [modal, setModal] = React.useState(null);
  const [lastWinner, setLastWinner] = React.useState(null);
  const { copa, cupType, teams, tourName } = tournament;
  const { rounds, triangular, champion } = copa;

  const bracketRounds = rounds.slice(0, rounds.length > 1 ? rounds.length - 1 : rounds.length);
  const finalRound = rounds.length > 1 ? rounds[rounds.length - 1] : null;
  const finalMatch = finalRound ? finalRound.matches[0] : null;

  function splitRound(round) {
    const n = round.matches.length;
    const half = Math.ceil(n / 2);
    return {
      left: { ...round, matches: round.matches.slice(0, half) },
      right: { ...round, matches: round.matches.slice(half) }
    };
  }

  const leftRounds = bracketRounds.map(r => splitRound(r).left);
  const rightRounds = bracketRounds.map(r => splitRound(r).right);

  function handleBracketClick(roundIdx, matchIdx, side) {
    const globalIdx = side === 'left' ? matchIdx : splitRound(rounds[roundIdx]).left.matches.length + matchIdx;
    const match = rounds[roundIdx].matches[globalIdx];
    setModal({ type: 'bracket', roundIdx, matchIdx: globalIdx, match });
  }

  function handleFinalClick() {
    if (!finalMatch) return;
    setModal({ type: 'bracket', roundIdx: rounds.length - 1, matchIdx: 0, match: finalMatch });
  }

  function handleTriClick(matchIdx) {
    const match = triangular.matches[matchIdx];
    setModal({ type: 'triangular', matchIdx, match });
  }

  function handleConfirm(hs, as_, pen) {
    let newCopa;
    if (modal.type === 'bracket') {
      newCopa = TU.applyCopaResult(copa, modal.roundIdx, modal.matchIdx, hs, as_, pen);
      const winner = hs > as_ ? modal.match.home : as_ > hs ? modal.match.away : pen;
      setLastWinner(winner);
      setTimeout(() => setLastWinner(null), 1600);
    } else {
      newCopa = TU.applyTriResult(copa, modal.matchIdx, hs, as_);
    }
    setModal(null);
    onResult(newCopa);
  }

  const cupLabel = { libertadores: 'Copa Libertadores', champions: 'Champions League', mundial: 'Copa del Mundo' };
  const S = copaStyles;

  return (
    <div style={S.page}>
      {/* Top bar */}
      <div style={S.topBar} className="top-bar">
        <button style={S.resetBtn} onClick={onReset}>← {lang === 'en' ? 'New' : 'Nuevo'}</button>
        <span style={S.tourTitle} className="top-bar-title">{tourName || (lang === 'en' ? 'Cup Tournament' : 'Torneo Copa')}</span>
        <span style={S.cupTag}>{cupLabel[cupType] || cupType}</span>
      </div>

      {/* Champion banner */}
      {champion && (
        <div style={S.championBanner}>
          🏆 {tx.champion}: <strong style={{ color: '#fff', marginLeft: 8 }}>{champion}</strong>
        </div>
      )}

      {/* Bracket */}
      <div style={S.bracketWrapper}>
        <div style={S.bracketScroll} className="bracket-scroll">
          <div style={S.bracketInner}>
            {/* Left bracket */}
            {leftRounds.length > 0 && leftRounds[0].matches.length > 0 && (
              <BracketSide
                rounds={leftRounds}
                side="left"
                lastWinner={lastWinner}
                onMatchClick={(r, i) => handleBracketClick(r, i, 'left')}
              />
            )}

            {/* Center: trophy + final */}
            <div style={S.center}>
              {leftRounds.length > 0 && leftRounds[0].matches.length > 0 && (
                <div style={{ width: 20, height: 1.5, background: '#c8a800', alignSelf: 'center', flexShrink: 0 }} />
              )}
              <div style={S.centerColumn}>
                <Trophy type={cupType} size={90} />
                {finalMatch && !champion && (
                  <FinalCard match={finalMatch} lang={lang} lastWinner={lastWinner} onMatchClick={handleFinalClick} />
                )}
                {champion && (
                  <div style={S.champName}>{champion}</div>
                )}
              </div>
              {rightRounds.length > 0 && rightRounds[0].matches.length > 0 && (
                <div style={{ width: 20, height: 1.5, background: '#c8a800', alignSelf: 'center', flexShrink: 0 }} />
              )}
            </div>

            {/* Right bracket */}
            {rightRounds.length > 0 && rightRounds[0].matches.length > 0 && (
              <BracketSide
                rounds={rightRounds}
                side="right"
                lastWinner={lastWinner}
                onMatchClick={(r, i) => handleBracketClick(r, i, 'right')}
              />
            )}
          </div>
        </div>

        {/* Triangular */}
        {triangular && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '0 16px 16px' }}>
            <TriangularView triangular={triangular} lang={lang} onMatchClick={handleTriClick} />
          </div>
        )}
      </div>

      {modal && (
        <ResultModal
          match={modal.match}
          context={modal.type}
          lang={lang}
          onConfirm={handleConfirm}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}

const copaStyles = {
  page: { minHeight: '100vh', background: '#0a2010', display: 'flex', flexDirection: 'column' },
  topBar: { background: '#081a0e', borderBottom: '2px solid #c8a800', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  resetBtn: { background: 'none', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '4px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 },
  tourTitle: { color: '#c8a800', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center', minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cupTag: { color: '#7ab87a', fontSize: 11, letterSpacing: 0.5, whiteSpace: 'nowrap', flexShrink: 0 },
  championBanner: { background: '#1e6b2e', borderBottom: '2px solid #c8a800', padding: '10px 16px', color: '#c8a800', fontWeight: 'bold', fontSize: 16, textAlign: 'center', letterSpacing: 1 },
  bracketWrapper: { flex: 1, overflow: 'hidden' },
  bracketScroll: { overflowX: 'auto', overflowY: 'auto', padding: 20, minHeight: 300 },
  bracketInner: { display: 'flex', alignItems: 'center', gap: 0, width: 'fit-content', margin: '0 auto' },
  center: { display: 'flex', alignItems: 'center', flexShrink: 0 },
  centerColumn: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '0 16px' },
  champName: { color: '#c8a800', fontWeight: 'bold', fontSize: 15, textAlign: 'center', marginTop: 4, maxWidth: 160, wordBreak: 'break-word' },
};

window.CopaScreen = CopaScreen;
