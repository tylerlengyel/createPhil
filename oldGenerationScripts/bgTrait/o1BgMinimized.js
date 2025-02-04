// public/traitGeneration/bgTrait.js
import { generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

/**
 * Utility: round a number to 'decimals' places to reduce string length.
 */
function roundTo(num, decimals = 1) {
  return parseFloat(num.toFixed(decimals));
}

/**
 * Convert 0..255 to two-digit hex.
 */
function componentToHex(c) {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? "0" + hex : hex;
}

/**
 * Convert HSL to #RRGGBB (like before).
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
 * Same random palette logic, but unchanged.
 */
function generateColorPalette() {
  const baseHue = getSecureRandomNumber() * 360;
  const armCount = Math.floor(getSecureRandomNumber() * 2) + 3; // 3–4 colors

  const arms = [];
  for (let i = 0; i < armCount; i++) {
    const hue = (baseHue + getSecureRandomNumber() * 360) % 360;
    const sat = 50 + getSecureRandomNumber() * 50;
    const light = 40 + getSecureRandomNumber() * 40;
    arms.push(hslToHex(hue, sat, light));
  }
  
  const coreHue = (baseHue + 20 + getSecureRandomNumber() * 60) % 360;
  const coreSat = 60 + getSecureRandomNumber() * 20;
  const coreLight = 60 + getSecureRandomNumber() * 20;
  const coreColor = hslToHex(coreHue, coreSat, coreLight);

  const dustHue = (baseHue + 100 + getSecureRandomNumber() * 200) % 360;
  const dustSat = 30 + getSecureRandomNumber() * 40;
  const dustLight = 30 + getSecureRandomNumber() * 50;
  const dustColor = hslToHex(dustHue, dustSat, dustLight);

  const starHue = (baseHue + 200 + getSecureRandomNumber() * 160) % 360;
  const starSat = 10 + getSecureRandomNumber() * 40;
  const starLight = 70 + getSecureRandomNumber() * 20;
  const starColor = hslToHex(starHue, starSat, starLight);

  return {
    core: coreColor,
    arms,
    dust: dustColor,
    stars: starColor
  };
}

/**
 * Create each spiral arm:
 *  - Round x, y, size to 1 decimal place.
 *  - Lower dust probability from 0.3 to 0.2 to reduce the dust circles.
 */
function createSpiralArm(centerX, centerY, armIndex, totalArms, palette) {
  const points = 300;
  const maxRadius = WIDTH * 0.4;
  const rotationOffset = (armIndex / totalArms) * Math.PI * 2;
  const tightness = 0.3;
  let armContent = "";
  
  for (let i = 0; i < points; i++) {
    const t = i / points;
    const radius = t * maxRadius;
    const angle = rotationOffset + t * Math.PI * 4 + Math.sin(t * Math.PI) * tightness;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    // Round coordinates
    const xR = roundTo(x, 1);
    const yR = roundTo(y, 1);

    if (xR >= 0 && xR <= WIDTH && yR >= 0 && yR <= HEIGHT) {
      const opacity = Math.pow(1 - t, 0.5) * 0.8;
      const size = roundTo((1 - t) * 3 + 0.5, 1); // round radius too
      const color = palette.arms[i % palette.arms.length];
      
      armContent += `<circle cx="${xR}" cy="${yR}" r="${size}" fill="${color}" opacity="${roundTo(opacity,2)}"/>`;
      
      // Slightly reduce dust frequency from 0.3 to 0.2
      if (getSecureRandomNumber() < 0.2) {
        const cloudSize = roundTo(getSecureRandomNumber() * 15 + 5, 1);
        armContent += `<circle cx="${xR}" cy="${yR}" r="${cloudSize}" fill="${palette.dust}" opacity="${roundTo(opacity * 0.3,2)}"/>`;
      }
    }
  }
  return armContent;
}

/**
 * Galaxy core gradient stays the same, only difference is we remove
 * some line breaks from the final output in generateGalaxySVG().
 */
function addGalaxyCore(palette) {
  const coreRadius = WIDTH * 0.15;
  return `
    <defs><radialGradient id="coreGlow">
      <stop offset="0%" stop-color="${palette.core}" stop-opacity="1"/>
      <stop offset="50%" stop-color="${palette.core}" stop-opacity="0.5"/>
      <stop offset="100%" stop-color="${palette.core}" stop-opacity="0"/>
    </radialGradient></defs>
    <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="${coreRadius}" fill="url(#coreGlow)"/>
  `;
}

/**
 * Fewer stars (e.g. 150 instead of 200), plus rounding of positions/sizes.
 */
function addBackgroundStars(palette) {
  let starField = "";
  const numStars = 150; // down from 200
  
  for (let i = 0; i < numStars; i++) {
    const x = roundTo(getSecureRandomNumber() * WIDTH, 1);
    const y = roundTo(getSecureRandomNumber() * HEIGHT, 1);
    const size = roundTo(getSecureRandomNumber() * 1.5 + 0.5, 1);
    const opacity = roundTo(getSecureRandomNumber() * 0.8 + 0.2, 2);
    
    starField += `<circle cx="${x}" cy="${y}" r="${size}" fill="${palette.stars}" opacity="${opacity}"/>`;
  }
  return starField;
}

export function generateBackground() {
  const svgString = generateGalaxySVG();
  validateSVGSize(svgString);
  return svgString;
}

/**
 * Final assembly:
 *  - remove line breaks / indentation to shrink output
 *  - keep same random arms, core, stars
 */
function generateGalaxySVG() {
  const palette = generateColorPalette();
  const numArms = Math.floor(getSecureRandomNumber() * 4) + 3;

  let svgContent = `
    <svg xmlns="${SVG_NS}" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
    <rect width="100%" height="100%" fill="#000000"/>
    ${addBackgroundStars(palette)}
  `;
  
  for (let i = 0; i < numArms; i++) {
    svgContent += createSpiralArm(WIDTH / 2, HEIGHT / 2, i, numArms, palette);
  }
  
  svgContent += addGalaxyCore(palette);
  svgContent += `</svg>`;

  // Remove most line breaks and extra spaces to reduce file size
  // e.g. turning newlines + whitespace into single spaces.
  svgContent = svgContent.replace(/\s*\n\s*/g, " ");

  return svgContent.trim();
}
