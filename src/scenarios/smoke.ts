import type { Stage } from "../helpers/interface.js";

export const smokeStages: Stage[] = [
  { duration: "30s", target: 1 },
  { duration: "30s", target: 0 },
];
