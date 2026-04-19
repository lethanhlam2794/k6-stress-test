import type { Stage } from "../helpers/interface.js";

export const spikeStages: Stage[] = [
  { duration: "30s", target: 10 }, // baseline
  { duration: "15s", target: 500 }, // spike
  { duration: "1m", target: 10 }, // recover
  { duration: "30s", target: 0 },
];
