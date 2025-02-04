// public/traitGeneration/bgTrait.js
import { getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

// Helper: HSL -> Hex
function componentToHex(c) {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return `#${componentToHex(f(0))}${componentToHex(f(8))}${componentToHex(f(4))}`;
}

/** Generate palette for nebula + star colors */
function generateSpacePalette() {
  const baseColors = [
    { h: 220, s: 80, l: 30 },
    { h: 240, s: 70, l: 25 },
    { h: 280, s: 60, l: 20 },
    { h: 200, s: 75, l: 35 }
  ];

  const colors = [];
  baseColors.forEach(base => {
    for (let i = 0; i < 3; i++) {
      const hueShift = getSecureRandomNumber() * 20 - 10;
      colors.push(
        hslToHex(
          (base.h + hueShift + 360) % 360,
          base.s + getSecureRandomNumber() * 15,
          base.l + getSecureRandomNumber() * 10
        )
      );
    }
  });

  // Star color near white
  const starHue = (getSecureRandomNumber() * 40 - 20 + 360) % 360;
  const starSat = 5 + getSecureRandomNumber() * 10;
  const starLit = 80 + getSecureRandomNumber() * 10;
  const starColor = hslToHex(starHue, starSat, starLit);

  // Random glow color in a bluish range
  const glowHue = 200 + getSecureRandomNumber() * 60;
  const glowSat = 40 + getSecureRandomNumber() * 40;
  const glowLit = 60 + getSecureRandomNumber() * 20;
  const glowColor = hslToHex(glowHue, glowSat, glowLit);

  return {
    cloudColors: colors,
    starColor,
    glowColor
  };
}

/**
 * Creates multiple overlapping fractal-noise layers for the nebula,
 * with reduced opacity so it doesn’t dominate.
 */
function createNebulaBackground(palette) {
  let defs = '<defs>';
  let patterns = '';

  const noisePatterns = 4 + Math.floor(getSecureRandomNumber() * 3); // 4..6

  for (let i = 0; i < noisePatterns; i++) {
    const filterId = `noise${i}`;
    const turbulenceScale = 0.002 + getSecureRandomNumber() * 0.003;

    defs += `
      <filter id="${filterId}">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="${turbulenceScale},${turbulenceScale * 0.5}"
          numOctaves="4" 
          seed="${Math.floor(getSecureRandomNumber() * 10000)}" 
          result="noise"
        />
        <feGaussianBlur stdDeviation="${2 + getSecureRandomNumber() * 3}" result="blurred" />
        <feColorMatrix type="saturate" values="1.3" in="blurred" result="colored" />
      </filter>
    `;

    const color = palette.cloudColors[Math.floor(getSecureRandomNumber() * palette.cloudColors.length)];
    // Lower the opacity range
    const layerOpacity = 0.05 + getSecureRandomNumber() * 0.1;

    patterns += `
      <rect 
        width="100%" 
        height="100%" 
        filter="url(#${filterId})"
        fill="${color}"
        opacity="${layerOpacity}"
      />
    `;
  }

  defs += '</defs>';
  return defs + patterns;
}

/**
 * Draws 1 or 2 small swirl “galaxies,” each at a random position.
 * They are tighter because:
 *  - we spin from 0° to 720° (two full turns)
 *  - we use a small angle step (2°) => more points => closer “lines.”
 */
function addGalaxySwirls() {
  let swirlSVG = '';
  const swirlCount = 1 + Math.floor(getSecureRandomNumber() * 2); // 1..2 swirls

  for (let s = 0; s < swirlCount; s++) {
    // Random center
    const swirlCenterX = getSecureRandomNumber() * WIDTH;
    const swirlCenterY = getSecureRandomNumber() * HEIGHT;

    // Random swirl radius: 5..10% of the smaller dimension
    const swirlMaxRadiusPct = 5 + getSecureRandomNumber() * 5; // 5..10
    const swirlMaxRadius = (swirlMaxRadiusPct / 100) * Math.min(WIDTH, HEIGHT);

    // We'll do an Archimedean spiral for angles [0..720°] with 2 arms
    // offset by 180°, step 2° each iteration => 361 steps
    const angleStep = 2; 
    for (let angleDeg = 0; angleDeg <= 720; angleDeg += angleStep) {
      // fraction goes 0..1 for 0..720
      const fraction = angleDeg / 720;
      const radius = swirlMaxRadius * fraction;

      [0, 180].forEach(offsetDeg => {
        const theta = (angleDeg + offsetDeg) * (Math.PI / 180);
        const x = swirlCenterX + radius * Math.cos(theta);
        const y = swirlCenterY + radius * Math.sin(theta);

        // Slight random color shift near a bright hue
        const swirlHueShift = (getSecureRandomNumber() * 80 + 160) % 360; // e.g. range around 160..240
        const swirlStarColor = hslToHex(swirlHueShift, 40, 60);

        // Dot size slightly random
        const dotSize = 0.7 + getSecureRandomNumber() * 0.4;

        swirlSVG += `
          <circle
            cx="${x}"
            cy="${y}"
            r="${dotSize}"
            fill="${swirlStarColor}"
            opacity="0.9"
          />
        `;
      });
    }
  }

  return swirlSVG;
}

/**
 * Adds random stars as small, faint circles (350..450).
 */
function addStars(palette) {
  const starCount = 350 + Math.floor(getSecureRandomNumber() * 101);
  const stars = [];

  for (let i = 0; i < starCount; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const size = 0.3 + getSecureRandomNumber() * 0.7;
    const opacity = 0.2 + getSecureRandomNumber() * 0.6;

    stars.push(`
      <circle
        cx="${x}"
        cy="${y}"
        r="${size}"
        fill="${palette.starColor}"
        opacity="${opacity}"
      />
    `);
  }

  return stars.join('');
}

/** Large faint glows scattered around */
function addStarGlows(palette) {
  const glows = [];
  const glowCount = 6 + Math.floor(getSecureRandomNumber() * 3);

  for (let i = 0; i < glowCount; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const baseSize = 10 + getSecureRandomNumber() * 15;

    const layers = [
      { radius: baseSize * 3, opacity: 0.04 },
      { radius: baseSize * 2, opacity: 0.07 },
      { radius: baseSize,     opacity: 0.12 }
    ];
    if (getSecureRandomNumber() > 0.5) {
      layers.push({ radius: baseSize * 0.6, opacity: 0.2 });
    }

    layers.forEach(layer => {
      glows.push(`
        <circle
          cx="${x}"
          cy="${y}"
          r="${layer.radius}"
          fill="${palette.glowColor}"
          opacity="${layer.opacity}"
        />
      `);
    });
  }

  return glows.join('');
}

export function generateBackground() {
  const svgString = generateCosmicScene();
  validateSVGSize(svgString);
  return svgString;
}

function generateCosmicScene() {
  const palette = generateSpacePalette();

  return `
    <svg
      xmlns="${SVG_NS}"
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="0 0 ${WIDTH} ${HEIGHT}"
    >
      <!-- Dark background -->
      <rect width="100%" height="100%" fill="#000810"/>

      <!-- Overlapping fractal-noise nebula layers (reduced opacity) -->
      ${createNebulaBackground(palette)}

      <!-- Background stars -->
      ${addStars(palette)}

      <!-- Large faint glows -->
      ${addStarGlows(palette)}

      <!-- One or two tighter galaxy swirls, in random positions -->
      ${addGalaxySwirls()}
    </svg>
  `;
}