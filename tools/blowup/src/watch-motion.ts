// The hands and date use the visitor's wall clock. Internal speeds are illustrative
// because this educational reconstruction does not contain exact NH35 gear ratios.
export function watchMotion(seconds: number, now: Date = new Date()) {
  const phase = seconds * Math.PI * 2;
  const displaySeconds = (now.getHours() % 12) * 3600 + now.getMinutes() * 60 + now.getSeconds() + now.getMilliseconds() / 1000;
  const beats = Math.floor(seconds * 2);
  return {
    rotor: Math.sin(seconds * .8) * 1.4 + Math.sin(seconds * .27) * .2,
    barrel: -seconds * .09,
    train: [seconds * .15, -seconds * .24, seconds * .38, -beats * Math.PI / 15],
    winding: [seconds * .42, -seconds * .67],
    balance: Math.sin(phase) * 2.7,
    springScale: 1 + Math.sin(phase) * .045,
    fork: Math.tanh(Math.cos(phase) * 9) * .15,
    hands: [-displaySeconds * Math.PI / 21600, -displaySeconds * Math.PI / 1800, -displaySeconds * Math.PI / 30],
    date: (now.getDate() - 1) * Math.PI * 2 / 31,
  };
}
