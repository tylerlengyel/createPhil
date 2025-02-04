// public/traitGeneration/eyesTrait.js

const SVG_NS = "http://www.w3.org/2000/svg";
const CANVAS_SIZE = 420;

/**
 * Returns a random hex color string.
 */
function getRandomColor() {
  return '#' + Math.floor(Math.random() * 0xFFFFFF)
    .toString(16)
    .padStart(6, '0');
}

/**
 * Helper function to fetch and parse JSON from a given URL.
 * @param {string} url - The URL to fetch.
 * @returns {Promise<Object>} The parsed JSON data.
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url}`);
  }
  return await response.json();
}

/**
 * Generates a basic Eyes trait SVG.
 * It expects the data to include two parts:
 *   - eyes: an object with at least a "pathData" property (and optionally "viewBox")
 *   - frames: an object with at least a "pathData" property (and optionally "viewBox")
 *
 * If no data is provided, it automatically fetches the JSON files for the "common" rarity:
 *   - /traits_json/eyes_common.json
 *   - /traits_json/frames_common.json
 *
 * @param {string} [rarity="common"] - The rarity level (e.g., "common", "rare", etc.).
 * @param {Object} [jsonData] - An object with properties "eyes" and "frames".
 * @returns {Promise<string>} A Promise that resolves to the serialized SVG string.
 */
export async function generateTrait(rarity = "common", jsonData) {
  // If no data is provided, fetch the default JSON files.
  if (!jsonData) {
    const baseURL = "/traits_json";
    const eyesURL = `${baseURL}/eyes_${rarity}.json`;
    const framesURL = `${baseURL}/frames_${rarity}.json`;
    const [eyesData, framesData] = await Promise.all([
      fetchJSON(eyesURL),
      fetchJSON(framesURL)
    ]);
    jsonData = {
      eyes: eyesData,
      frames: framesData
    };
  }

  // Validate that both parts contain pathData.
  if (
    !jsonData.eyes || !jsonData.eyes.pathData ||
    !jsonData.frames || !jsonData.frames.pathData
  ) {
    throw new Error("Missing pathData for one or both parts of the Eyes trait.");
  }

  // Generate random colors for each part.
  const colorEyes = getRandomColor();
  const colorFrames = getRandomColor();

  // Use the viewBox from the eyes data if provided; otherwise, default to 0 0 420 420.
  const viewBox = jsonData.eyes.viewBox || `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`;

  // Create the SVG with two paths.
  const svg = `
    <svg xmlns="${SVG_NS}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="${viewBox}">
      <path d="${jsonData.eyes.pathData}" fill="${colorEyes}" />
      <path d="${jsonData.frames.pathData}" fill="${colorFrames}" />
    </svg>
  `;
  
  return svg.trim();
}