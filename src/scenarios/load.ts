import type { Stage } from "../helpers/interface.js";

export const loadStages: Stage[] = [
  { duration: "2m", target: 50 }, // ramp up
  { duration: "5m", target: 50 }, // hold
  { duration: "2m", target: 0 }, // ramp down
];
