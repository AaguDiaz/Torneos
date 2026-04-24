// history.jsx — Tournament history screen

const T_HIST = {
  es: {
    title: 'Historial de Torneos',
    empty: 'No hay torneos guardados todavía.',
    restore: 'Restaurar',
    del: 'Eliminar',
    back: '← Volver',
    champion: 'Campeón',
    inProgress: 'En progreso',
    fmtLabel: { copa: 'Copa', liga: 'Liga' },
    cupLabel: { libertadores: 'Libertadores', champions: 'Champions', mundial: 'Mundial' },
    confirmDel: '¿Eliminar este torneo del historial?',
    teams: 'equipos',
  },
  en: {
    title: 'Tournament History',
    empty: 'No saved tournaments yet.',
    restore: 'Restore',
    del: 'Delete',
    back: '← Back',
    champion: 'Champion',
    inProgress: 'In progress',
    fmtLabel: { copa: 'Cup', liga: 'League' },
    cupLabel: { libertadores: 'Libertadores', champions: 'Champions', mundial: 'World Cup' },
    confirmDel: 'Delete this tournament from history?',
    teams: 'teams',
  }
};

function HistoryScreen({ lang, onRestore, onBack }) {
  const tx = T_HIST[lang] || T_HIST.es;
  const [entries, setEntries] = React.useState([]);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem('torneos_history_v1');
      setEntries(raw ? JSON.parse(raw) : []);
    } catch { setEntries([]); }
  }, []);

  function handleDelete(id) {
    if (!window.confirm(tx.confirmDel)) return;
    const updated = entries.filter(e => e.id !== id);
    setEntries(updated);
    try { localStorage.setItem('torneos_history_v1', JSON.stringify(updated)); } catch {}
  }

  function formatDate(iso) {
    try {
      return new Date(iso).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-AR', {
        day: '2-digit', month: '2-digit', year: '2-digit',
        hour: '2-digit', minute: '2-digit'
      });
    } catch { return iso; }
  }

  const S = histStyles;

  return (
    <div style={S.page}>
      <div style={S.topBar} className="top-bar">
        <button style={S.backBtn} onClick={onBack}>{tx.back}</button>
        <span style={S.title} className="top-bar-title">{tx.title}</span>
        <span style={{ width: 70, flexShrink: 0 }} />
      </div>

      <div style={S.list}>
        {entries.length === 0 && (
          <div style={S.empty}>{tx.empty}</div>
        )}
        {[...entries].reverse().map(entry => (
          <div key={entry.id} style={S.card} className="hist-card">
            <div style={S.cardLeft}>
              <div style={S.cardName}>
                {entry.tourName || tx.fmtLabel[entry.format] || entry.format}
              </div>
              <div style={S.cardMeta}>
                <span style={S.badge}>{tx.fmtLabel[entry.format] || entry.format}</span>
                {entry.cupType && (
                  <span style={{ ...S.badge, background: '#2a4a70', color: '#80c0e8' }}>
                    {tx.cupLabel[entry.cupType] || entry.cupType}
                  </span>
                )}
                <span style={S.metaText}>{entry.teams?.length} {tx.teams}</span>
              </div>
              <div style={S.cardChampion}>
                {entry.champion
                  ? <span>🏆 {tx.champion}: <strong style={{ color: '#fff' }}>{entry.champion}</strong></span>
                  : <span style={{ color: '#5a8a5a', fontStyle: 'italic' }}>{tx.inProgress}</span>
                }
              </div>
              <div style={S.cardDate}>{formatDate(entry.savedAt)}</div>
            </div>
            <div style={S.cardActions} className="hist-actions">
              <button style={S.restoreBtn} onClick={() => onRestore(entry.state)}>{tx.restore}</button>
              <button style={S.deleteBtn} onClick={() => handleDelete(entry.id)}>{tx.del}</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const histStyles = {
  page: { minHeight: '100vh', background: '#0a2010', display: 'flex', flexDirection: 'column' },
  topBar: { background: '#081a0e', borderBottom: '2px solid #c8a800', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 12 },
  backBtn: { background: 'none', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '4px 10px', fontSize: 12, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap', flexShrink: 0 },
  title: { color: '#c8a800', fontWeight: 'bold', fontSize: 16, flex: 1, textAlign: 'center' },
  list: { flex: 1, padding: 16, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640, width: '100%', margin: '0 auto' },
  empty: { color: '#3a6a3a', fontStyle: 'italic', textAlign: 'center', padding: 48, fontSize: 14 },
  card: { background: '#0f2d18', border: '1px solid #2a6b3a', borderRadius: 4, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 14 },
  cardLeft: { flex: 1, minWidth: 0 },
  cardName: { color: '#fff', fontWeight: 'bold', fontSize: 15, marginBottom: 5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  cardMeta: { display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 5, alignItems: 'center' },
  badge: { background: '#1e6b2e', color: '#a0e0a0', fontSize: 10, padding: '2px 7px', borderRadius: 2, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: 0.5 },
  metaText: { color: '#7ab87a', fontSize: 11 },
  cardChampion: { color: '#c8a800', fontSize: 12, marginBottom: 3 },
  cardDate: { color: '#4a7a4a', fontSize: 10 },
  cardActions: { display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 },
  restoreBtn: { background: '#1e6b2e', border: '1px solid #2a8a3e', color: '#fff', padding: '7px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 2, fontWeight: 'bold', whiteSpace: 'nowrap' },
  deleteBtn: { background: '#1a0808', border: '1px solid #5a1e1e', color: '#c06060', padding: '7px 14px', fontSize: 12, cursor: 'pointer', borderRadius: 2, whiteSpace: 'nowrap' },
};

window.HistoryScreen = HistoryScreen;
