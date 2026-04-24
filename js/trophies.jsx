// trophies.jsx — Trophy image components using real PNG files

function Trophy({ type, size = 100 }) {
  const srcs = {
    libertadores: 'copas/lib.png',
    champions:    'copas/champ.png',
    mundial:      'copas/mundi.png',
  };
  const src = srcs[type] || srcs.libertadores;

  return (
    <img
      src={src}
      alt={type}
      style={{
        height: size,
        width: 'auto',
        maxWidth: size * 1.2,
        objectFit: 'contain',
        display: 'block',
        flexShrink: 0,
      }}
    />
  );
}

window.Trophy = Trophy;
