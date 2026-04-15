import { Product } from "../models/types";

export function get_all_tags_with_counts(products: Product[]): Array<{tag: string, count: number}> {
  // Handle edge case of no products
  if (!products || products.length === 0) {
    return [];
  }

  // Use a Map to count occurrences of each tag
  const tagCounts = new Map<string, number>();
  
  // Iterate through all products and their tags
  for (const product of products) {
    // Skip products without tags array or with null/undefined tags
    if (!product.tags || !Array.isArray(product.tags)) {
      continue;
    }
    
    // Count each tag in the product's tags array
    for (const tag of product.tags) {
      // Skip empty strings
      if (typeof tag !== 'string' || tag.trim() === '') {
        continue;
      }
      
      const normalizedTag = tag.trim().toLowerCase();
      const currentCount = tagCounts.get(normalizedTag) || 0;
      tagCounts.set(normalizedTag, currentCount + 1);
    }
  }
  
  // Convert Map to array of objects and sort by count descending, then by tag ascending
  return Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => {
      // Primary sort: by count descending
      if (b.count !== a.count) {
        return b.count - a.count;
      }
      // Secondary sort: by tag ascending (alphabetical)
      return a.tag.localeCompare(b.tag);
    });
}