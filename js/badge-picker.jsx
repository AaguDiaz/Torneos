// badge-picker.jsx — Team badge picker modal using TheSportsDB API

const BADGE_LS_KEY = 'badge_teams_argentina_v2';

const ARGENTINA_TEAMS = [
  'Aldosivi', 'Argentinos Juniors', 'Atletico Tucuman',
  'Banfield', 'Barracas Central', 'Belgrano',
  'Boca Juniors', 'Central Cordoba', 'Defensa y Justicia',
  'Deportivo Riestra', 'Estudiantes de La Plata', 'Estudiantes de Río Cuarto',
  'Gimnasia y Esgrima de La Plata', 'Gimnasia y esgrisma de Mendoza', 'Huracan',
  'Independiente', 'Independiente Rivadavia', 'Instituto',
  'Lanus', "Newell's Old Boys", 'Platense',
  'Racing Club', 'River Plate', 'Rosario Central',
  'San Lorenzo', 'Sarmiento', 'Talleres de Córdoba',
  'Tigre', 'Union de Santa Fe', 'Velez Sarsfield'
];

// Session-level cache on top of localStorage
let _badgeSessionCache = null;

function _loadFromStorage() {
  try {
    const raw = localStorage.getItem(BADGE_LS_KEY);
    if (raw) return JSON.parse(raw);
  } catch (_) { }
  return null;
}

function _saveToStorage(list) {
  try {
    localStorage.setItem(BADGE_LS_KEY, JSON.stringify(list));
  } catch (_) { }
}

async function _fetchAllTeams(onProgress) {
  let done = 0;
  const results = await Promise.all(
    ARGENTINA_TEAMS.map(async name => {
      try {
        const r = await fetch(
          `https://www.thesportsdb.com/api/v1/json/123/searchteams.php?t=${encodeURIComponent(name)}`
        );
        const data = await r.json();
        const team = (data.teams || [])[0];
        return team ? { name: team.strTeam, badge: team.strBadge } : { name, badge: null };
      } catch (_) {
        return { name, badge: null };
      } finally {
        onProgress(++done);
      }
    })
  );
  return results.sort((a, b) => a.name.localeCompare(b.name));
}

function BadgePicker({ onSelect, onClose }) {
  const [teams, setTeams] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [progress, setProgress] = React.useState(0);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (_badgeSessionCache) { setTeams(_badgeSessionCache); return; }
    const stored = _loadFromStorage();
    if (stored && stored.length > 0) {
      _badgeSessionCache = stored;
      setTeams(stored);
      return;
    }
    setLoading(true);
    setError(false);
    setProgress(0);
    _fetchAllTeams(n => setProgress(n))
      .then(list => {
        _badgeSessionCache = list;
        _saveToStorage(list);
        setTeams(list);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  const S = badgePickerStyles;

  return (
    <div style={S.overlay} onClick={onClose}>
      <div style={S.modal} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={S.header}>
          <span style={S.headerTitle}>🛡️ Elegir escudo — 🇦🇷 Primera División</span>
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        </div>

        {/* Teams grid */}
        <div style={S.teamsArea}>
          {loading && <div style={S.msg}>Cargando equipos... {progress}/{ARGENTINA_TEAMS.length}</div>}
          {!loading && error && <div style={S.msg}>Error al cargar. Revisá la conexión.</div>}
          {!loading && !error && teams.length === 0 && <div style={S.msg}>Sin datos</div>}
          {!loading && teams.length > 0 && (
            <div style={S.teamsGrid}>
              {teams.map(t => (
                <div
                  key={t.name}
                  style={S.teamCard}
                  onClick={() => { onSelect(t.name, t.badge); onClose(); }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#c8a800'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#2a6b3a'}
                >
                  {t.badge
                    ? <img src={t.badge} style={S.badgeImg} alt={t.name} onError={e => { e.target.style.display = 'none'; }} />
                    : <div style={S.badgePlaceholder}>⚽</div>
                  }
                  <span style={S.teamCardName}>{t.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

const badgePickerStyles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 },
  modal: { background: '#0f2d18', border: '2px solid #c8a800', borderRadius: 4, width: '100%', maxWidth: 580, maxHeight: '85vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { background: '#081a0e', padding: '10px 16px', borderBottom: '2px solid #c8a800', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 },
  headerTitle: { color: '#c8a800', fontWeight: 'bold', fontSize: 15, letterSpacing: 0.5 },
  closeBtn: { background: 'none', border: '1px solid #2a6b3a', color: '#7ab87a', padding: '2px 9px', cursor: 'pointer', fontSize: 14, borderRadius: 2 },
  teamsArea: { flex: 1, overflowY: 'auto', padding: 12 },
  msg: { color: '#7ab87a', textAlign: 'center', padding: '28px 0', fontSize: 13 },
  teamsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))', gap: 8 },
  teamCard: { background: '#081a0e', border: '1px solid #2a6b3a', borderRadius: 3, padding: '8px 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5, cursor: 'pointer', transition: 'border-color 0.12s' },
  badgeImg: { width: 48, height: 48, objectFit: 'contain' },
  badgePlaceholder: { width: 48, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 },
  teamCardName: { color: '#d0e8d0', fontSize: 10, textAlign: 'center', lineHeight: 1.25, wordBreak: 'break-word' },
};

window.BadgePicker = BadgePicker;
