  export function generateKeywords(name: string): string[] {
  const keywords: Set<string> = new Set();
  const processedName = name.toLowerCase().replace(/\s+/g, "");

  for (let i = 0; i < processedName.length; i++) {
    for (let j = i + 1; j <= processedName.length; j++) {
      keywords.add(processedName.substring(i, j));
    }
  }

  return Array.from(keywords);
}
