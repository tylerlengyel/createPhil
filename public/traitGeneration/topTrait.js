// public/traitGeneration/topTrait.js

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
 * Fetches the JSON file from the given URL and returns the parsed JSON.
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
 * Generates a basic Top trait SVG.
 * If no jsonData is provided, it automatically fetches /traits_json/top_common.json.
 *
 * @param {Object} [jsonData] - An object with at least a "pathData" property and optionally a "viewBox".
 * @returns {Promise<string>} A Promise that resolves to the serialized SVG string.
 */
export async function generateTrait(jsonData) {
  // If no jsonData was provided, fetch the default JSON file.
  if (!jsonData) {
    jsonData = await fetchJSON("/traits_json/top_common.json");
  }

  if (!jsonData.pathData) {
    throw new Error("Missing pathData for Top trait.");
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