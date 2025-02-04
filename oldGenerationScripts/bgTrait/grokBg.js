// public/traitGeneration/bgTrait.js
import { hslToRgb, generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

// Constants
const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;
const MAX_ITERATIONS = 50;
const RESOLUTION = 2;

/**
 * Main background generation function.
 * Returns the generated SVG string.
 */
export function generateBackground() {
  const svgString = generateGalaxySVG();
  validateSVGSize(svgString);
  return svgString;
}

/**
 * Generates a fractal swirl pattern using the Julia set, ensuring all elements are within canvas bounds.
 */
function generateFractalSwirl(width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = getSecureRandomNumber() * 1.5 + 1.0;
  const hueBase = getSecureRandomNumber() * 360;
  const juliaConstant = {
    real: getSecureRandomNumber() * 0.6 - 0.3,
    imag: getSecureRandomNumber() * 0.6 - 0.3,
  };

  let svgContent = `<g>`;

  for (let x = 0; x < width; x += RESOLUTION) {
    for (let y = 0; y < height; y += RESOLUTION) {
      if (getSecureRandomNumber() > 0.08) continue;

      let zx = (x - centerX) / (width / scale);
      let zy = (y - centerY) / (height / scale);
      let iterations = MAX_ITERATIONS;

      while (zx * zx + zy * zy < 4 && iterations > 0) {
        const temp = zx * zx - zy * zy + juliaConstant.real;
        zy = 2.0 * zx * zy + juliaConstant.imag;
        zx = temp;
        iterations--;
      }

      if (iterations > 0) {
        const lightness = 50 + (50 * iterations) / MAX_ITERATIONS;
        const hue = (hueBase + Math.log(iterations + 1) * 10) % 360;
        const rgbColor = hslToRgb(hue, 100, lightness);
        // Ensure the circle stays within the canvas
        const clampedX = Math.max(RESOLUTION / 2, Math.min(x, WIDTH - RESOLUTION / 2));
        const clampedY = Math.max(RESOLUTION / 2, Math.min(y, HEIGHT - RESOLUTION / 2));

        svgContent += `
          <circle
            cx="${clampedX}"
            cy="${clampedY}"
            r="${RESOLUTION / 2}"
            fill="${rgbColor}"
            opacity="0.7"
          />
        `;
      }
    }
  }

  svgContent += `</g>`;
  return svgContent;
}

/**
 * Adds a central nebula glow to the SVG with enhanced brightness, ensuring it's within canvas bounds.
 */
function addNebulaGlow(svgContent, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const glowColors = ["#ff99cc", "#99ccff", "#ffcc99", "#66ffcc", "#ffff99"];
  const color = glowColors[Math.floor(getSecureRandomNumber() * glowColors.length)];

  return svgContent + `
    <defs>
      <radialGradient id="nebulaGlow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" stop-color="#ffffcc" stop-opacity="1" />
        <stop offset="50%" stop-color="#ffff99" stop-opacity="0.8" />
        <stop offset="100%" stop-color="black" stop-opacity="0" />
      </radialGradient>
    </defs>
    <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) / 3}" fill="url(#nebulaGlow)" />
  `;
}

/**
 * Adds dynamic swirling galaxy effect with multiple arms and varied star sizes/colors, ensuring all elements are within canvas bounds.
 */
function addDynamicSwirl(svgContent, width, height) {
  const centerX = width / 2;
  const centerY = height / 2;
  const numArms = Math.floor(getSecureRandomNumber() * 3) + 2;
  const pointsPerArm = 300;
  const armLength = getSecureRandomNumber() * 1.5 + 0.8;

  let swirlContent = `<g>`;

  for (let arm = 0; arm < numArms; arm++) {
    const armAngle = (arm / numArms) * Math.PI * 2;
    for (let point = 0; point < pointsPerArm; point++) {
      const t = point / pointsPerArm;
      const angle = armAngle + t * Math.PI * 4 * armLength;
      const radius = t * (Math.min(width, height) / 2) * armLength;

      let x = centerX + Math.cos(angle) * radius;
      let y = centerY + Math.sin(angle) * radius;

      // Declare starSize before using it
      const starSize = getSecureRandomNumber() * 2 + 0.5;
      
      // Clamp the coordinates to ensure they are within the canvas
      x = Math.max(0 + starSize, Math.min(x, WIDTH - starSize));
      y = Math.max(0 + starSize, Math.min(y, HEIGHT - starSize));

      const starColor = generateStarColor(point, pointsPerArm);

      swirlContent += `
        <circle
          cx="${x}"
          cy="${y}"
          r="${starSize}"
          fill="${starColor}"
          opacity="0.8"
        />
      `;
    }
  }

  swirlContent += `</g>`;
  return svgContent + swirlContent;
}

/**
 * Generates star color based on position in the arm.
 */
function generateStarColor(point, pointsPerArm) {
  const positionInArm = point / pointsPerArm;
  if (positionInArm < 0.33) {
    return hslToRgb(getSecureRandomNumber() * 60 + 180, 100, 50 + getSecureRandomNumber() * 30);
  } else {
    return hslToRgb(getSecureRandomNumber() * 60, 100, 50 + getSecureRandomNumber() * 30);
  }
}

/**
 * Adds background stars to simulate a star field, ensuring all stars are within canvas bounds.
 */
function addBackgroundStars(width, height) {
  let stars = '';
  for (let i = 0; i < 1000; i++) {
    let x = getSecureRandomNumber() * width;
    let y = getSecureRandomNumber() * height;
    let size = getSecureRandomNumber() * 0.5 + 0.1;
    let color = generateSecureRandomHexColor();
    
    // Clamp the coordinates to ensure they are within the canvas
    x = Math.max(0 + size, Math.min(x, WIDTH - size));
    y = Math.max(0 + size, Math.min(y, HEIGHT - size));

    stars += `
      <circle cx="${x}" cy="${y}" r="${size}" fill="${color}" opacity="0.3" />
    `;
  }
  return stars;
}

/**
 * Generates the complete galaxy SVG, ensuring all elements are within canvas bounds.
 */
function generateGalaxySVG() {
  let svgContent = `
    <svg xmlns="${SVG_NS}" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet">
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="black" />
      ${addBackgroundStars(WIDTH, HEIGHT)}
  `;

  svgContent += generateFractalSwirl(WIDTH, HEIGHT);
  svgContent = addNebulaGlow(svgContent, WIDTH, HEIGHT);
  svgContent = addDynamicSwirl(svgContent, WIDTH, HEIGHT);

  svgContent += `</svg>`;
  return svgContent;
}