export type Concept = {
  id: string;
  label: string;
  lectureId?: string;
  youtubeId?: string;
  snippet: string;
};

export const CONCEPTS: Concept[] = [
  {
    id: "psychology",
    label: "Psychology",
    youtubeId: "vo4pMVb0R6M",
    snippet:
      "Psychology is the study of why you think you're interesting. Behavior, feelings, the embarrassing bits you swear you hide.",
  },
  {
    id: "gravity",
    label: "Gravity",
    youtubeId: "TRAbZxQHlVw",
    snippet:
      "Mass pulls on mass. That pull is gravity. It's why you stay on the floor. No, you cannot opt out.",
  },
  {
    id: "quantum-computing",
    label: "Quantum Computing",
    youtubeId: "JhHMJCUmq28",
    snippet:
      "A bit is 0 or 1. A qubit is both, until you look, at which point it collapses and so does your confidence. That's the trick.",
  },
  {
    id: "dna",
    label: "DNA",
    youtubeId: "8kK2zwjRV0M",
    snippet:
      "DNA is four letters pretending to be a novel. Those letters copy you, badly, forever. Congratulations, you're a recipe.",
  },
  {
    id: "black-holes",
    label: "Black Holes",
    youtubeId: "qZWPBKULkdQ",
    snippet:
      "Squeeze enough mass into a tiny space and even light cannot climb out. A black hole. Your attention span, but with physics.",
  },
  {
    id: "evolution",
    label: "Evolution",
    youtubeId: "P3GagfbA2vo",
    snippet:
      "Genes shift a little each generation. Over time, one species becomes many. Nobody voted. Nobody asked you.",
  },
  {
    id: "computers",
    label: "Computers",
    youtubeId: "O5nskjZ_GoI",
    snippet:
      "A computer is switches that add and remember. Stack enough of them and you get the internet, which you use to skip class.",
  },
  {
    id: "atoms",
    label: "Atoms",
    youtubeId: "FSyAehMdpyI",
    snippet:
      "Everything is atoms. Tiny nucleus, electrons farther out. Chemistry is those electrons bumping into each other like you in a hallway.",
  },
];

export const PHRASES = [
  "You clearly don't know squat about",
  "Nobody ever actually taught you",
  "Let's be honest, you're faking it on",
  "Fine. Today you finally learn",
  "You've been nodding along about",
  "Time to stop pretending you understand",
  "Apparently you still don't get",
  "Every adult should already know this:",
  "You've avoided this long enough:",
  "Congratulations, today you learn",
  "Oh, you think you know",
  "Please stop Googling and actually learn",
];

export const NO_MILD = [
  "Nope, not that one",
  "Try something else",
  "Hard pass",
  "That's not it",
  "Ask again",
  "Literally anything else",
  "I already know this, obviously",
];

export const NO_ESCALATED = [
  "Still skipping? Bold.",
  "At this rate you'll know nothing, forever",
  "Wow. Okay. Next.",
  "Sure, avoid it forever",
  "That's very on-brand for you",
  "Running out of things to reject",
  "Skipping doesn't teach you anything",
];
