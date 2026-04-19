import type { Stage } from "../helpers/interface.js";

export const soakStages: Stage[] = [
  { duration: "2m", target: 50 }, // ramp up
  { duration: "2h", target: 50 }, // hold for a long time to find memory leak
  { duration: "5m", target: 0 }, // ramp down
];
