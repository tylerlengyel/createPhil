// public/traitGeneration/bgTrait.js
import { generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

/**
 * Utility to convert [0..255] to two-digit hex.
 */
function componentToHex(c) {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Convert HSL (degrees, %, %) to #RRGGBB.
 */
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

/**
 * Generate a palette that’s heavily biased toward
 * blues/purples/pinks for the nebula background,
 * but also a planet color, star color, and star flare color.
 */
function generateColorPalette() {
  // Nebula base hue (180..300 for a bluish/purple look)
  const nebulaBase = 180 + getSecureRandomNumber() * 120;

  // Generate 3..5 cloud colors
  const cloudCount = 3 + Math.floor(getSecureRandomNumber() * 3);
  const cloudColors = [];
  for (let i = 0; i < cloudCount; i++) {
    const hue = (nebulaBase + getSecureRandomNumber() * 60 - 30 + 360) % 360;
    const sat = 40 + getSecureRandomNumber() * 50;  // 40..90
    const lit = 20 + getSecureRandomNumber() * 40;  // 20..60
    cloudColors.push(hslToHex(hue, sat, lit));
  }

  // Star color: near‐white or faintly tinted
  const starHue = getSecureRandomNumber() * 360;
  const starSat = 10 + getSecureRandomNumber() * 20;  
  const starLit = 70 + getSecureRandomNumber() * 30; 
  const starColor = hslToHex(starHue, starSat, starLit);

  // Planet color: random in any hue or near Earthlike (greens/browns)? 
  // Let's pick any hue but keep saturation/lightness moderate
  const planetHue = getSecureRandomNumber() * 360;
  const planetSat = 30 + getSecureRandomNumber() * 50;
  const planetLit = 30 + getSecureRandomNumber() * 20;
  const planetBaseColor = hslToHex(planetHue, planetSat, planetLit);

  // Star flare color: bright white or a light tinted color
  const flareHue = getSecureRandomNumber() * 360;
  const flareSat = 20 + getSecureRandomNumber() * 40;
  const flareLit = 80 + getSecureRandomNumber() * 20;
  const flareColor = hslToHex(flareHue, flareSat, flareLit);

  return {
    cloudColors,
    starColor,
    planetBaseColor,
    flareColor
  };
}

/**
 * Create big elliptical cloud shapes with radial gradients.
 */
function createNebulaClouds(palette) {
  const cloudCount = 5 + Math.floor(getSecureRandomNumber() * 4); // e.g. 5..8

  let defsContent = "";
  let cloudsContent = "";

  for (let i = 0; i < cloudCount; i++) {
    const color = palette.cloudColors[Math.floor(getSecureRandomNumber() * palette.cloudColors.length)];
    const gradId = `nebulaGrad${i}`;

    defsContent += `
      <radialGradient id="${gradId}">
        <stop offset="0%" stop-color="${color}" stop-opacity="${0.5 + getSecureRandomNumber() * 0.4}"/>
        <stop offset="60%" stop-color="${color}" stop-opacity="0.1"/>
        <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
      </radialGradient>
    `;

    // random position, size, rotation
    const cx = getSecureRandomNumber() * WIDTH;
    const cy = getSecureRandomNumber() * HEIGHT;
    const rx = WIDTH * (0.2 + getSecureRandomNumber() * 0.4);
    const ry = HEIGHT * (0.2 + getSecureRandomNumber() * 0.4);
    const rotation = getSecureRandomNumber() * 360;

    cloudsContent += `
      <ellipse
        cx="${cx}" cy="${cy}"
        rx="${rx}" ry="${ry}"
        fill="url(#${gradId})"
        transform="rotate(${rotation}, ${cx}, ${cy})"
      />
    `;
  }

  return `
    <defs>
      ${defsContent}
    </defs>
    ${cloudsContent}
  `;
}

/**
 * Random background stars.
 */
function addBackgroundStars(palette) {
  const numStars = 250;
  let starField = "";

  for (let i = 0; i < numStars; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const size = getSecureRandomNumber() * 1.5 + 0.5;
    const opacity = 0.4 + getSecureRandomNumber() * 0.6;

    starField += `
      <circle
        cx="${x}"
        cy="${y}"
        r="${size}"
        fill="${palette.starColor}"
        opacity="${opacity}"
      />
    `;
  }

  return starField;
}

/**
 * Adds a planet near the top‐right corner.
 * We define a radial gradient to simulate shading.
 */
function addPlanet(palette) {
  // choose planet radius 
  const planetRadius = 40 + getSecureRandomNumber() * 60;
  // position near top-right but add some variation
  const cx = WIDTH - planetRadius - 10 - getSecureRandomNumber() * 30;
  const cy = 10 + planetRadius + getSecureRandomNumber() * 60;

  // define gradient
  const gradId = "planetGrad";
  // add a subtle highlight or "terminator" 
  const highlightOpacity = 0.8;

  const defs = `
    <defs>
      <radialGradient id="${gradId}">
        <!-- Bright highlight in top-left of planet -->
        <stop offset="0%" stop-color="#ffffff" stop-opacity="${highlightOpacity}"/>
        <stop offset="40%" stop-color="${palette.planetBaseColor}" stop-opacity="0.8"/>
        <!-- Darker on the right edge -->
        <stop offset="100%" stop-color="${palette.planetBaseColor}" stop-opacity="0.3"/>
      </radialGradient>
    </defs>
  `;

  const planetCircle = `
    <circle
      cx="${cx}"
      cy="${cy}"
      r="${planetRadius}"
      fill="url(#planetGrad)"
    />
  `;

  return defs + planetCircle;
}

/**
 * Add a few big star flares scattered around:
 * We'll draw them as polygons or star shapes with
 * a bright fill and partial opacity or gradient.
 */
function addStarFlares(palette) {
  const flareCount = 3 + Math.floor(getSecureRandomNumber() * 3); // 3..5
  let flares = "";

  for (let i = 0; i < flareCount; i++) {
    // random position
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;

    // random size for the flare
    const radius = 20 + getSecureRandomNumber() * 30; 
    // how many points in the star
    const points = 4 + Math.floor(getSecureRandomNumber() * 5); // 4..8
    // some sort of spiky star shape
    const angleStep = (Math.PI * 2) / (points * 2);
    let pathData = "";
    for (let j = 0; j < points * 2; j++) {
      const angle = j * angleStep;
      // alternate between "outer" and "inner" radius
      const r = j % 2 === 0 ? radius : radius * 0.3; 
      const px = x + Math.cos(angle) * r;
      const py = y + Math.sin(angle) * r;
      pathData += j === 0 ? `M${px},${py}` : `L${px},${py}`;
    }
    pathData += "Z"; // close path

    // random rotation
    const rotation = getSecureRandomNumber() * 360;

    // We can do a bright fill with some opacity
    flares += `
      <path
        d="${pathData}"
        fill="${palette.flareColor}"
        fill-opacity="0.6"
        transform="rotate(${rotation}, ${x}, ${y})"
      />
    `;
  }

  return flares;
}

export function generateBackground() {
  const svgString = generateCosmicScene();
  validateSVGSize(svgString);
  return svgString;
}

function generateCosmicScene() {
  const palette = generateColorPalette();

  let svgContent = `
    <svg
      xmlns="${SVG_NS}"
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="0 0 ${WIDTH} ${HEIGHT}"
    >
      <!-- Background -->
      <rect width="100%" height="100%" fill="#000000"/>
      <!-- Nebula clouds -->
      ${createNebulaClouds(palette)}
      <!-- Stars -->
      ${addBackgroundStars(palette)}
      <!-- Planet -->
      ${addPlanet(palette)}
      <!-- Star flares -->
      ${addStarFlares(palette)}
    </svg>
  `;

  return svgContent;
}