/**
 * Flat vector illustrations for the comparison cards.
 *
 * Drawn in the same bold-outline style as the stick figure so the two read as
 * one piece of art, and generated rather than sourced so there is no licensing
 * question about what appears on the channel.
 *
 * Each motif returns SVG markup for a 400x400 viewBox and is handed a small
 * palette: c.a is the primary fill, c.b a secondary, c.ink the outline colour.
 */
(() => {
  const K = 'stroke="#0b0b0c" stroke-width="13" stroke-linejoin="round" stroke-linecap="round"';
  const KT = 'stroke="#0b0b0c" stroke-width="9" stroke-linejoin="round" stroke-linecap="round"';
  const N = 'fill="none"';

  const MOTIFS = {
    // ---------------------------------------------------------------- property
    skyscraper: c => `
      <rect x="72" y="176" width="96" height="180" fill="${c.b}" ${K}/>
      <rect x="168" y="52" width="150" height="304" fill="${c.a}" ${K}/>
      ${grid(190, 84, 4, 5, 22, 34, c.ink)}
      <rect x="96" y="206" width="20" height="26" fill="${c.ink}"/>
      <rect x="126" y="206" width="20" height="26" fill="${c.ink}"/>
      <rect x="96" y="256" width="20" height="26" fill="${c.ink}"/>
      <rect x="126" y="256" width="20" height="26" fill="${c.ink}"/>`,

    house: c => `
      <path d="M60 200 L200 92 L340 200" ${N} ${K}/>
      <rect x="92" y="196" width="216" height="160" fill="${c.a}" ${K}/>
      <rect x="168" y="256" width="64" height="100" fill="${c.b}" ${K}/>
      <rect x="118" y="228" width="42" height="42" fill="#fff" ${KT}/>
      <rect x="240" y="228" width="42" height="42" fill="#fff" ${KT}/>`,

    bridge: c => `
      <rect x="66" y="140" width="30" height="180" fill="${c.b}" ${K}/>
      <rect x="304" y="140" width="30" height="180" fill="${c.b}" ${K}/>
      <path d="M81 150 Q200 300 319 150" ${N} ${K}/>
      <rect x="40" y="238" width="320" height="26" fill="${c.a}" ${K}/>
      <path d="M130 205 v40 M200 228 v18 M270 205 v40" ${N} ${KT}/>`,

    // ------------------------------------------------------------------ luxury
    sportscar: c => `
      <path d="M48 250 L92 250 Q120 190 178 186 L250 182 Q308 182 344 232 L356 250 Q360 282 336 286 L64 286 Q40 282 48 250 Z" fill="${c.a}" ${K}/>
      <path d="M126 232 Q150 200 186 198 L242 196 Q286 198 312 232 Z" fill="#fff" ${KT}/>
      <circle cx="128" cy="290" r="42" fill="#fff" ${K}/>
      <circle cx="284" cy="290" r="42" fill="#fff" ${K}/>
      <circle cx="128" cy="290" r="15" fill="${c.ink}"/>
      <circle cx="284" cy="290" r="15" fill="${c.ink}"/>`,

    shoppingbags: c => `
      <path d="M74 176 h116 l16 168 h-148 Z" fill="${c.a}" ${K}/>
      <path d="M104 176 q28 -52 56 0" ${N} ${K}/>
      <path d="M212 208 h108 l14 136 h-136 Z" fill="${c.b}" ${K}/>
      <path d="M238 208 q28 -46 56 0" ${N} ${K}/>`,

    gift: c => `
      <rect x="64" y="168" width="272" height="60" fill="${c.b}" ${K}/>
      <rect x="86" y="228" width="228" height="128" fill="${c.a}" ${K}/>
      <path d="M200 168 v188" ${N} ${K}/>
      <path d="M200 168 q-70 -12 -56 -52 q34 -22 56 52 Z" fill="${c.b}" ${K}/>
      <path d="M200 168 q70 -12 56 -52 q-34 -22 -56 52 Z" fill="${c.b}" ${K}/>`,

    // ------------------------------------------------------------------ charts
    chartup: c => `
      <path d="M64 340 V72 M64 340 H344" ${N} ${K}/>
      <path d="M96 288 L166 216 L226 258 L318 132" ${N} fill="none" stroke="${c.a}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M270 132 h56 v56" ${N} stroke="${c.a}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="166" cy="216" r="13" fill="${c.ink}"/>
      <circle cx="226" cy="258" r="13" fill="${c.ink}"/>`,

    candles: c => `
      <path d="M64 344 H344" ${N} ${K}/>
      ${candle(104, 150, 300, 186, 258, c.a, c.ink)}
      ${candle(174, 116, 268, 152, 232, c.b, c.ink)}
      ${candle(244, 96, 244, 130, 200, c.a, c.ink)}
      ${candle(314, 62, 208, 96, 168, c.b, c.ink)}`,

    stairsdown: c => `
      <path d="M56 108 h84 v72 h84 v72 h84 v72 h56" fill="${c.b}" ${K}/>
      <path d="M120 150 L268 298" ${N} stroke="${c.a}" stroke-width="20" stroke-linecap="round"/>
      <path d="M268 240 v58 h-58" ${N} stroke="${c.a}" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>`,

    pie: c => `
      <circle cx="200" cy="208" r="132" fill="${c.b}" ${K}/>
      <path d="M200 208 V76 A132 132 0 0 1 320 190 Z" fill="${c.a}" ${K}/>
      <circle cx="200" cy="208" r="44" fill="#fff" ${K}/>`,

    percent: c => `
      <circle cx="136" cy="140" r="56" fill="${c.a}" ${K}/>
      <circle cx="272" cy="278" r="56" fill="${c.b}" ${K}/>
      <path d="M300 92 L108 326" ${N} ${K}/>`,

    // ------------------------------------------------------------------- money
    cashstack: c => `
      <rect x="40" y="122" width="276" height="88" rx="10" fill="${c.b}" ${K}/>
      <rect x="58" y="176" width="276" height="88" rx="10" fill="${c.b}" ${K}/>
      <rect x="76" y="230" width="276" height="88" rx="10" fill="${c.a}" ${K}/>
      <circle cx="214" cy="274" r="32" fill="#fff" ${KT}/>
      ${glyph(214, 274, 44)}`,

    coinstack: c => `
      ${coin(200, 300, c.a)}
      ${coin(200, 248, c.b)}
      ${coin(200, 196, c.a)}
      ${coin(200, 144, c.b)}`,

    token: c => `
      <circle cx="200" cy="208" r="132" fill="${c.a}" ${K}/>
      <circle cx="200" cy="208" r="92" fill="#fff" ${K}/>
      ${glyph(200, 208, 128)}`,

    moneybag: c => `
      <path d="M148 122 h104 l-26 40 h-52 Z" fill="${c.b}" ${K}/>
      <path d="M174 162 q-96 44 -96 128 q0 66 122 66 q122 0 122 -66 q0 -84 -96 -128 Z" fill="${c.a}" ${K}/>
      ${glyph(200, 282, 112, '#fff')}`,

    piggybank: c => `
      <ellipse cx="204" cy="238" rx="136" ry="102" fill="${c.a}" ${K}/>
      <path d="M104 300 v46 M164 330 v20 M256 330 v20 M312 296 v50" ${N} ${K}/>
      <ellipse cx="336" cy="222" rx="34" ry="28" fill="${c.b}" ${K}/>
      <circle cx="330" cy="216" r="7" fill="${c.ink}"/>
      <circle cx="348" cy="228" r="7" fill="${c.ink}"/>
      <path d="M156 132 q40 -30 66 6 Z" fill="${c.b}" ${K}/>
      <path d="M168 176 h72" ${N} ${K}/>
      <circle cx="262" cy="200" r="11" fill="${c.ink}"/>`,

    wallet: c => `
      <rect x="60" y="146" width="280" height="176" rx="22" fill="${c.a}" ${K}/>
      <path d="M60 206 h280" ${N} ${K}/>
      <rect x="228" y="228" width="140" height="66" rx="14" fill="${c.b}" ${K}/>
      <circle cx="266" cy="261" r="16" fill="#fff" ${KT}/>`,

    creditcard: c => `
      <rect x="52" y="128" width="296" height="180" rx="24" fill="${c.a}" ${K}/>
      <rect x="52" y="172" width="296" height="40" fill="${c.ink}"/>
      <rect x="86" y="236" width="70" height="44" rx="8" fill="${c.b}" ${KT}/>
      <path d="M196 258 h116" ${N} ${KT}/>`,

    // Cupped hands under a coin. A bowl plus two thumbs reads as hands far more
    // reliably at this size than an anatomical palm does.
    handcoin: c => `
      <circle cx="200" cy="120" r="62" fill="${c.b}" ${K}/>
      ${glyph(200, 120, 84)}
      <path d="M60 244 q-6 -38 28 -38 q32 0 28 38" fill="${c.a}" ${K}/>
      <path d="M340 244 q6 -38 -28 -38 q-32 0 -28 38" fill="${c.a}" ${K}/>
      <path d="M58 240 h284 q0 116 -142 116 q-142 0 -142 -116 Z" fill="${c.a}" ${K}/>`,

    tree: c => `
      <rect x="182" y="228" width="38" height="128" fill="${c.b}" ${K}/>
      <circle cx="200" cy="150" r="98" fill="${c.a}" ${K}/>
      <circle cx="122" cy="196" r="56" fill="${c.a}" ${K}/>
      <circle cx="278" cy="196" r="56" fill="${c.a}" ${K}/>
      ${coinSm(140, 160, c.b)} ${coinSm(240, 130, c.b)} ${coinSm(206, 208, c.b)}`,

    seedling: c => `
      <path d="M118 260 h164 l-22 96 h-120 Z" fill="${c.b}" ${K}/>
      <path d="M200 260 V148" ${N} ${K}/>
      <path d="M200 188 q-88 -18 -92 -76 q64 -14 92 76 Z" fill="${c.a}" ${K}/>
      <path d="M200 214 q88 -18 92 -76 q-64 -14 -92 76 Z" fill="${c.a}" ${K}/>`,

    // ------------------------------------------------------- institutions/defi
    bank: c => `
      <path d="M48 152 L200 62 L352 152 Z" fill="${c.a}" ${K}/>
      <rect x="56" y="152" width="288" height="26" fill="${c.b}" ${K}/>
      ${cols(88, 178, 4, 56, 132, c.ink)}
      <rect x="48" y="310" width="304" height="34" fill="${c.b}" ${K}/>`,

    vault: c => `
      <rect x="48" y="72" width="304" height="272" rx="20" fill="${c.b}" ${K}/>
      <circle cx="200" cy="208" r="106" fill="${c.a}" ${K}/>
      <circle cx="200" cy="208" r="40" fill="#fff" ${K}/>
      <path d="M200 102 v36 M200 278 v36 M94 208 h36 M270 208 h36" ${N} ${K}/>
      <path d="M126 134 L154 162 M274 134 L246 162 M126 282 L154 254 M274 282 L246 254" ${N} ${KT}/>`,

    lock: c => `
      <path d="M124 186 v-38 a76 76 0 0 1 152 0 v38" ${N} ${K}/>
      <rect x="76" y="186" width="248" height="164" rx="26" fill="${c.a}" ${K}/>
      <circle cx="200" cy="252" r="28" fill="#fff" ${K}/>
      <path d="M200 274 v42" ${N} ${K}/>`,

    shield: c => `
      <path d="M200 56 L336 106 v104 q0 96 -136 146 q-136 -50 -136 -146 V106 Z" fill="${c.a}" ${K}/>
      <path d="M140 202 L184 248 L266 154" ${N} fill="none" stroke="#fff" stroke-width="26" stroke-linecap="round" stroke-linejoin="round"/>`,

    magnifier: c => `
      <rect x="72" y="60" width="188" height="230" rx="12" fill="${c.b}" ${K}/>
      <path d="M108 116 h116 M108 158 h116 M108 200 h72" ${N} ${KT}/>
      <circle cx="242" cy="222" r="88" fill="rgba(255,255,255,0.55)" ${K}/>
      <path d="M306 286 L358 338" ${N} stroke="#0b0b0c" stroke-width="26" stroke-linecap="round"/>`,

    nodes: c => `
      <path d="M200 96 L88 250 M200 96 L312 250 M88 250 L312 250 M200 96 L200 250 M88 250 L200 344 M312 250 L200 344" ${N} ${KT}/>
      <circle cx="200" cy="96" r="40" fill="${c.a}" ${K}/>
      <circle cx="88" cy="250" r="34" fill="${c.b}" ${K}/>
      <circle cx="312" cy="250" r="34" fill="${c.b}" ${K}/>
      <circle cx="200" cy="344" r="34" fill="${c.b}" ${K}/>`,

    fuelpump: c => `
      <rect x="70" y="94" width="164" height="250" rx="16" fill="${c.a}" ${K}/>
      <rect x="100" y="126" width="104" height="76" rx="8" fill="#fff" ${KT}/>
      <path d="M100 246 h104" ${N} ${KT}/>
      <path d="M234 160 h50 q22 0 22 24 v104 q0 26 26 26 t26 -26 V166 l-34 -40" ${N} ${K}/>`,

    receipt: c => `
      <path d="M92 56 h216 v272 l-27 -22 l-27 22 l-27 -22 l-27 22 l-27 -22 l-27 22 l-27 -22 l-27 22 Z" fill="${c.a}" ${K}/>
      <path d="M130 116 h140 M130 162 h140 M130 208 h92" ${N} ${KT}/>`,

    scales: c => `
      <path d="M200 78 v250 M132 344 h136" ${N} ${K}/>
      <circle cx="200" cy="78" r="16" fill="${c.ink}"/>
      <path d="M78 118 L322 62" ${N} ${K}/>
      <path d="M78 118 v34 M322 62 v34" ${N} ${KT}/>
      <path d="M20 152 h116 q0 62 -58 62 q-58 0 -58 -62 Z" fill="${c.a}" ${K}/>
      <path d="M264 96 h116 q0 62 -58 62 q-58 0 -58 -62 Z" fill="${c.b}" ${K}/>`,

    swap: c => `
      <path d="M96 148 a104 104 0 0 1 208 0" ${N} fill="none" stroke="${c.a}" stroke-width="24" stroke-linecap="round"/>
      <path d="M304 268 a104 104 0 0 1 -208 0" ${N} fill="none" stroke="${c.b}" stroke-width="24" stroke-linecap="round"/>
      <path d="M266 108 L306 146 L266 186" ${N} fill="none" stroke="${c.a}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M134 308 L94 270 L134 230" ${N} fill="none" stroke="${c.b}" stroke-width="24" stroke-linecap="round" stroke-linejoin="round"/>`,

    droplet: c => `
      <path d="M200 56 q116 132 116 190 a116 116 0 0 1 -232 0 q0 -58 116 -190 Z" fill="${c.a}" ${K}/>
      <circle cx="200" cy="256" r="52" fill="#fff" ${K}/>
      ${glyph(200, 256, 72)}`,

    certificate: c => `
      <rect x="52" y="80" width="296" height="200" rx="12" fill="${c.a}" ${K}/>
      <path d="M92 132 h216 M92 174 h216 M92 216 h124" ${N} ${KT}/>
      <circle cx="288" cy="266" r="52" fill="${c.b}" ${K}/>
      <path d="M264 306 L258 372 L288 350 L318 372 L312 306" fill="${c.b}" ${K}/>`,
  };

  // ------------------------------------------------------------------ helpers
  /**
   * A currency mark as a real font glyph. Drawing the S-curve by hand kept
   * coming out as a struck-through P rather than a dollar sign.
   */
  function glyph(cx, cy, size, fill = '#0b0b0c', ch = '$') {
    return `<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central"
      font-family="Georgia, 'Times New Roman', serif" font-weight="700"
      font-size="${size}" fill="${fill}">${ch}</text>`;
  }
  function coin(cx, cy, fill) {
    return `<ellipse cx="${cx}" cy="${cy}" rx="112" ry="34" fill="${fill}" ${K}/>`;
  }
  function coinSm(cx, cy, fill) {
    return `<circle cx="${cx}" cy="${cy}" r="24" fill="${fill}" stroke="#0b0b0c" stroke-width="9"/>`;
  }
  function candle(x, top, bottom, bodyTop, bodyBottom, fill, ink) {
    return `<path d="M${x} ${top} V${bottom}" fill="none" stroke="${ink}" stroke-width="9" stroke-linecap="round"/>` +
           `<rect x="${x - 24}" y="${bodyTop}" width="48" height="${bodyBottom - bodyTop}" fill="${fill}" ${K}/>`;
  }
  function grid(x, y, cols, rows, w, gap, ink) {
    let s = '';
    for (let r = 0; r < rows; r++) {
      for (let cIdx = 0; cIdx < cols; cIdx++) {
        s += `<rect x="${x + cIdx * (w + 8)}" y="${y + r * gap}" width="${w}" height="20" fill="${ink}"/>`;
      }
    }
    return s;
  }
  function cols(x, y, n, gap, h, ink) {
    let s = '';
    for (let i = 0; i < n; i++) {
      s += `<rect x="${x + i * gap}" y="${y}" width="30" height="${h}" fill="#fff" stroke="${ink}" stroke-width="11"/>`;
    }
    return s;
  }

  // globalThis rather than window: the browser scene reads it off window (the
  // same object), and the Node-side topic validator imports this file to check
  // motif names without needing a DOM.
  globalThis.MOTIFS = MOTIFS;
  globalThis.MOTIF_NAMES = Object.keys(MOTIFS);
})();
