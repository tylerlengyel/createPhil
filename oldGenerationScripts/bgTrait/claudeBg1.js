import { generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

function componentToHex(c) {
  const hex = Math.round(c).toString(16);
  return hex.length === 1 ? '0' + hex : hex;
}

function hslToHex(h, s, l) {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color);
  };
  return `#${componentToHex(f(0))}${componentToHex(f(8))}${componentToHex(f(4))}`;
}

function generateColorPalette() {
  const baseHue = getSecureRandomNumber() * 360;
  return {
    core: hslToHex(baseHue + 30, 80, 70),
    arms: [
      hslToHex(baseHue - 20, 70, 60),
      hslToHex(baseHue + 340, 80, 70),
      hslToHex(baseHue + 190, 60, 70)
    ],
    dust: hslToHex(baseHue + 210, 70, 80),
    stars: hslToHex(baseHue + 60, 20, 90)
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
      const color = palette.arms[i % palette.arms.length];
      
      armContent += `<circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="${opacity}"/>`;
      
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
    <circle cx="${WIDTH/2}" cy="${HEIGHT/2}" r="${coreRadius}" fill="url(#coreGlow)"/>
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
  const numArms = 4;
  
  let svgContent = `
    <svg xmlns="${SVG_NS}" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
      <rect width="100%" height="100%" fill="#000000"/>
      ${addBackgroundStars(palette)}
  `;
  
  for (let i = 0; i < numArms; i++) {
    svgContent += createSpiralArm(WIDTH/2, HEIGHT/2, i, numArms, palette);
  }
  
  svgContent += addGalaxyCore(palette);
  svgContent += '</svg>';
  
  return svgContent;
}