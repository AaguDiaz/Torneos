// trophies.jsx — Trophy image components using real PNG files

function Trophy({ type, size = 100 }) {
  const configs = {
    libertadores: { src: 'copas/lib.png',   bg: '#f5f0e8', padding: 0.08 },
    champions:    { src: 'copas/champ.png', bg: '#efefef', padding: 0.08 },
    mundial:      { src: 'copas/mundi.png', bg: '#111111', padding: 0.05 },
  };
  const { src, bg, padding } = configs[type] || configs.libertadores;
  const pad = Math.round(size * padding);

  return (
    <div style={{
      background: bg,
      borderRadius: 8,
      padding: pad,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      border: '1.5px solid rgba(200,168,0,0.45)',
      boxShadow: '0 0 14px rgba(200,168,0,0.35)',
      lineHeight: 0,
      flexShrink: 0,
    }}>
      <img
        src={src}
        alt={type}
        style={{
          height: size,
          width: 'auto',
          maxWidth: size * 1.1,
          objectFit: 'contain',
          display: 'block',
        }}
      />
    </div>
  );
}

window.Trophy = Trophy;
