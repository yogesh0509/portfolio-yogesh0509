/**
 * Fuzzy matching for Quick Open, in the style of VS Code: the query's characters must
 * appear in order in the candidate, and matches score higher when they are consecutive,
 * start a word, or start the string.
 */

export interface FuzzyMatch {
  score: number;
  /** Positions in the candidate of each matched query character. */
  indices: number[];
}

/**
 * Lower-cases and strips accents one character at a time, so "résumé" matches "resume" and
 * every index in the folded text is still the index of the same character in the original.
 */
function fold(text: string): string {
  return Array.from(text, (ch) => ch.normalize("NFD")[0].toLowerCase()[0]).join("");
}

const isBoundary = (text: string, i: number) => {
  if (i === 0) return true;
  const prev = text[i - 1];
  return prev === "/" || prev === "-" || prev === "_" || prev === "." || prev === " " || (prev === prev.toLowerCase() && text[i] !== text[i].toLowerCase());
};

export function fuzzyMatch(query: string, candidate: string): FuzzyMatch | null {
  const q = fold(query).replace(/\s+/g, "");
  if (q === "") return { score: 0, indices: [] };
  const text = fold(candidate);

  // Greedy left-to-right match, then try each later start for the first character and keep the best.
  let best: FuzzyMatch | null = null;
  for (let start = text.indexOf(q[0]); start !== -1; start = text.indexOf(q[0], start + 1)) {
    const indices = [start];
    let pos = start;
    for (let k = 1; k < q.length; k += 1) {
      pos = text.indexOf(q[k], pos + 1);
      if (pos === -1) break;
      indices.push(pos);
    }
    if (indices.length !== q.length) break; // later starts cannot do better

    let score = 0;
    indices.forEach((index, k) => {
      score += 1;
      if (k > 0 && index === indices[k - 1] + 1) score += 5; // consecutive run
      if (isBoundary(candidate, index)) score += 3; // start of a word
    });
    if (indices[0] === 0) score += 4; // start of the string
    score -= (indices[indices.length - 1] - indices[0]) * 0.05; // prefer tight matches
    score -= candidate.length * 0.01; // prefer shorter candidates

    if (!best || score > best.score) best = { score, indices };
  }
  return best;
}

/**
 * Filters and ranks items by a query, best first. An empty query keeps the original order.
 * `bonus` adds to an item's score, for tie-breaking (it should stay small next to a real match).
 */
export function fuzzyFilter<T>(
  items: T[],
  query: string,
  text: (item: T) => string,
  bonus: (item: T) => number = () => 0,
): { item: T; match: FuzzyMatch }[] {
  const ranked = items.flatMap((item) => {
    const match = fuzzyMatch(query, text(item));
    return match ? [{ item, match: { ...match, score: match.score + bonus(item) } }] : [];
  });
  return query.trim() === "" ? ranked : ranked.sort((a, b) => b.match.score - a.match.score);
}
