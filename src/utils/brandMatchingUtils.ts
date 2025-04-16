
/**
 * Utilities for matching brand/category names
 */

/**
 * Performs fuzzy matching between two strings
 * 
 * @param name1 First string to compare
 * @param name2 Second string to compare
 * @param threshold Similarity threshold (0-1), default 0.7
 * @returns Whether the strings match based on the similarity threshold
 */
export const fuzzyMatch = (name1: string, name2: string, threshold = 0.7): boolean => {
  // Convert to lowercase for case-insensitive matching
  const s1 = name1.toLowerCase();
  const s2 = name2.toLowerCase();
  
  // Exact match
  if (s1 === s2) return true;
  
  // Check if one is a substring of the other
  if (s1.includes(s2) || s2.includes(s1)) return true;
  
  // Levenshtein distance implementation for fuzzy matching
  const m = s1.length;
  const n = s2.length;
  
  // If one string is empty, the distance is the length of the other
  if (m === 0) return n === 0;
  if (n === 0) return false;
  
  // Create the distance matrix
  const d: number[][] = Array(m + 1).fill(null).map(() => Array(n + 1).fill(0));
  
  // Initialize the first row and column
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  
  // Fill the distance matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,      // deletion
        d[i][j - 1] + 1,      // insertion
        d[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  // Calculate similarity as 1 - (distance / max length)
  const maxLength = Math.max(m, n);
  const similarity = 1 - d[m][n] / maxLength;
  
  return similarity >= threshold;
};

/**
 * Generates name variations for improved brand/category matching
 * 
 * @param name The original name
 * @returns Array of variations to try for matching
 */
export const generateNameVariations = (name: string): string[] => {
  const variations: string[] = [name.toLowerCase()];
  
  // Remove spaces
  variations.push(name.toLowerCase().replace(/\s+/g, ''));
  
  // Replace spaces with hyphens
  variations.push(name.toLowerCase().replace(/\s+/g, '-'));
  
  // Try reverse order for multi-word names
  const words = name.toLowerCase().split(/\s+/);
  if (words.length > 1) {
    variations.push(words.reverse().join(' '));
    variations.push(words.reverse().join(''));
  }
  
  // Return unique variations
  return [...new Set(variations)];
};
