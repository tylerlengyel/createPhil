// public/traitGeneration/bgTrait.js
import { hslToRgb, generateSecureRandomHexColor, getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;
const RESOLUTION = 1;

// Max iterations for fractal swirl calculations
const MAX_ITERATIONS = 40;

export function generateBackground() {
  const svgString = generateGalaxySVG();
  validateSVGSize(svgString);
  return svgString;
}

/**
 * 1) Generate a “galaxy-appropriate” color palette:
 *    - Strong golden/white core
 *    - Pinkish/blueish arms
 *    - Slight variations for dust
 *    - Soft white for background stars
 */
function generateColorPalette() {
  // Instead of totally random baseHue, pick a narrower range that’s starry/galactic:
  // e.g. around 220-280 for a cooler (blue/purple) theme, plus warm pinks near the center
  const baseHue = 220 + getSecureRandomNumber() * 60; 

  return {
    // Brighter gold/white for core
    core: `hsl(${40 + getSecureRandomNumber()*10}, 80%, 70%)`, 
    // A small set of pink/blue arm colors
    arms: [
      `hsl(${baseHue},   70%, 60%)`,
      `hsl(${baseHue+30}, 70%, 65%)`,
      `hsl(${baseHue+60}, 70%, 70%)`
    ],
    // Dust, slightly darker
    dust: `hsl(${baseHue + 20}, 50%, 40%)`,
    // White-ish stars
    stars: `hsl(${baseHue + 100}, 10%, 90%)`
  };
}

/**
 * 2) Add a fractal “swirl” layer for a nebulous background.
 *    Similar to a Julia set approach, but we keep the color range narrower
 *    and skip fewer points so it fills out more smoothly.
 */
function addFractalSwirl(width, height, palette) {
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = getSecureRandomNumber() * 1.2 + 0.8;
  const juliaConstant = {
    real: getSecureRandomNumber() * 0.4 - 0.2,
    imag: getSecureRandomNumber() * 0.4 - 0.2
  };

  // Set a maximum galaxy radius so we ignore far edges
  const maxGalaxyRadius = width * 0.45;

  let content = `<g>`;

  for (let x = 0; x < width; x += RESOLUTION) {
    for (let y = 0; y < height; y += RESOLUTION) {
      // 1) Check how far from center
      const dist = Math.hypot(x - centerX, y - centerY);
      // 2) Skip if it’s outside our “galaxy boundary”
      if (dist > maxGalaxyRadius) continue;

      // Optionally reduce skipping if you want denser fill
      if (getSecureRandomNumber() > 0.90) continue;

      // Fractal swirl logic...
      let zx = (x - centerX) / (width / scale);
      let zy = (y - centerY) / (height / scale);

      let iterations = MAX_ITERATIONS;
      while (zx * zx + zy * zy < 4 && iterations > 0) {
        const temp = zx * zx - zy * zy + juliaConstant.real;
        zy = 2.0 * zx * zy + juliaConstant.imag;
        zx = temp;
        iterations--;
      }

      // Only color if still in the set
      if (iterations > 0) {
        const distRatio = dist / maxGalaxyRadius;
        // your hue/saturation/lightness math...
        const hue = (240 + distRatio * 60) % 360;
        const saturation = 70 + distRatio * 20;
        const light = 60 - distRatio * 20;
        const rgbColor = hslToRgb(hue, saturation, light);

        const opacity = 0.3 + 0.3 * (1 - distRatio);

        content += `
          <circle
            cx="${x}"
            cy="${y}"
            r="${RESOLUTION / 2}"
            fill="${rgbColor}"
            opacity="${opacity}"
          />
        `;
      }
    }
  }

  content += `</g>`;
  return content;
}

/**
 * 3) Create each spiral arm with gentle swirling. 
 *    Uses the palette’s arms/dust colors, plus small animations.
 */
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
      // Fade out near edges
      const opacity = Math.pow(1 - t, 0.5) * 0.8;
      const size = (1 - t) * 3 + 0.5;
      // Cycle through arms color array
      const colorIndex = i % palette.arms.length;
      const color = palette.arms[colorIndex];
      
      armContent += `
        <circle cx="${x}" cy="${y}" r="${size}"
          fill="${color}" opacity="${opacity}">
          <animate attributeName="opacity"
            values="${opacity};${opacity * 0.7};${opacity}"
            dur="${2 + getSecureRandomNumber() * 3}s"
            repeatCount="indefinite"/>
        </circle>
      `;
      
      // Add dust clouds along arms
      if (getSecureRandomNumber() < 0.3) {
        const cloudSize = getSecureRandomNumber() * 15 + 5;
        armContent += `
          <circle cx="${x}" cy="${y}" r="${cloudSize}"
            fill="${palette.dust}" opacity="${opacity * 0.3}">
          </circle>
        `;
      }
    }
  }
  return armContent;
}

/**
 * 4) Add a brighter, pulsating galaxy core with a golden/white glow.
 */
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
    <circle cx="${WIDTH/2}" cy="${HEIGHT/2}" r="${coreRadius}"
      fill="url(#coreGlow)">
      <animate attributeName="r"
        values="${coreRadius};${coreRadius * 1.1};${coreRadius}"
        dur="4s" repeatCount="indefinite"/>
    </circle>
  `;
}

/**
 * 5) Add twinkling background stars behind everything.
 */
function addBackgroundStars(palette) {
  let starField = '';
  const numStars = 200;
  
  for (let i = 0; i < numStars; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    const size = getSecureRandomNumber() * 1.5 + 0.5;
    const opacity = getSecureRandomNumber() * 0.8 + 0.2;
    
    starField += `
      <circle cx="${x}" cy="${y}" r="${size}"
        fill="${palette.stars}" opacity="${opacity}">
        <animate attributeName="opacity"
          values="${opacity};${opacity * 0.5};${opacity}"
          dur="${1 + getSecureRandomNumber() * 2}s"
          repeatCount="indefinite"/>
      </circle>
    `;
  }
  return starField;
}

/**
 * 6) Assemble the final SVG with:
 *    - black background
 *    - fractal swirl layer
 *    - star field
 *    - spiral arms
 *    - bright core on top
 */
function generateGalaxySVG() {
  const palette = generateColorPalette();
  const numArms = 4;
  
  let svgContent = `
    <svg
      xmlns="${SVG_NS}"
      width="${WIDTH}"
      height="${HEIGHT}"
      viewBox="0 0 ${WIDTH} ${HEIGHT}"
    >
      <rect width="100%" height="100%" fill="black"/>
  `;

  // Fractal swirl behind everything for a nebulous background
  svgContent += addFractalSwirl(WIDTH, HEIGHT, palette);

  // Twinkling background stars
  svgContent += addBackgroundStars(palette);

  // Add multiple spiral arms
  for (let i = 0; i < numArms; i++) {
    svgContent += createSpiralArm(WIDTH/2, HEIGHT/2, i, numArms, palette);
  }
  
  // Finally, put the bright core on top
  svgContent += addGalaxyCore(palette);

  svgContent += `</svg>`;
  return svgContent;
}