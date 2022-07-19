interface Lengthwise {
  length: number;
}

export function longest<T extends Lengthwise>(
  matches: Iterable<T> | null
): T | null {
  if (matches === null) {
    return matches;
  }
  let longest = null;
  for (const match of matches) {
    if (!longest || longest.length < match.length) {
      longest = match;
    }
  }
  return longest;
}
