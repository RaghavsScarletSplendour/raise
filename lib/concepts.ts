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
      "Psychology is the study of behavior and mental processes. How you think, feel, and act, and why.",
  },
  {
    id: "gravity",
    label: "Gravity",
    youtubeId: "TRAbZxQHlVw",
    snippet:
      "Mass pulls on mass. That pull is gravity. It keeps you on the ground, and planets on their tracks.",
  },
  {
    id: "quantum-computing",
    label: "Quantum Computing",
    youtubeId: "JhHMJCUmq28",
    snippet:
      "A normal bit is 0 or 1. A qubit can be both at once, until you look. That is the whole trick, and the whole headache.",
  },
  {
    id: "dna",
    label: "DNA",
    youtubeId: "8kK2zwjRV0M",
    snippet:
      "DNA is a double helix of four letters. Those letters are the instructions for building and copying a living thing.",
  },
  {
    id: "black-holes",
    label: "Black Holes",
    youtubeId: "qZWPBKULkdQ",
    snippet:
      "If you squeeze enough mass into a tiny space, even light cannot climb out. That is a black hole.",
  },
  {
    id: "evolution",
    label: "Evolution",
    youtubeId: "P3GagfbA2vo",
    snippet:
      "Genes shift a little each generation. Over time, that is how one species becomes many.",
  },
  {
    id: "computers",
    label: "Computers",
    youtubeId: "O5nskjZ_GoI",
    snippet:
      "A computer is just switches that add and remember. Stack enough of them and you get everything from calculators to the internet.",
  },
  {
    id: "atoms",
    label: "Atoms",
    youtubeId: "FSyAehMdpyI",
    snippet:
      "Everything is atoms. A tiny positive nucleus, electrons farther out. Chemistry is those electrons bumping into each other.",
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
