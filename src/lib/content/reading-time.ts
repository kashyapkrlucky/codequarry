/**
 * Estimates reading time for reference content. Cheatsheets are scanned rather
 * than read linearly, and code is slower to parse than prose, so code-block
 * words are weighted higher than prose words.
 */
export function estimateReadingTime(source: string): number {
  const codeBlocks = source.match(/```[\s\S]*?```/g) ?? [];
  const codeWords = codeBlocks.join(" ").split(/\s+/).filter(Boolean).length;
  const proseWords = source
    .replace(/```[\s\S]*?```/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const minutes = proseWords / 230 + codeWords / 120;
  return Math.max(1, Math.round(minutes));
}
