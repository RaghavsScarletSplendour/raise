import type { Cue } from "./raise";

export type Lecture = {
  id: string;
  youtubeId: string;
  title: string;
  prof: string;
  hall: string;
  chip: string;
  blurb: string;
  ghosts: { label: string; question: string }[];
  captions: Cue[];
};

export const LECTURES: Lecture[] = [
  {
    id: "os",
    youtubeId: "qJ_bXhrUOkc",
    title: "Operating Systems Fundamentals, Lecture 01",
    prof: "Prof. Santanu Chattopadhyay",
    hall: "IIT Kharagpur · NPTEL",
    chip: "IIT KGP OS",
    blurb: "Why a machine needs a keeper.",
    ghosts: [
      { label: "Why an OS?", question: "Why do we even need an operating system?" },
      { label: "Virtual memory?", question: "How does virtual memory work?" },
    ],
    captions: [
      { start: 6, text: "Welcome. This is Operating Systems, IIT Kharagpur. I am Santanu Chattopadhyay." },
      { start: 18, text: "Why do we even need an operating system? That is the first question of this course." },
      { start: 36, text: "Without an operating system you would talk to the hardware yourself, every instruction, every time." },
      { start: 58, text: "You would write assembly for a quadratic equation, manage registers, memory, and the printer by hand." },
      { start: 88, text: "The operating system is the interface between the user and the machine." },
      { start: 118, text: "It gives you processes, files, and protection so one program cannot destroy another." },
      { start: 160, text: "Think of printer spooling. Many jobs, one printer. The operating system queues them." },
      { start: 210, text: "A computer has four parts: hardware, operating system, utilities, and application programs." },
      { start: 270, text: "Hardware is the machine. The operating system sits on top of it and hides the ugly details." },
      { start: 340, text: "A process is a program in execution. The operating system schedules which process runs." },
      { start: 420, text: "Memory management: the operating system decides who gets RAM and who waits." },
      { start: 510, text: "Protection: user mode versus kernel mode. You do not touch the disk controller from a student program." },
      { start: 620, text: "I/O devices are slow. The operating system overlaps computation with waiting." },
      { start: 740, text: "System calls are how an application asks the operating system for a service." },
      { start: 880, text: "Today we only need the idea of an operating system as a resource manager and a protector." },
    ],
  },
  {
    id: "justice",
    youtubeId: "kBdfcR-8hEY",
    title: "Justice, Lecture 1: The Moral Side of Murder",
    prof: "Michael Sandel",
    hall: "Sanders Theatre · Harvard",
    chip: "Harvard Justice",
    blurb: "A trolley, a bridge, a show of hands.",
    ghosts: [
      { label: "The trolley", question: "What should the trolley driver do about the five workers?" },
      { label: "Kant already?", question: "What does Kant say about categorical moral duties?" },
    ],
    captions: [
      { start: 12, text: "This is a course about Justice, and we begin with a story." },
      { start: 28, text: "Suppose you are the driver of a trolley car, hurtling down the track at sixty miles an hour." },
      { start: 48, text: "At the end of the track you notice five workers. Your brakes do not work." },
      { start: 72, text: "Off to the right is a side track, and at the end of that track there is one worker." },
      { start: 96, text: "You can turn, killing the one but sparing the five. What is the right thing to do?" },
      { start: 130, text: "Let us take a poll. How many would turn the trolley onto the side track?" },
      { start: 200, text: "Better to kill one so that five can live. That is the reason most of you have." },
      { start: 280, text: "Now you are an onlooker on a bridge. Next to you is a very fat man. You could shove him onto the track." },
      { start: 340, text: "He would die, but he would spare the five. How many would push the fat man over the bridge?" },
      { start: 400, text: "Most people would not. What became of the principle, better that five should live?" },
      { start: 480, text: "A doctor in an emergency room: spend the day on one severely injured patient, or save the five." },
      { start: 560, text: "A transplant surgeon could yank the organs of a healthy patient to save five. Would you do it?" },
      { start: 640, text: "Consequentialist moral reasoning locates morality in the consequences of an act." },
      { start: 700, text: "Categorical moral reasoning locates morality in duties and rights, regardless of the consequences." },
      { start: 760, text: "Utilitarianism, Jeremy Bentham: the greatest good for the greatest number." },
      { start: 820, text: "The most important philosopher of categorical moral reasoning is Immanuel Kant." },
      { start: 900, text: "Philosophy estranges us from the familiar. Self-knowledge is like lost innocence." },
      { start: 1020, text: "The aim of this course is to awaken the restlessness of reason, and to see where it might lead." },
    ],
  },
  {
    id: "lewin",
    youtubeId: "X9c0MRooBzQ",
    title: "8.01 Lec 01: Units, Dimensions, Scaling",
    prof: "Walter Lewin",
    hall: "MIT · Classical Mechanics",
    chip: "MIT 8.01",
    blurb: "A measurement without uncertainty is meaningless.",
    ghosts: [
      { label: "The units", question: "What units does Lewin introduce for length, time, and mass?" },
      { label: "Lagrangian?", question: "How do we write the Lagrangian for this system?" },
    ],
    captions: [
      { start: 8, text: "I am Walter Lewin. I will be your lecturer this term." },
      { start: 24, text: "To express measurements quantitatively we introduce units: the meter, the second, the kilogram." },
      { start: 52, text: "Length, time, and mass. These are the three fundamental quantities in physics." },
      { start: 88, text: "I find inches and feet an extremely uncivilized system. I work almost exclusively decimal." },
      { start: 130, text: "I will show you a movie called The Powers of Ten. It covers forty orders of magnitude." },
      { start: 200, text: "Any measurement that you make without knowledge of the uncertainty is completely meaningless." },
      { start: 280, text: "My grandmother believed someone lying in bed is longer than someone who stands up. We will test that." },
      { start: 420, text: "Zach is 183.2 centimeters standing, 185.7 lying down. About one inch taller when you sleep." },
      { start: 560, text: "Galileo asked why mammals are not much larger. He argued that if they become too massive, the bones break." },
      { start: 680, text: "A scaling argument: mass is proportional to size cubed, pressure on the femur is weight over area." },
      { start: 820, text: "I plotted femurs from mouse to elephant. The scaling law did not hold the way Galileo hoped." },
      { start: 980, text: "Dimensional analysis: the time for an apple to fall is proportional to the square root of height over g." },
      { start: 1140, text: "We drop apples from three meters and one and a half. The ratio of times agrees with the square root of two." },
      { start: 1280, text: "The time is independent of mass. Dimensional analysis has power, and it has limits. You are now at MIT." },
    ],
  },
];

export function getLecture(id: string) {
  return LECTURES.find((l) => l.id === id);
}
