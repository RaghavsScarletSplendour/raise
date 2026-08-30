export type Concept = {
  id: string;
  label: string;
  lectureId: string;
  snippet: string;
};

export const CONCEPTS: Concept[] = [
  {
    id: "operating-systems",
    label: "Operating Systems",
    lectureId: "os",
    snippet:
      "An operating system is just a program with special privileges. It starts first, then launches and manages every other program on the machine.",
  },
  {
    id: "virtual-memory",
    label: "Virtual Memory",
    lectureId: "os",
    snippet:
      "Virtual memory lets a program pretend its memory always starts at address zero. The OS hides the real physical location, and a buggy program can only trash its own space.",
  },
  {
    id: "multitasking",
    label: "Multitasking",
    lectureId: "os",
    snippet:
      "The Atlas Supervisor, finished in 1962, could run several programs at the same time on a single CPU. That ability is called multitasking.",
  },
  {
    id: "unix",
    label: "Unix",
    lectureId: "os",
    snippet:
      "Multics led Dennis Ritchie and Ken Thompson to build Unix: a lean kernel, and a panic function if the kernel crashes.",
  },
  {
    id: "trolley-problem",
    label: "The Trolley Problem",
    lectureId: "justice",
    snippet:
      "A trolley is hurtling toward five workers. Your brakes fail. A side track has one worker. Turn, and you kill one to spare five. Most people would turn.",
  },
  {
    id: "fat-man-bridge",
    label: "The Man On The Bridge",
    lectureId: "justice",
    snippet:
      "Now you are on a bridge. You could shove a very large man onto the track to stop the trolley. He dies. Five live. Most people would not push.",
  },
  {
    id: "five-vs-one",
    label: "Better That Five Live",
    lectureId: "justice",
    snippet:
      "If the reason is 'better that five should live,' shoving the man should feel the same as turning the trolley. It does not. That is the puzzle.",
  },
  {
    id: "units",
    label: "Units And Uncertainty",
    lectureId: "lewin",
    snippet:
      "A measurement without uncertainty is meaningless. Every number in physics carries units, and the units have to make the equation honest.",
  },
  {
    id: "dimensional-analysis",
    label: "Dimensional Analysis",
    lectureId: "lewin",
    snippet:
      "The time for an apple to fall scales with the square root of height over g. Drop from three meters and from one and a half: the ratio of times is the square root of two.",
  },
  {
    id: "scaling",
    label: "Why Elephants Don't Break",
    lectureId: "lewin",
    snippet:
      "Galileo argued that if animals get too massive, the bones break. Mass grows with size cubed, bone strength with area. The scaling is the lesson.",
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
