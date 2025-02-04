// public/traitGeneration/wingsTrait.js

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
 * Fetches a JSON file from the given URL and returns the parsed JSON.
 * @param {string} url - The URL of the JSON file.
 * @returns {Promise<Object>} Parsed JSON data.
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url}`);
  }
  return await response.json();
}

/**
 * Generates a basic Wings trait SVG.
 * It fetches three JSON files based on the given rarity (e.g., "common") from /traits_json,
 * extracts the pathData from each, generates a random color for each path, and returns an SVG string.
 *
 * @param {string} [rarity="common"] - The rarity level to load (e.g., "common", "uncommon", "rare", "legendary").
 * @returns {Promise<string>} A Promise resolving to the generated SVG string.
 */
export async function generateTrait(rarity = "common") {
  // Define the base URL for the JSON files.
  const baseURL = "/traits_json";

  // Construct the URLs for each part.
  const topURL = `${baseURL}/wings_top_${rarity}.json`;
  const middleURL = `${baseURL}/wings_middle_${rarity}.json`;
  const bottomURL = `${baseURL}/wings_bottom_${rarity}.json`;

  // Fetch all three JSON files concurrently.
  const [topData, middleData, bottomData] = await Promise.all([
    fetchJSON(topURL),
    fetchJSON(middleURL),
    fetchJSON(bottomURL)
  ]);

  // Validate that each JSON file has a pathData property.
  if (!topData.pathData || !middleData.pathData || !bottomData.pathData) {
    throw new Error("Missing pathData for one or more parts of the Wings trait.");
  }

  // Generate random colors for each part.
  const colorTop = getRandomColor();
  const colorMiddle = getRandomColor();
  const colorBottom = getRandomColor();

  // Use the viewBox from the top data if provided; otherwise, use a default.
  const viewBox = topData.viewBox || `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`;

  // Create the SVG with three paths.
  const svg = `
    <svg xmlns="${SVG_NS}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="${viewBox}">
      <path d="${topData.pathData}" fill="${colorTop}" />
      <path d="${middleData.pathData}" fill="${colorMiddle}" />
      <path d="${bottomData.pathData}" fill="${colorBottom}" />
    </svg>
  `;

  return svg.trim();
}