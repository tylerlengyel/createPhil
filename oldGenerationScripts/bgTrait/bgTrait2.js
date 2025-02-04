// public/traitGeneration/bgTrait_v3.js
import { getSecureRandomNumber } from "../utils/colorUtils.js";
import { validateSVGSize } from "../utils/sizeValidation.js";

// Constants
const SVG_NS = "http://www.w3.org/2000/svg";
const WIDTH = 469;
const HEIGHT = 469;

/**
 * Main background generation function.
 * Returns the generated SVG string.
 */
export function generateBackground() {
  const svgString = generateRealisticCosmicSVG();
  validateSVGSize(svgString);
  return svgString;
}

/**
 * Generates a realistic cosmic SVG background.
 * This includes a softly blurred nebula layer and a star field with uniform coloring.
 */
function generateRealisticCosmicSVG() {
  const defsContent = generateDefs();
  const nebulaClouds = generateNebulaClouds();
  const starsContent = generateStarField();

  const svgContent = `
    <svg xmlns="${SVG_NS}" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" preserveAspectRatio="xMidYMid meet">
      <!-- Base background -->
      <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="black" />
      
      ${defsContent}
      ${nebulaClouds}
      ${starsContent}
    </svg>
  `;
  return svgContent;
}

/**
 * Generates definitions for SVG filters and gradients.
 * Includes a gaussian blur filter for softening nebula edges and a limited set of radial gradients.
 */
function generateDefs() {
  let defs = `<defs>
    <!-- Blur filter for nebula clouds -->
    <filter id="nebulaBlur">
      <feGaussianBlur in="SourceGraphic" stdDeviation="20" />
    </filter>
  `;

  // Pre-defined realistic nebula color palette (soft blues and pinks)
  const nebulaColors = ["#a0c4ff", "#ffc6ff", "#bde0fe"];
  nebulaColors.forEach((color, index) => {
    defs += `
      <radialGradient id="nebulaGradient${index}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.8" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0" />
      </radialGradient>
    `;
  });

  defs += `</defs>`;
  return defs;
}

/**
 * Generates nebula clouds as blurred ellipses.
 * Uses a limited set of gradients and applies the blur filter for a more natural, flowing appearance.
 */
function generateNebulaClouds() {
  // Use 2 to 3 clouds from the pre-defined gradients
  const numClouds = Math.floor(getSecureRandomNumber() * 2) + 2;
  let clouds = `<g filter="url(#nebulaBlur)">`;
  
  for (let i = 0; i < numClouds; i++) {
    // Randomly choose one of the limited gradients (0 to 2)
    const gradientIndex = Math.floor(getSecureRandomNumber() * 3);
    // Position and size of the cloud are randomized for natural variation
    const cx = getSecureRandomNumber() * WIDTH;
    const cy = getSecureRandomNumber() * HEIGHT;
    const rx = 50 + getSecureRandomNumber() * 100; // between 50 and 150
    const ry = 50 + getSecureRandomNumber() * 100; // between 50 and 150

    clouds += `
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#nebulaGradient${gradientIndex})" />
    `;
  }
  
  clouds += `</g>`;
  return clouds;
}

/**
 * Generates a star field with stars of uniform color.
 * Each star is a small circle with a slight variation in size and opacity.
 */
function generateStarField() {
  // Create a fixed number of stars (e.g., 250)
  const numStars = 250;
  let stars = `<g>`;
  
  for (let i = 0; i < numStars; i++) {
    const x = getSecureRandomNumber() * WIDTH;
    const y = getSecureRandomNumber() * HEIGHT;
    // Star sizes vary slightly for a natural look
    const starSize = 0.3 + getSecureRandomNumber() * 0.9;
    // All stars use a similar white color, with minor opacity variations (range 0.8 - 1)
    const opacity = (0.8 + getSecureRandomNumber() * 0.2).toFixed(2);
    
    stars += `
      <circle cx="${x}" cy="${y}" r="${starSize}" fill="#ffffff" opacity="${opacity}" />
    `;
  }
  
  stars += `</g>`;
  return stars;
}