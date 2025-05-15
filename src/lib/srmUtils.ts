
// Helper function to convert SRM value to an approximate HEX color string
export function srmToHex(srm: number | string | undefined): string {
  const srmValue = Number(srm);

  if (isNaN(srmValue) || srmValue < 0) return '#CCCCCC'; // Default to light gray if invalid or not present

  // Based on common SRM to Hex color charts
  if (srmValue <= 1) return '#F8F753'; // Pale Straw
  if (srmValue <= 2) return '#F8F753'; // Pale Straw
  if (srmValue <= 3) return '#F6F513'; // Straw
  if (srmValue <= 4) return '#EAE600'; // Pale Gold
  if (srmValue <= 5) return '#E0B400'; // Gold
  if (srmValue <= 6) return '#D5A600'; // Deep Gold
  if (srmValue <= 7) return '#CB9900'; // Pale Amber
  if (srmValue <= 8) return '#C18D00'; // Pale Amber
  if (srmValue <= 9) return '#B88000'; // Medium Amber
  if (srmValue <= 10) return '#B07400'; // Medium Amber
  if (srmValue <= 11) return '#A86800'; // Deep Amber
  if (srmValue <= 12) return '#A05D00'; // Deep Amber
  if (srmValue <= 13) return '#985200'; // Deep Amber
  if (srmValue <= 14) return '#914800'; // Amber-Brown
  if (srmValue <= 17) return '#8A3E00'; // Brown
  if (srmValue <= 20) return '#833500'; // Brown
  if (srmValue <= 22) return '#7C2D00'; // Ruby Brown
  if (srmValue <= 24) return '#752500'; // Deep Brown
  if (srmValue <= 26) return '#6E1E00'; // Deep Brown
  if (srmValue <= 29) return '#671800'; // Dark Brown
  if (srmValue <= 30) return '#601200'; // Dark Brown (Porter)
  if (srmValue <= 35) return '#590D00'; // Very Dark Brown
  if (srmValue <= 39) return '#530900'; // Very Dark Brown (Stout)
  if (srmValue >= 40) return '#300809'; // Black
  return '#0F0000'; // Default to Black for very high SRM or if somehow missed
}
