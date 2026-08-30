import type { Cue } from "./raise";

export type Lecture = {
  id: string;
  youtubeId: string;
  title: string;
  prof: string;
  hall: string;
  chip: string;
  blurb: string;
  laterAt: number;
  ghosts: { label: string; question: string; hint: string; move: "ask" | "later-then-ask" }[];
  captions: Cue[];
};

export const LECTURES: Lecture[] = [
  {
    id: "os",
    youtubeId: "26QPDBe-NB8",
    title: "Operating Systems: Crash Course Computer Science #18",
    prof: "Carrie Anne Philbin",
    hall: "Crash Course · 12 minutes",
    chip: "Crash Course OS",
    blurb: "Twelve minutes. What an OS is, then virtual memory later.",
    laterAt: 400,
    ghosts: [
      { label: "What is an OS?", hint: "She climbs out, unimpressed", move: "ask", question: "What is an operating system?" },
      { label: "Virtual memory?", hint: "She hasn't taught it. Sit down.", move: "ask", question: "How does virtual memory work?" },
      { label: "Ask that again, later", hint: "She yanks you back. Obviously.", move: "later-then-ask", question: "What is an operating system?" },
    ],
    captions: [
      { start: 4, text: "Hi, I'm Carrie Anne, and welcome to Crash Course Computer Science." },
      { start: 12, text: "Computers in the 1940s and early 50s ran one program at a time." },
      { start: 28, text: "A programmer would write one at their desk, for example, on punch cards, then hand it to a dedicated computer operator." },
      { start: 52, text: "The computer would run it, spit out some output, and halt." },
      { start: 68, text: "Computers became faster and faster. Pretty soon, humans inserting programs was taking longer than running them." },
      { start: 18, text: "We needed a way for computers to operate themselves, and so, operating systems were born." },
      { start: 24, text: "Operating systems, or OSes for short, are just programs. Special privileges on the hardware let them run and manage other programs." },
      { start: 132, text: "They're typically the first one to start when a computer is turned on, and all subsequent programs are launched by the OS." },
      { start: 160, text: "The very first OSes augmented loading programs by hand. Computers could be given batches. This was called batch processing." },
      { start: 210, text: "Operating systems stepped in as intermediaries between software programs and hardware peripherals, using device drivers." },
      { start: 270, text: "By the end of the 1950s, computers were often idle waiting for slow printers and punch card readers." },
      { start: 330, text: "The Atlas Supervisor, finished in 1962, could run several programs at the same time on a single CPU. This ability is called multitasking." },
      { start: 400, text: "With Virtual Memory, programs can assume their memory always starts at address 0, keeping things simple and consistent." },
      { start: 450, text: "The actual physical location in computer memory is hidden and abstracted by the operating system." },
      { start: 500, text: "Another upside is Memory Protection. A buggy program can only trash its own memory, not that of other programs." },
      { start: 540, text: "Atlas had both virtual and protected memory. It was the first computer and OS to support these features." },
      { start: 600, text: "Time-sharing operating systems let several users share one machine through terminals." },
      { start: 660, text: "Multics led Dennis Ritchie and Ken Thompson to build Unix, with a lean kernel and a panic function if the kernel crashes." },
      { start: 730, text: "MS-DOS lacked multitasking and protected memory. Early Windows could show the blue screen of death." },
      { start: 780, text: "Today computers run Mac OS, Windows, Linux, iOS and Android, with multitasking and virtual and protected memory." },
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
    laterAt: 700,
    ghosts: [
      { label: "The trolley", hint: "He climbs out", move: "ask", question: "What should the trolley driver do about the five workers?" },
      { label: "Kant already?", hint: "He hasn't taught it", move: "ask", question: "What does Kant say about categorical moral duties?" },
      { label: "Ask the trolley later", hint: "He yanks you back", move: "later-then-ask", question: "What should the trolley driver do about the five workers?" },
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
    laterAt: 600,
    ghosts: [
      { label: "The units", hint: "He climbs out", move: "ask", question: "What units does Lewin introduce for length, time, and mass?" },
      { label: "Lagrangian?", hint: "He hasn't taught it", move: "ask", question: "How do we write the Lagrangian for this system?" },
      { label: "Ask the units later", hint: "He yanks you back", move: "later-then-ask", question: "What units does Lewin introduce for length, time, and mass?" },
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
