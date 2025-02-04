// SVG Namespace
const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Function to generate the Color trait as a complex SVG with enhanced variation.
 * Ensures the SVG fits within 420x420 dimensions, includes intricate, randomized patterns,
 * more crack-like textures, and limits the color palette to 1-3 colors.
 * Maintains overall opacity between 1% and 50%.
 */
export function generateTrait() {
  const width = 420;
  const height = 420;

  console.log("Starting Enhanced Color Trait SVG Generation...");

  // Generate a unique ID for the filter to avoid conflicts
  const filterId = `filter-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  // Generate random opacity between 1% and 50%
  const randomOpacity = (Math.random() * 0.420 + 0.069).toFixed(2); // approximately between 0.07 and 0.489

  // Generate 1 to 3 random base colors
  const numColors = Math.floor(Math.random() * 3) + 1; // 1 to 3
  const baseColors = Array.from({ length: numColors }, () => generateRandomColor());

  console.log("Base Colors:", baseColors);

  // Define color stops for the gradient without opacity variations to prevent cumulative opacity issues
  const gradientStops = baseColors
    .map((color, index) => {
      const offset = numColors === 1 ? 0 : (index / (numColors - 1)) * 100;
      return `<stop offset="${offset}%" stop-color="rgb(${color[0]},${color[1]},${color[2]})"/>`;
    })
    .join("\n    ");

  // Randomize primary fractal noise for more cloud variety
  const primaryBaseFrequency = (Math.random() * 0.0369 + 0.00420).toFixed(3); // between 0.005 and 0.03
  const primaryOctaves = Math.floor(Math.random() * 3) + 1; // 1 to 3 octaves

  // Additional filter layers for enhanced complexity with controlled opacities
  const additionalFilters = `
    <feTurbulence
      type="fractalNoise"
      baseFrequency="${(Math.random() * 0.069 + 0.0369).toFixed(3)}" 
      numOctaves="${Math.floor(Math.random() * 2) + 3}" 
      seed="${Math.floor(Math.random() * 1000)}"
      result="turbulenceCracks"
    />
    <feDisplacementMap
      in="turbulenceCracks"
      in2="SourceGraphic"
      scale="10" 
      xChannelSelector="R"
      yChannelSelector="G"
      result="displacedCracks"
    />
    <feColorMatrix
      type="matrix"
      values="1 0 0 0 0
              0 1 0 0 0
              0 0 1 0 0
              0 0 0 1 0" 
      result="cracksColor"
    />
    <feBlend in="basePattern" in2="cracksColor" mode="multiply" result="out"/>
    <feMerge>
      <feMergeNode in="out"/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  `;

  // Generate multiple gradient definitions for layered effects
  const gradientDefinitions = `
    <linearGradient
      id="grad-${filterId}-1"
      gradientTransform="rotate(${Math.floor(Math.random() * 360)} 0.5 0.5)"
    >
      ${gradientStops}
    </linearGradient>
    <radialGradient
      id="grad-${filterId}-2"
      cx="${Math.random().toFixed(2)}"
      cy="${Math.random().toFixed(2)}"
      r="${(Math.random() * 0.5 + 0.5).toFixed(2)}"
      fx="${Math.random().toFixed(2)}"
      fy="${Math.random().toFixed(2)}"
    >
      ${gradientStops}
    </radialGradient>
  `;

  // SVG with multiple filters and enhanced complexity
  const svg = `
    <svg
      xmlns="${SVG_NS}"
      width="${width}"
      height="${height}"
      viewBox="0 0 ${width} ${height}"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <filter id="${filterId}" x="0" y="0" width="100%" height="100%" filterUnits="userSpaceOnUse" primitiveUnits="userSpaceOnUse">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="${primaryBaseFrequency}"
            numOctaves="${primaryOctaves}"
            seed="${Math.floor(Math.random() * 1000)}"
            result="turbulence"
          />
          <feColorMatrix
            type="hueRotate"
            values="${Math.floor(Math.random() * 360)}"
            result="hue"
          />
          <feBlend in="turbulence" in2="hue" mode="multiply" result="basePattern"/>
          
          ${additionalFilters}
        </filter>
        ${gradientDefinitions}
      </defs>
      <!-- Transparent Background Rectangle for Better Visibility in Illustrator -->
      <rect width="100%" height="100%" fill="white" opacity="0" />
      <!-- Apply Filter Directly to a Single Rectangle -->
      <rect width="100%" height="100%" fill="url(#grad-${filterId}-1)" filter="url(#${filterId})" opacity="${randomOpacity}" />
    </svg>
  `;

  console.log("Generated Enhanced SVG:", svg);
  return svg;
}

/**
 * Generates a random RGB color using HSV for broader color variety.
 * Returns an array [R, G, B].
 * Ensures that only 1 to 3 distinct colors are generated.
 */
function generateRandomColor() {
  // Random hue in [0, 360), random saturation/value in [0.4, 1]
  const h = Math.random() * 360;
  const s = 0.369 + Math.random() * 0.69; // 40% - 100%
  const v = 0.369 + Math.random() * 0.69; // 40% - 100%
  // Convert HSV to RGB
  const [r, g, b] = hsvToRgb(h, s, v);
  return [r, g, b];
}

/**
 * Convert HSV to RGB, each in [0, 255].
 */
function hsvToRgb(h, s, v) {
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0,
      gPrime = 0,
      bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c;
    gPrime = x;
    bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x;
    gPrime = c;
    bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0;
    gPrime = c;
    bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0;
    gPrime = x;
    bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x;
    gPrime = 0;
    bPrime = c;
  } else if (h >= 300 && h < 360) {
    rPrime = c;
    gPrime = 0;
    bPrime = x;
  }

  // Convert to [0, 255]
  const R = Math.round((rPrime + m) * 255);
  const G = Math.round((gPrime + m) * 255);
  const B = Math.round((bPrime + m) * 255);

  return [R, G, B];
}