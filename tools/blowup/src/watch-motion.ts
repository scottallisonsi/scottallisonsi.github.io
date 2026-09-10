// The display advances at 60×. The mechanism is slowed separately for visibility.
// This describes illustrative motion, not the NH35's exact train or winding ratios.
export function watchMotion(seconds: number) {
  const phase = seconds * Math.PI * 2;
  const displaySeconds = 10 * 3600 + 10 * 60 + 30 + seconds * 60;
  const beats = Math.floor(seconds * 2);
  return {
    rotor: Math.sin(seconds * 1.3) * 2.1 + Math.sin(seconds * .47) * .45,
    barrel: -seconds * .09,
    train: [seconds * .15, -seconds * .24, seconds * .38, -beats * Math.PI / 15],
    winding: [seconds * .42, -seconds * .67],
    balance: Math.sin(phase) * 2.7,
    springScale: 1 + Math.sin(phase) * .045,
    fork: Math.tanh(Math.cos(phase) * 9) * .15,
    // Clockwise as seen from the dial (+Y).
    hands: [-displaySeconds * Math.PI / 21600, -displaySeconds * Math.PI / 1800, -displaySeconds * Math.PI / 30],
    date: Math.floor(displaySeconds / 86400) * Math.PI * 2 / 31,
  };
}
