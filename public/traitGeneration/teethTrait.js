// public/traitGeneration/teethTrait.js

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
 * @returns {Promise<Object>} The parsed JSON object.
 */
async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch JSON from ${url}`);
  }
  return await response.json();
}

/**
 * Generates a basic Teeth trait SVG by fetching two JSON files for teeth and gums,
 * then filling each path with a random color.
 *
 * It expects the JSON files to be stored in /traits_json/ with filenames following the pattern:
 *   - teeth_common.json
 *   - gums_common.json
 * (For other rarities, the filename will change accordingly.)
 *
 * @param {string} [rarity="common"] - The rarity level to load (e.g., "common", "rare", etc.).
 * @returns {Promise<string>} A Promise that resolves to the serialized SVG string.
 */
export async function generateTrait(rarity = "common") {
  // Define the base URL for the JSON files.
  const baseURL = "/traits_json";
  
  // Construct URLs for the teeth and gums JSON files.
  const teethURL = `${baseURL}/teeth_${rarity}.json`;
  const gumsURL = `${baseURL}/gums_${rarity}.json`;
  
  // Fetch both JSON files concurrently.
  const [teethData, gumsData] = await Promise.all([
    fetchJSON(teethURL),
    fetchJSON(gumsURL)
  ]);
  
  // Validate that both JSON files contain the required pathData.
  if (!teethData.pathData || !gumsData.pathData) {
    throw new Error("Missing pathData for one or more parts of the Teeth trait.");
  }
  
  // Generate a random color for each part.
  const colorTeeth = getRandomColor();
  const colorGums = getRandomColor();
  
  // Use the viewBox from the teeth JSON if provided, otherwise default to 0 0 420 420.
  const viewBox = teethData.viewBox || `0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`;
  
  // Create the SVG with two paths.
  const svg = `
    <svg xmlns="${SVG_NS}" width="${CANVAS_SIZE}" height="${CANVAS_SIZE}" viewBox="${viewBox}">
      <path d="${teethData.pathData}" fill="${colorTeeth}" />
      <path d="${gumsData.pathData}" fill="${colorGums}" />
    </svg>
  `;
  
  return svg.trim();
}