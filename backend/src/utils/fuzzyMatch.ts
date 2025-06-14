import fuzzysort from 'fuzzysort';

export function fuzzyIncludes(message: string, terms: string[]): boolean {
  const result = fuzzysort.go(message, terms);
  return result.some(r => r.score > -50);
}
