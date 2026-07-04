const FILLER_WORDS = /\b(um+|uh+|er+|ah+|hmm+|gonna|wanna|kinda|sorta)\b/gi;
const FILLER_PHRASES =
  /\b(you know[,.]?\s*|I mean[,.]?\s*|like[,.]?\s+(?=\w)|sort of[,.]?\s*|kind of[,.]?\s*|basically[,.]?\s*)\s*/gi;

export function cleanTranscript(text: string): string {
  return text
    .replace(FILLER_WORDS, "")
    .replace(FILLER_PHRASES, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stripTimestamps(text: string): string {
  return text
    .replace(/^\[\d+:\d+(?::\d+)?\]\s*/gm, "")
    .replace(/\n/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}
