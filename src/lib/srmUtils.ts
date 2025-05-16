
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

  // Handle "20+" case first
  const twentyPlusEntry = colorMap.get(20); // Assuming 20 is the key for "20+"
  if (twentyPlusEntry && srmValue >= 20) {
    return twentyPlusEntry.hex;
  }

  let closestSrmKey = -1;
  let minDiff = Infinity;
  
  const sortedKeys = Array.from(colorMap.keys()).sort((a, b) => a - b);

  // Find the largest key in the map that is less than or equal to srmValue
  for (const key of sortedKeys) {
    if (key <= srmValue) {
      const diff = srmValue - key;
      if (diff < minDiff) {
        minDiff = diff;
        closestSrmKey = key;
      }
    } else {
      // Since keys are sorted, if key > srmValue, no further keys will be <= srmValue
      break; 
    }
  }

  if (closestSrmKey !== -1) {
    return colorMap.get(closestSrmKey)?.hex || '#CCCCCC';
  }

  // If srmValue is less than all keys in the map (e.g., srmValue = 0.5, map starts at 1)
  // Use the color of the smallest SRM value in the map.
  if (sortedKeys.length > 0 && srmValue < sortedKeys[0]) {
    return colorMap.get(sortedKeys[0])?.hex || '#CCCCCC';
  }
  
  // If srmValue is greater than all keys but not covered by 20+ (should be rare if 20+ exists)
  // Use the color of the largest SRM value in the map (that isn't the 20+ key itself if it's distinct).
  if (sortedKeys.length > 0) {
    const largestNonSpecialKey = sortedKeys.filter(k => k < 20).pop() || sortedKeys[sortedKeys.length -1];
     if (srmValue > largestNonSpecialKey && colorMap.has(largestNonSpecialKey) ) {
        return colorMap.get(largestNonSpecialKey)?.hex || '#CCCCCC';
     }
  }

  return '#CCCCCC'; // Final fallback
}
