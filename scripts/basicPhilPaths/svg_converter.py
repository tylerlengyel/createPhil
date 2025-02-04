import os
import json
from pathlib import Path
import xml.etree.ElementTree as ET
import re
import logging
from typing import Dict, Optional

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def setup_output_directory(desktop_path: Path) -> Path:
    """Create output directory for JSON files."""
    output_dir = desktop_path / "basicPhilPaths_json"
    output_dir.mkdir(exist_ok=True)
    return output_dir

def parse_svg_file(file_path: Path) -> Dict[str, str]:
    """Parse SVG file and extract path data and viewBox."""
    try:
        # Parse the SVG file
        tree = ET.parse(file_path)
        root = tree.getroot()
        
        # Extract viewBox (default to "0 0 420 420" if not found)
        viewbox = root.get('viewBox', "0 0 420 420")
        
        # Find all path elements and combine their data
        paths = root.findall('.//{http://www.w3.org/2000/svg}path')
        if not paths:
            raise ValueError(f"No path elements found in {file_path}")
        
        # Combine all path data into one string
        path_data = " ".join(path.get('d', '') for path in paths)
        
        # Remove any fill attributes and colors
        path_data = re.sub(r'fill="[^"]*"', '', path_data)
        
        # Optimize path data by removing unnecessary spaces and zeros
        path_data = re.sub(r'\s+', ' ', path_data)  # Remove extra whitespace
        path_data = re.sub(r'([0-9])\.[0]+([^0-9])', r'\1\2', path_data)  # Remove unnecessary decimal zeros
        path_data = path_data.strip()
        
        return {
            "pathData": path_data,
            "viewBox": viewbox
        }
    except Exception as e:
        logger.error(f"Error processing {file_path}: {str(e)}")
        raise

def convert_svg_to_json(input_file: Path, output_dir: Path) -> None:
    """Convert single SVG file to JSON format."""
    try:
        # Parse SVG and get path data
        svg_data = parse_svg_file(input_file)
        
        # Create output JSON file path
        output_file = output_dir / f"{input_file.stem}.json"
        
        # Write to JSON file
        with open(output_file, 'w') as f:
            json.dump(svg_data, f, indent=2)
        
        logger.info(f"Successfully converted {input_file.name} to JSON")
    except Exception as e:
        logger.error(f"Failed to convert {input_file.name}: {str(e)}")

def main():
    try:
        # Get desktop path
        desktop_path = Path.home() / "Desktop"
        input_dir = desktop_path / "basicPhilPaths"
        
        # Verify input directory exists
        if not input_dir.exists():
            raise FileNotFoundError(f"Input directory not found: {input_dir}")
        
        # Create output directory
        output_dir = setup_output_directory(desktop_path)
        
        # Process all SVG files
        svg_files = list(input_dir.glob("*.svg"))
        if not svg_files:
            raise FileNotFoundError("No SVG files found in input directory")
        
        for svg_file in svg_files:
            convert_svg_to_json(svg_file, output_dir)
        
        logger.info(f"Conversion complete. JSON files saved to {output_dir}")
    
    except Exception as e:
        logger.error(f"Script execution failed: {str(e)}")
        raise

if __name__ == "__main__":
    main()