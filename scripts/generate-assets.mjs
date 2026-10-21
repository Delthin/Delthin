import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

// Outline display lettering: SVGs rendered as <img> cannot load web fonts.
const root = new URL('../', import.meta.url);
const font = opentype.loadSync(fileURLToPath(new URL('assets/fonts/barlow-condensed-latin-800-normal.woff', root)));
const ink = (text, x, y, size, fill, attrs = '') =>
  `<path d="${font.getPath(text, x, y, size).toPathData(2)}" fill="${fill}" ${attrs}/>`;
const label = (text, x, y, color, size = 12, attrs = '') =>
  `<text x="${x}" y="${y}" fill="${color}" font-family="Arial,Helvetica,sans-serif" font-size="${size}" font-weight="700" letter-spacing="2" ${attrs}>${text}</text>`;

function hero({ dark, mobile }) {
  const w = mobile ? 600 : 1000;
  const h = mobile ? 480 : 370;
  const foreground = dark ? '#f0f8ff' : '#071a42';
  const paper = dark ? '#101e35' : '#f3faff';
  const secondary = dark ? '#a9c4e1' : '#4e6781';
  const left = mobile ? '0,0 600,0 600,285 0,355' : '0,0 648,0 538,370 0,370';
  const right = mobile ? '0,355 600,285 600,480 0,480' : '648,0 1000,0 1000,370 538,370';
  const cx = mobile ? 447 : 824;
  const cy = mobile ? 392 : 188;
  const rings = [64, 97, 139, 188, 246, 314].map((r, i) =>
    `<ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * .56}" transform="rotate(-24 ${cx} ${cy})" fill="none" stroke="#6ad9ff" stroke-opacity="${.30 - i * .035}"/>`).join('\n');
  const sound = Array.from({ length: 9 }, (_, i) => {
    const height = [8, 17, 11, 24, 15, 20, 10, 16, 7][i];
    return `<rect class="meter" x="${i * 7}" y="${24 - height}" width="3" height="${height}" fill="#5cdcff" style="animation-delay:-${i * .21}s"/>`;
  }).join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="title desc">
<title id="title">Delthin — software, AI tools and playful interfaces</title>
<desc id="desc">A blue and white game-menu-inspired profile banner with diagonal lettering, drifting water rings, and a yellow cursor. Decorative animation respects reduced motion.</desc>
<defs>
  <linearGradient id="water" x1="0" y1="0" x2="1" y2="1">
    <stop stop-color="#1066cf"/><stop offset=".5" stop-color="#06429a"/><stop offset="1" stop-color="#061b46"/>
  </linearGradient>
  <pattern id="grid" width="42" height="42" patternUnits="userSpaceOnUse" patternTransform="rotate(-9)">
    <path d="M42 0H0V42" fill="none" stroke="${foreground}" stroke-opacity=".055"/>
  </pattern>
  <clipPath id="right"><polygon points="${right}"/></clipPath>
  <clipPath id="left"><polygon points="${left}"/></clipPath>
</defs>
<style>
  .current { animation: current 12s ease-in-out infinite; transform-origin:${cx}px ${cy}px; }
  .cursor { animation: cursor 5s ease-in-out infinite; }
  .meter { animation: meter 2.8s ease-in-out infinite; transform-box:fill-box; transform-origin:bottom; }
  @keyframes current { 0%,100% {transform:rotate(-4deg) scale(1)} 50% {transform:rotate(5deg) scale(1.06)} }
  @keyframes cursor { 0%,100% {transform:translateX(0)} 50% {transform:translateX(7px)} }
  @keyframes meter { 0%,100% {transform:scaleY(.6)} 50% {transform:scaleY(1)} }
  @media (prefers-reduced-motion:reduce) { .current,.cursor,.meter {animation:none} }
</style>
<rect width="${w}" height="${h}" fill="url(#water)"/>
<g clip-path="url(#right)">
  <path d="M440 -80L760 -80L480 480L160 480Z" fill="#28bfff" opacity=".07"/>
  <g class="current">${rings}
    <circle cx="${cx + 106}" cy="${cy - 74}" r="5" fill="#70e3ff"/>
    <circle cx="${cx - 130}" cy="${cy + 45}" r="8" fill="none" stroke="#7eeaff" stroke-opacity=".6"/>
  </g>
  ${mobile ? '' : ink('D', 705, 288, 286, 'none', 'stroke="#d3f5ff" stroke-width="1.4" opacity=".85"')}
  ${mobile ? ink('KEEP PLAYING.', 33, 431, 47, '#ffffff') : ink('KEEP', 764, 161, 56, '#ffffff') + ink('PLAYING.', 724, 214, 56, '#ffffff')}
  ${label('EXPERIMENTS IN CODE', mobile ? 34 : 712, mobile ? 460 : 251, '#8ddfff', mobile ? 11 : 10)}
  <g transform="translate(${mobile ? 482 : 887} ${mobile ? 422 : 306})">${sound}</g>
  <polygon class="cursor" points="${mobile ? '480,357 504,367 479,380 485,368' : '929,102 956,114 927,128 935,114'}" fill="#ffe375"/>
</g>
<polygon points="${left}" fill="${paper}"/>
<g clip-path="url(#left)">
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  <path d="M${mobile ? 559 : 612} -30L${mobile ? 450 : 505} 420" stroke="#33c5f3" stroke-width="3" opacity=".45"/>
  <path d="M${mobile ? 573 : 626} -30L${mobile ? 464 : 519} 420" stroke="${foreground}" stroke-width="7" opacity=".055"/>
  ${ink('01', 34, 58, 49, foreground)}
  ${label('PERSONAL ARCHIVE', 94, 37, foreground, 10)}
  ${label('CODE / TOOLS / PLAY', 94, 54, secondary, 9)}
  <g transform="rotate(-5 ${mobile ? 270 : 280} 194)">
    <polygon points="27,${mobile ? 201 : 215} ${mobile ? 542 : 566},${mobile ? 177 : 190} ${mobile ? 520 : 540},${mobile ? 201 : 213} 44,${mobile ? 224 : 239}" fill="#ff5f81"/>
    ${ink('DELTHIN', 39, mobile ? 213 : 232, mobile ? 149 : 158, foreground)}
    <path d="M43 ${mobile ? 232 : 251}L${mobile ? 514 : 534} ${mobile ? 210 : 228}" stroke="#ff5f81" stroke-width="1.5"/>
  </g>
  ${label('SOFTWARE ENGINEERING', 41, mobile ? 279 : 294, foreground, mobile ? 12 : 13)}
  ${label('TSINGHUA UNIVERSITY', 41, mobile ? 303 : 318, secondary, mobile ? 11 : 11)}
</g>
</svg>\n`.replace(/[ \t]+$/gm, '');
}

await mkdir(new URL('assets/', root), { recursive: true });
for (const dark of [false, true]) {
  for (const mobile of [false, true]) {
    const filename = `assets/hero${dark ? '-dark' : ''}${mobile ? '-mobile' : ''}.svg`;
    await writeFile(new URL(filename, root), hero({ dark, mobile }));
    console.log(filename);
  }
}
