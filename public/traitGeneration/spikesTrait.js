// public/traitGeneration/spikesTrait.js

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
 * Helper: Fetches and parses JSON from the given URL.
 * @param {string} url - The URL of the JSON file.
 * @returns {Promise<Object>} The parsed JSON.
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url}`);
  }
  return await response.json();
}

/**
 * Generates a basic Spikes trait SVG.
 * Expects jsonData to be an object with at least a "pathData" property (and optionally "viewBox").
 * If no jsonData is provided, it automatically fetches /traits_json/spikes_common.json (or other rarity if specified).
 *
 * @param {string} [rarity="common"] - The rarity level (e.g., "common", "rare", etc.).
 * @param {Object} [jsonData] - The JSON data containing the path information.
 * @returns {Promise<string>} A Promise that resolves to the serialized SVG string.
 */
export async function generateTrait(rarity = "common", jsonData) {
  // If no JSON data is provided, fetch the default file.
  if (!jsonData) {
    jsonData = await fetchJSON(`/traits_json/spikes_${rarity}.json`);
  }

  if (!jsonData.pathData) {
    throw new Error("Missing pathData for Spikes trait.");
  }

  const color = getRandomColor();
  const viewBox = jsonData.viewBox || `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`;
  const svg = `
    <svg xmlns="${SVG_NS}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="${viewBox}">
      <path d="${jsonData.pathData}" fill="${color}" />
    </svg>
  `;
  
  return svg.trim();
}