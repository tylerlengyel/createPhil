import { generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

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

function generateSpacePalette() {
  const baseColors = [
    { h: 220, s: 80, l: 30 }, // Deep blue
    { h: 240, s: 70, l: 25 }, // Navy
    { h: 280, s: 60, l: 20 }, // Dark purple
    { h: 200, s: 75, l: 35 }  // Bright blue
  ];

  const colors = [];
  baseColors.forEach(base => {
    for (let i = 0; i < 3; i++) {
      const hueShift = getSecureRandomNumber() * 20 - 10;
      colors.push(hslToHex(
        (base.h + hueShift + 360) % 360,
        base.s + getSecureRandomNumber() * 15,
        base.l + getSecureRandomNumber() * 10
      ));
    }
  });

  return {
    cloudColors: colors,
    starColor: '#FFFFFF',
    glowColor: hslToHex(220, 50, 70)
  };
}

function createNebulaBackground(palette) {
  let defs = '<defs>';
  let patterns = '';
  
  // Create darker base with more defined nebula structures
  const noisePatterns = 4;
  for (let i = 0; i < noisePatterns; i++) {
    const filterId = `noise${i}`;
    const turbulenceScale = 0.002 + getSecureRandomNumber() * 0.003;
    
    defs += `
      <filter id="${filterId}">
        <feTurbulence 
          type="fractalNoise" 
          baseFrequency="${turbulenceScale},${turbulenceScale * 0.5}"
          numOctaves="4" 
          seed="${Math.floor(getSecureRandomNumber() * 1000)}" 
        />
        <feGaussianBlur stdDeviation="${3 + getSecureRandomNumber() * 2}" />
        <feColorMatrix type="saturate" values="1.5" />
        <feComposite operator="arithmetic" k1="0" k2="1" k3="0" k4="0" />
      </filter>
    `;

    const color = palette.cloudColors[Math.floor(getSecureRandomNumber() * palette.cloudColors.length)];
    patterns += `
      <rect 
        width="100%" 
        height="100%" 
        filter="url(#${filterId})"
        fill="${color}"
        opacity="${0.2 + getSecureRandomNumber() * 0.15}"
      />
    `;
  }

  defs += '</defs>';
  return defs + patterns;
}

function addStarGlows(palette) {
  const glows = [];
  const glowCount = 6 + Math.floor(getSecureRandomNumber() * 3);

  for (let i = 0; i < glowCount; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const baseSize = 10 + getSecureRandomNumber() * 15;

    const layers = [
      { radius: baseSize * 3, opacity: 0.05 },
      { radius: baseSize * 2, opacity: 0.08 },
      { radius: baseSize, opacity: 0.15 },
      { radius: baseSize * 0.5, opacity: 0.3 }
    ];

    layers.forEach(layer => {
      glows.push(`
        <circle
          cx="${x}"
          cy="${y}"
          r="${layer.radius}"
          fill="${palette.glowColor}"
          opacity="${layer.opacity}"
        >
          <animate
            attributeName="opacity"
            values="${layer.opacity};${layer.opacity * 0.6};${layer.opacity}"
            dur="${2 + getSecureRandomNumber() * 3}s"
            repeatCount="indefinite"
          />
        </circle>
      `);
    });
  }

  return glows.join('');
}

function addStars(palette) {
  const stars = [];
  const starCount = 400;

  for (let i = 0; i < starCount; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const size = 0.3 + getSecureRandomNumber() * 0.7;
    const opacity = 0.3 + getSecureRandomNumber() * 0.7;

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

function addPlanet(palette) {
  const size = 60 + getSecureRandomNumber() * 20;
  const x = WIDTH - size - 20;
  const y = size + 20;
  
  const planetGradient = `
    <radialGradient id="planetGradient">
      <stop offset="0%" stop-color="#6C8BA3" stop-opacity="0.8"/>
      <stop offset="70%" stop-color="#45586B" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="#2A3744" stop-opacity="1"/>
    </radialGradient>
  `;

  return `
    <defs>${planetGradient}</defs>
    <circle 
      cx="${x}" 
      cy="${y}" 
      r="${size}"
      fill="url(#planetGradient)"
    />
  `;
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
      <rect width="100%" height="100%" fill="#000810"/>
      ${createNebulaBackground(palette)}
      ${addStars(palette)}
      ${addStarGlows(palette)}
      ${addPlanet(palette)}
    </svg>
  `;
}