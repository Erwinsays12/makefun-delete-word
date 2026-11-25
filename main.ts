// main.ts — The Word You'd Delete From the Dictionary
//
// A deterministic picker: scores a shortlist of candidate words against the
// judge's five published criteria (in their published order) and writes the
// winning word — the single word to erase from the dictionary forever — to
// /output/entry.txt. No network, no clock, no environment input: the same
// run always writes the same word.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

type Candidate = {
  word: string;
  // Funny at first sight: the reader gets the joke the moment the word is gone (0-10).
  instant: number;
  // Humour from the word itself: its sound, its double meanings, the gap it leaves (0-10).
  intrinsic: number;
  // Fresh: not the first word the rest of the field thinks of, still instantly understood (0-10).
  fresh: number;
  // Exact: one word, spelled correctly, with nothing added around it (0-10).
  exact: number;
};

const CANDIDATES: Candidate[] = [
  // The longest word in the dictionary. Deleting it is the joke itself: the
  // dictionary loses its longest word, and nobody alive can spell it twice.
  { word: "pneumonoultramicroscopicsilicovolcanoconiosis", instant: 9, intrinsic: 10, fresh: 10, exact: 10 },
  // The word everyone argues is not a word: erasing it settles the argument.
  { word: "irregardless", instant: 8, intrinsic: 9, fresh: 6, exact: 10 },
  // The word people love to hate saying. Instant joke, but the whole field thinks of it first.
  { word: "moist", instant: 9, intrinsic: 7, fresh: 2, exact: 10 },
  // Mary Poppins' showpiece: fun to say, but a familiar pick.
  { word: "supercalifragilisticexpialidocious", instant: 8, intrinsic: 8, fresh: 5, exact: 10 },
  // Misused in every other sentence, so deleting it is tempting — and obvious.
  { word: "literally", instant: 7, intrinsic: 6, fresh: 3, exact: 10 },
  // It literally means "estimating something as worthless": erasing it is
  // the dictionary agreeing. Clever, but only if the reader knows the meaning.
  { word: "floccinaucinihilipilification", instant: 6, intrinsic: 9, fresh: 9, exact: 10 },
];

function score(c: Candidate): number {
  // The judge weighs the criteria in their published order, most important first.
  return c.instant * 4 + c.intrinsic * 3 + c.fresh * 2 + c.exact;
}

function pick(candidates: Candidate[]): Candidate {
  const ranked = [...candidates].sort((a, b) => {
    const byScore = score(b) - score(a);
    if (byScore !== 0) return byScore;
    return a.word.localeCompare(b.word); // deterministic tie-break
  });
  return ranked[0];
}

function main(): void {
  for (const c of CANDIDATES) {
    console.log(`  ${c.word}: score ${score(c)}`);
  }
  const winner = pick(CANDIDATES);
  const text = winner.word;
  if (!/^[A-Za-z]+$/.test(text)) {
    throw new Error("entry must be a single word");
  }
  if (text.length < 1 || text.length > 77) {
    throw new Error("entry must be 1 to 77 characters");
  }
  mkdirSync("/output", { recursive: true });
  writeFileSync("/output/entry.txt", text, "utf8");
  // Read the file back and confirm it holds exactly the winning word.
  const written = readFileSync("/output/entry.txt", "utf8");
  if (written !== text) {
    throw new Error("entry.txt does not match the winning word");
  }
  console.log(`word to delete: ${text} (${text.length} chars, score ${score(winner)})`);
}

main();
