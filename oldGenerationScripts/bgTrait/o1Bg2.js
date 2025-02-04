// public/traitGeneration/bgTrait.js
import { generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

/**
 * Utility to convert one 0-255 component to 2-digit hex.
 */
function componentToHex(c) {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

/**
 * Simple HSL->Hex converter.
 * h, s, l are numeric: hue in [0,360], sat/light in [0,100].
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
 * Create a more varied color palette:
 *  - arms: multiple random hues around baseHue
 *  - dust, stars, core: each with its own random offsets, saturations, lightness
 */
function generateColorPalette() {
  const baseHue = getSecureRandomNumber() * 360;
  
  // Generate an array of random arms colors (3 or 4)
  const armCount = Math.floor(getSecureRandomNumber() * 2) + 3; // 3–4 colors
  const arms = [];
  for (let i = 0; i < armCount; i++) {
    // Each arm color: random hue offset from baseHue
    const hue = (baseHue + getSecureRandomNumber() * 360) % 360;
    const sat = 50 + getSecureRandomNumber() * 50;    // 50–100%
    const light = 40 + getSecureRandomNumber() * 40;  // 40–80%
    arms.push(hslToHex(hue, sat, light));
  }
  
  // Core: choose a golden/white or random offset
  const coreHue = (baseHue + 20 + getSecureRandomNumber() * 60) % 360;
  const coreSat = 60 + getSecureRandomNumber() * 20;  // e.g. 60–80%
  const coreLight = 60 + getSecureRandomNumber() * 20;  
  const coreColor = hslToHex(coreHue, coreSat, coreLight);

  // Dust: a darker random offset
  const dustHue = (baseHue + 100 + getSecureRandomNumber() * 200) % 360;
  const dustSat = 30 + getSecureRandomNumber() * 40;  
  const dustLight = 30 + getSecureRandomNumber() * 50; 
  const dustColor = hslToHex(dustHue, dustSat, dustLight);

  // Stars: a brighter range of possible colors
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

function createSpiralArm(centerX, centerY, armIndex, totalArms, palette) {
  const points = 300;
  const maxRadius = WIDTH * 0.4;
  const rotationOffset = (armIndex / totalArms) * Math.PI * 2;
  const tightness = 0.3;
  let armContent = '';
  
  for (let i = 0; i < points; i++) {
    const t = i / points;
    const radius = t * maxRadius;
    const angle = rotationOffset + t * Math.PI * 4 + Math.sin(t * Math.PI) * tightness;
    const x = centerX + Math.cos(angle) * radius;
    const y = centerY + Math.sin(angle) * radius;
    
    if (x >= 0 && x <= WIDTH && y >= 0 && y <= HEIGHT) {
      const opacity = Math.pow(1 - t, 0.5) * 0.8;
      const size = (1 - t) * 3 + 0.5;
      // Cycle through the arms color array
      const color = palette.arms[i % palette.arms.length];
      
      armContent += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}"/>`;
      
      // Random dust clouds
      if (getSecureRandomNumber() < 0.3) {
        const cloudSize = getSecureRandomNumber() * 15 + 5;
        armContent += `<circle cx="${x}" cy="${y}" r="${cloudSize}" fill="${palette.dust}" opacity="${opacity * 0.3}"/>`;
      }
    }
  }
  return armContent;
}

function addGalaxyCore(palette) {
  const coreRadius = WIDTH * 0.15;
  return `
    <defs>
      <radialGradient id="coreGlow">
        <stop offset="0%" stop-color="${palette.core}" stop-opacity="1"/>
        <stop offset="50%" stop-color="${palette.core}" stop-opacity="0.5"/>
        <stop offset="100%" stop-color="${palette.core}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <circle cx="${WIDTH / 2}" cy="${HEIGHT / 2}" r="${coreRadius}" fill="url(#coreGlow)"/>
  `;
}

function addBackgroundStars(palette) {
  let starField = '';
  const numStars = 200;
  
  for (let i = 0; i < numStars; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const size = getSecureRandomNumber() * 1.5 + 0.5;
    const opacity = getSecureRandomNumber() * 0.8 + 0.2;
    
    starField += `<circle cx="${x}" cy="${y}" r="${size}" fill="${palette.stars}" opacity="${opacity}"/>`;
  }
  return starField;
}

export function generateBackground() {
  const svgString = generateGalaxySVG();
  validateSVGSize(svgString);
  return svgString;
}

function generateGalaxySVG() {
  const palette = generateColorPalette();
  // Randomize the number of arms from 3–6
  const numArms = Math.floor(getSecureRandomNumber() * 4) + 3;

  let svgContent = `
    <svg xmlns="${SVG_NS}" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <rect width="100%" height="100%" fill="#000000"/>
      ${addBackgroundStars(palette)}
  `;
  
  // Generate the spiral arms
  for (let i = 0; i < numArms; i++) {
    svgContent += createSpiralArm(WIDTH / 2, HEIGHT / 2, i, numArms, palette);
  }
  
  // Add the bright core last
  svgContent += addGalaxyCore(palette);
  svgContent += '</svg>';
  
  return svgContent;
}