// modal.jsx — Result entry modal

const T_MODAL = {
  es: {
    title: 'Ingresar Resultado', confirm: 'Confirmar', cancel: 'Cancelar',
    penalties: 'Definición por penales', penWinner: 'Ganador en penales:',
    bye: 'Pase automático (BYE)', advances: 'avanza a la siguiente fase',
    triMatch: 'Partido del Triangular',
  },
  en: {
    title: 'Enter Result', confirm: 'Confirm', cancel: 'Cancel',
    penalties: 'Goes to penalties', penWinner: 'Penalty winner:',
    bye: 'Automatic bye', advances: 'advances to next round',
    triMatch: 'Triangular Match',
  }
};

function ResultModal({ match, context, lang, onConfirm, onClose }) {
  const tx = T_MODAL[lang] || T_MODAL.es;
  const [hs, setHs] = React.useState(0);
  const [as_, setAs] = React.useState(0);
  const [penWinner, setPenWinner] = React.useState(null);

  if (!match) return null;
  const isCopa = context === 'bracket' || context === 'triangular';
  const isTied = hs === as_;
  const showPen = isCopa && isTied;

  function handleConfirm() {
    if (showPen && !penWinner) return;
    onConfirm(Number(hs), Number(as_), showPen ? penWinner : null);
  }

  const S = modalStyles;

  return (
    <div style={S.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={S.box}>
        <div style={S.header}>
          <span style={S.headerTitle}>{context === 'triangular' ? tx.triMatch : tx.title}</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={S.body}>
          <div style={S.matchRow}>
            {/* Home */}
            <div style={S.teamBlock}>
              <div style={S.teamName}>{match.home}</div>
              <div style={S.scoreControls}>
                <button style={S.scoreBtn} onClick={() => setHs(Math.max(0, hs - 1))}>−</button>
                <div style={S.scoreBox}>{hs}</div>
                <button style={S.scoreBtn} onClick={() => setHs(hs + 1)}>+</button>
              </div>
            </div>

            <div style={S.vs}>VS</div>

            {/* Away */}
            <div style={S.teamBlock}>
              <div style={S.teamName}>{match.away}</div>
              <div style={S.scoreControls}>
                <button style={S.scoreBtn} onClick={() => setAs(Math.max(0, as_ - 1))}>−</button>
                <div style={S.scoreBox}>{as_}</div>
                <button style={S.scoreBtn} onClick={() => setAs(as_ + 1)}>+</button>
              </div>
            </div>
          </div>

          {/* Penalties (copa only, on tie) */}
          {showPen && (
            <div style={S.penBlock}>
              <div style={S.penLabel}>{tx.penalties}</div>
              <div style={S.penLabel}>{tx.penWinner}</div>
              <div style={S.penBtnRow}>
                <button
                  style={penWinner === match.home ? S.penBtnActive : S.penBtn}
                  onClick={() => setPenWinner(match.home)}
                >{match.home}</button>
                <button
                  style={penWinner === match.away ? S.penBtnActive : S.penBtn}
                  onClick={() => setPenWinner(match.away)}
                >{match.away}</button>
              </div>
            </div>
          )}

          {/* Winner preview */}
          {(!showPen || penWinner) && (
            <div style={S.winnerPreview}>
              <span style={S.winnerName}>
                {showPen ? penWinner : hs > as_ ? match.home : as_ > hs ? match.away : '—'}
              </span>
              {isCopa && <span style={S.advText}> {tx.advances}</span>}
            </div>
          )}
        </div>

        <div style={S.footer}>
          <button style={S.cancelBtn} onClick={onClose}>{tx.cancel}</button>
          <button
            style={(showPen && !penWinner) ? S.confirmBtnDisabled : S.confirmBtn}
            onClick={handleConfirm}
          >{tx.confirm} ✓</button>
        </div>
      </div>
    </div>
  );
}

const modalStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
  box: { background: '#0f2d18', border: '2px solid #c8a800', borderRadius: 4, width: 360, maxWidth: '95vw', overflow: 'hidden' },
  header: { background: '#081a0e', padding: '10px 16px', borderBottom: '1px solid #c8a800', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  headerTitle: { color: '#c8a800', fontWeight: 'bold', fontSize: 14, textTransform: 'uppercase', letterSpacing: 1 },
  closeBtn: { background: 'none', border: 'none', color: '#7ab87a', fontSize: 16, cursor: 'pointer' },
  body: { padding: 18 },
  matchRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 14 },
  teamBlock: { flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 },
  teamName: { color: '#fff', fontSize: 13, fontWeight: 'bold', textAlign: 'center', wordBreak: 'break-word' },
  scoreControls: { display: 'flex', alignItems: 'center', gap: 6 },
  scoreBox: { width: 48, height: 48, background: '#081a0e', border: '2px solid #c8a800', color: '#c8a800', fontSize: 24, fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  scoreBtn: { width: 30, height: 30, background: '#1e6b2e', border: '1px solid #2a8a3e', color: '#fff', fontSize: 18, cursor: 'pointer', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1 },
  vs: { color: '#c8a800', fontWeight: 'bold', fontSize: 16 },
  penBlock: { background: '#081a0e', border: '1px solid #c8a800', borderRadius: 3, padding: 10, marginBottom: 12 },
  penLabel: { color: '#c8a800', fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 6 },
  penBtnRow: { display: 'flex', gap: 8 },
  penBtn: { flex: 1, background: '#0f2d18', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '6px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 2 },
  penBtnActive: { flex: 1, background: '#c8a800', border: '1px solid #c8a800', color: '#000', padding: '6px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 2, fontWeight: 'bold' },
  winnerPreview: { background: '#1e6b2e', border: '1px solid #2a8a3e', borderRadius: 3, padding: '8px 12px', textAlign: 'center', marginBottom: 4 },
  winnerName: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  advText: { color: '#a0e0a0', fontSize: 12 },
  footer: { display: 'flex', borderTop: '1px solid #1a4d25' },
  cancelBtn: { flex: 1, background: '#081a0e', border: 'none', color: '#7ab87a', padding: 12, fontSize: 13, cursor: 'pointer', borderRight: '1px solid #1a4d25' },
  confirmBtn: { flex: 1, background: '#1e6b2e', border: 'none', color: '#fff', padding: 12, fontSize: 14, fontWeight: 'bold', cursor: 'pointer' },
  confirmBtnDisabled: { flex: 1, background: '#0f2d18', border: 'none', color: '#3a5a3a', padding: 12, fontSize: 14, cursor: 'not-allowed' },
};

window.ResultModal = ResultModal;
