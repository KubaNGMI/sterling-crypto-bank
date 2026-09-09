// A deposit asset's mark: the real logo where we have one, otherwise a
// lettered chip in the token's brand color. A drawn initial is honest about
// being a placeholder; a Unicode glyph pretending to be a logo is not.
export default function AssetIcon({ asset, size = 26 }) {
  const style = { width: size, height: size };

  if (asset.icon) {
    return (
      <span className="asset-icon" style={{ ...style, background: asset.color }}>
        <img src={asset.icon} alt="" />
        <style>{`
          .asset-icon {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            overflow: hidden;
            flex-shrink: 0;
          }
          .asset-icon img { width: 100%; height: 100%; object-fit: contain; }
        `}</style>
      </span>
    );
  }

  return (
    <span
      className="asset-icon asset-icon--letter"
      style={{ ...style, background: asset.color, fontSize: Math.round(size * 0.44) }}
      aria-hidden="true"
    >
      {asset.symbol.charAt(0)}
      <style>{`
        .asset-icon--letter {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          flex-shrink: 0;
          font-weight: 700;
          color: #0c0c14;
          line-height: 1;
        }
      `}</style>
    </span>
  );
}
