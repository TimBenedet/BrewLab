import fs from 'fs';
import path from 'path';

interface SrmColorEntry {
  srm: number;
  hex: string;
  description?: string;
}

let srmColorMapInstance: Map<number, SrmColorEntry> | null = null;

function parseSrmCsv(csvContent: string): Map<number, SrmColorEntry> {
  const lines = csvContent.trim().split('\n');
  const map = new Map<number, SrmColorEntry>();
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const parts = line.split(',');
    if (parts.length >= 3) {
      const srmString = parts[0].trim();
      const description = parts[1].trim();
      const hex = parts[2].trim();
      
      if (srmString.endsWith('+')) {
        const srmValue = parseInt(srmString.slice(0, -1), 10);
        if (!isNaN(srmValue)) {
          // For "20+", we'll store it as 20, and handle lookups for >=20
           map.set(srmValue, { srm: srmValue, hex, description });
        }
      } else {
        const srmValue = parseInt(srmString, 10);
        if (!isNaN(srmValue)) {
          map.set(srmValue, { srm: srmValue, hex, description });
        }
      }
    }
  }
  return map;
}

function getSrmColorMap(): Map<number, SrmColorEntry> {
  if (srmColorMapInstance) {
    return srmColorMapInstance;
  }
  try {
    const csvPath = path.join(process.cwd(), 'public/srm-colors.csv');
    const csvContent = fs.readFileSync(csvPath, 'utf8');
    srmColorMapInstance = parseSrmCsv(csvContent);
    return srmColorMapInstance;
  } catch (error) {
    console.error("Failed to read or parse srm-colors.csv:", error);
    srmColorMapInstance = new Map<number, SrmColorEntry>(); // Return empty map on error
    return srmColorMapInstance;
  }
}

export function getHexForSrm(srm: number | string | undefined): string {
  const srmValue = Number(srm);
  if (isNaN(srmValue) || srmValue < 0) {
    return '#CCCCCC'; // Default color for invalid SRM
  }

  const colorMap = getSrmColorMap();
  if (colorMap.size === 0) {
    return '#CCCCCC'; // Default if map is empty
  }

  // Find the closest SRM value in the map
  let closestSrmKey = -1;
  let minDiff = Infinity;
  let maxSrmKey = -1;

  for (const key of colorMap.keys()) {
    if (key > maxSrmKey) {
        maxSrmKey = key;
    }
    if (key === srmValue) {
      closestSrmKey = key;
      break;
    }
    const diff = Math.abs(key - srmValue);
    if (key <= srmValue && diff < minDiff) {
      minDiff = diff;
      closestSrmKey = key;
    }
  }
  
  // Handle "20+" case and values greater than max defined SRM
  // If srmValue is greater than or equal to the highest defined SRM key (e.g. 20 for "20+")
  // and that key exists, use that color.
  const twentyPlusEntry = colorMap.get(20); // Assuming 20 is the key for "20+"
  if (twentyPlusEntry && srmValue >= 20) {
    return twentyPlusEntry.hex;
  }


  if (closestSrmKey !== -1) {
    return colorMap.get(closestSrmKey)?.hex || '#CCCCCC';
  }
  
  // Fallback if no suitable key found (e.g., SRM is lower than any defined value)
  // Or if srmValue is very high and no "20+" like rule matched
  if (srmValue > maxSrmKey && maxSrmKey !== -1) {
      const maxEntry = colorMap.get(maxSrmKey);
      if (maxEntry) return maxEntry.hex;
  }


  return '#CCCCCC'; // Final fallback
}
